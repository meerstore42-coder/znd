import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, loginSchema, insertProductSchema, insertOrderSchema, 
  updateProfileSchema, changePasswordSchema, adminBanUserSchema, adminOrderStatusSchema, 
  adminToggleAdminSchema, insertCategorySchema, insertProductKeySchema,
  requestPasswordResetSchema, resetPasswordSchema, verifyEmailSchema,
  requestEmailChangeSchema, verifyEmailChangeSchema
} from "@shared/schema";
import { 
  sendVerificationEmail, sendPasswordResetEmail, 
  sendEmailChangeVerification, sendMfaEnrollmentNotification 
} from "./email";
import session from "express-session";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import MemoryStore from "memorystore";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(Buffer.from(key, "hex"), derivedKey);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session setup
  const MemoryStoreSession = MemoryStore(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "znd-platform-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Seed default categories if none exist
  const existingCategories = await storage.getAllCategories();
  if (existingCategories.length === 0) {
    await storage.createCategory({
      nameAr: "أدوات برمجية",
      nameEn: "Programming Tools",
      slug: "programming-tools",
      icon: "code",
    });
    await storage.createCategory({
      nameAr: "برامج خارجية",
      nameEn: "External Software",
      slug: "software",
      icon: "package",
    });
    await storage.createCategory({
      nameAr: "بطاقات الألعاب",
      nameEn: "Gaming Cards",
      slug: "gaming-cards",
      icon: "gamepad",
    });
    await storage.createCategory({
      nameAr: "حسابات الألعاب",
      nameEn: "Gaming Accounts",
      slug: "gaming-accounts",
      icon: "user",
    });
  }

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { name, username, email, password } = parsed.data;

      // Check if user exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "اسم المستخدم مستخدم بالفعل" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Create user with verification code (not verified yet)
      const user = await storage.createUser({
        name,
        username,
        email,
        password: hashedPassword,
        isAdmin: false,
        verificationCode,
      });

      // Send verification email
      try {
        await sendVerificationEmail(email, verificationCode, name);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Continue with registration - user can request new code later
      }

      // Set session
      (req.session as any).userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء التسجيل" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { email, password } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }

      // Check if user is OAuth-only (no password set)
      if (!user.password) {
        return res.status(401).json({ message: "هذا الحساب مرتبط بخدمة تسجيل دخول خارجية. استخدم Google أو Discord للدخول." });
      }

      const validPassword = await verifyPassword(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }

      // Check if user is banned
      if (user.isBanned) {
        return res.status(403).json({ message: "تم حظر هذا الحساب" });
      }

      // Set session
      (req.session as any).userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "المستخدم غير موجود" });
      }

      // Check if user is banned
      if (user.isBanned) {
        req.session.destroy(() => {});
        return res.status(403).json({ message: "تم حظر هذا الحساب" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "فشل تسجيل الخروج" });
      }
      res.json({ success: true });
    });
  });

  // Profile update
  app.patch("/api/auth/profile", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      const currentUser = await storage.getUser(userId);
      if (currentUser?.isBanned) {
        req.session.destroy(() => {});
        return res.status(403).json({ message: "تم حظر هذا الحساب" });
      }

      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { name, username } = parsed.data;

      // Check if username is taken by another user
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "اسم المستخدم مستخدم بالفعل" });
      }

      const updatedUser = await storage.updateUser(userId, { name, username });
      if (!updatedUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Password change
  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      const currentUser = await storage.getUser(userId);
      if (currentUser?.isBanned) {
        req.session.destroy(() => {});
        return res.status(403).json({ message: "تم حظر هذا الحساب" });
      }

      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { currentPassword, newPassword } = parsed.data;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      // Verify current password - only if user has a password set
      if (user.password) {
        const validPassword = await verifyPassword(currentPassword, user.password);
        if (!validPassword) {
          return res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة" });
        }
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedPassword });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // ==================== Email Verification Routes ====================
  
  // Send verification email
  app.post("/api/auth/send-verification", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "البريد الإلكتروني مؤكد بالفعل" });
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await storage.updateUser(userId, { verificationCode: code });

      // Send email
      const sent = await sendVerificationEmail(user.email, user.name, code);
      if (!sent) {
        return res.status(500).json({ message: "فشل إرسال البريد الإلكتروني" });
      }

      res.json({ success: true, message: "تم إرسال رمز التحقق" });
    } catch (error: any) {
      console.error("Send verification error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Verify email with code
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول" });
      }

      const parsed = verifyEmailSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "البريد الإلكتروني مؤكد بالفعل" });
      }

      if (user.verificationCode !== parsed.data.code) {
        return res.status(400).json({ message: "رمز التحقق غير صحيح" });
      }

      await storage.updateUser(userId, { isVerified: true, verificationCode: null });
      res.json({ success: true, message: "تم تأكيد البريد الإلكتروني بنجاح" });
    } catch (error: any) {
      console.error("Verify email error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // ==================== Password Reset Routes ====================

  // Request password reset
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const parsed = requestPasswordResetSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const user = await storage.getUserByEmail(parsed.data.email);
      
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ success: true, message: "إذا كان البريد مسجلاً، ستصلك رسالة إعادة التعيين" });
      }

      // Check if user is OAuth-only
      if (!user.password) {
        return res.json({ success: true, message: "إذا كان البريد مسجلاً، ستصلك رسالة إعادة التعيين" });
      }

      // Generate reset token
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.createPasswordResetToken(user.id, token, expiresAt);

      // Build reset URL
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      // Send email
      await sendPasswordResetEmail(user.email, user.name, token, resetUrl);

      res.json({ success: true, message: "إذا كان البريد مسجلاً، ستصلك رسالة إعادة التعيين" });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { token, newPassword } = parsed.data;

      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "رابط إعادة التعيين غير صالح" });
      }

      if (resetToken.usedAt) {
        return res.status(400).json({ message: "تم استخدام هذا الرابط مسبقاً" });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "انتهت صلاحية رابط إعادة التعيين" });
      }

      // Hash new password and update user
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(resetToken.userId, { password: hashedPassword });
      await storage.markPasswordResetTokenUsed(resetToken.id);

      res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // ==================== Email Change Routes ====================

  // Request email change
  app.post("/api/auth/request-email-change", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول" });
      }

      const parsed = requestEmailChangeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { newEmail, password } = parsed.data;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      // Verify password
      if (user.password) {
        const validPassword = await verifyPassword(password, user.password);
        if (!validPassword) {
          return res.status(400).json({ message: "كلمة المرور غير صحيحة" });
        }
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(newEmail);
      if (existingUser) {
        return res.status(400).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.createEmailChangeRequest(userId, newEmail, code, expiresAt);

      // Send verification to new email
      const sent = await sendEmailChangeVerification(newEmail, user.name, code);
      if (!sent) {
        return res.status(500).json({ message: "فشل إرسال البريد الإلكتروني" });
      }

      res.json({ success: true, message: "تم إرسال رمز التحقق إلى البريد الجديد" });
    } catch (error: any) {
      console.error("Request email change error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Verify email change
  app.post("/api/auth/verify-email-change", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول" });
      }

      const parsed = verifyEmailChangeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const request = await storage.getEmailChangeRequest(userId);
      if (!request) {
        return res.status(400).json({ message: "لا يوجد طلب تغيير بريد إلكتروني" });
      }

      if (request.verificationCode !== parsed.data.code) {
        return res.status(400).json({ message: "رمز التحقق غير صحيح" });
      }

      // Update email
      await storage.updateUser(userId, { email: request.newEmail, isVerified: true });
      await storage.verifyEmailChangeRequest(request.id);
      await storage.deleteEmailChangeRequests(userId);

      res.json({ success: true, message: "تم تغيير البريد الإلكتروني بنجاح" });
    } catch (error: any) {
      console.error("Verify email change error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // ==================== MFA Notification ====================

  // Notify MFA enrollment (called after enabling MFA)
  app.post("/api/auth/notify-mfa-enrolled", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      await sendMfaEnrollmentNotification(user.email, user.name);
      res.json({ success: true });
    } catch (error: any) {
      console.error("MFA notification error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // ==================== OAuth Routes ====================
  
  // Google OAuth - Initiate
  app.get("/api/auth/google", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ message: "Google OAuth غير مفعل" });
    }
    
    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex');
    (req.session as any).oauthState = state;
    
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const scope = encodeURIComponent("openid email profile");
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&state=${state}`;
    
    res.redirect(authUrl);
  });

  // Google OAuth - Callback
  app.get("/api/auth/google/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      // Verify state for CSRF protection
      const storedState = (req.session as any).oauthState;
      if (!state || state !== storedState) {
        return res.redirect("/login?error=invalid_state");
      }
      delete (req.session as any).oauthState;
      
      if (!code) {
        return res.redirect("/login?error=no_code");
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return res.redirect("/login?error=oauth_not_configured");
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

      // Exchange code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokens = await tokenResponse.json();
      if (!tokens.access_token) {
        return res.redirect("/login?error=token_exchange_failed");
      }

      // Get user info
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const googleUser = await userInfoResponse.json();
      if (!googleUser.id) {
        return res.redirect("/login?error=user_info_failed");
      }

      // Verify email is verified by Google
      if (!googleUser.verified_email) {
        return res.redirect("/login?error=email_not_verified");
      }

      // Check if user exists by Google ID
      let user = await storage.getUserByGoogleId(googleUser.id);

      if (!user) {
        // Check if user exists by email
        user = await storage.getUserByEmail(googleUser.email);
        
        if (user) {
          // Link Google account to existing user
          await storage.updateUser(user.id, { googleId: googleUser.id, avatar: googleUser.picture });
        } else {
          // Create new user
          const username = `google_${googleUser.id.substring(0, 8)}`;
          user = await storage.createUser({
            name: googleUser.name || "مستخدم Google",
            username,
            email: googleUser.email,
            password: null as any, // OAuth users don't have passwords
            avatar: googleUser.picture,
            googleId: googleUser.id,
            isVerified: true, // Google accounts are verified
          });
        }
      }

      if (user.isBanned) {
        return res.redirect("/login?error=banned");
      }

      // Create session
      (req.session as any).userId = user.id;
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.redirect("/login?error=oauth_failed");
    }
  });

  // Discord OAuth - Initiate
  app.get("/api/auth/discord", (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ message: "Discord OAuth غير مفعل" });
    }
    
    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex');
    (req.session as any).oauthState = state;
    
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/discord/callback`;
    const scope = encodeURIComponent("identify email");
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;
    
    res.redirect(authUrl);
  });

  // Discord OAuth - Callback
  app.get("/api/auth/discord/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      // Verify state for CSRF protection
      const storedState = (req.session as any).oauthState;
      if (!state || state !== storedState) {
        return res.redirect("/login?error=invalid_state");
      }
      delete (req.session as any).oauthState;
      
      if (!code) {
        return res.redirect("/login?error=no_code");
      }

      const clientId = process.env.DISCORD_CLIENT_ID;
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return res.redirect("/login?error=oauth_not_configured");
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/discord/callback`;

      // Exchange code for tokens
      const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokens = await tokenResponse.json();
      if (!tokens.access_token) {
        return res.redirect("/login?error=token_exchange_failed");
      }

      // Get user info
      const userInfoResponse = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const discordUser = await userInfoResponse.json();
      if (!discordUser.id) {
        return res.redirect("/login?error=user_info_failed");
      }

      // Check if user exists by Discord ID
      let user = await storage.getUserByDiscordId(discordUser.id);

      if (!user) {
        // Check if user exists by email
        if (discordUser.email) {
          user = await storage.getUserByEmail(discordUser.email);
        }
        
        if (user) {
          // Link Discord account to existing user
          const avatarUrl = discordUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null;
          await storage.updateUser(user.id, { discordId: discordUser.id, avatar: avatarUrl || user.avatar });
        } else {
          // Create new user
          const username = `discord_${discordUser.id.substring(0, 8)}`;
          const avatarUrl = discordUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null;
          
          // Discord might not provide email if user didn't verify it
          const email = discordUser.email || `${discordUser.id}@discord.placeholder`;
          
          user = await storage.createUser({
            name: discordUser.global_name || discordUser.username || "مستخدم Discord",
            username,
            email,
            password: null as any, // OAuth users don't have passwords
            avatar: avatarUrl,
            discordId: discordUser.id,
            isVerified: !!discordUser.verified,
          });
        }
      }

      if (user.isBanned) {
        return res.redirect("/login?error=banned");
      }

      // Create session
      (req.session as any).userId = user.id;
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Discord OAuth error:", error);
      res.redirect("/login?error=oauth_failed");
    }
  });

  // Check OAuth availability
  app.get("/api/auth/oauth-config", (req, res) => {
    res.json({
      google: !!process.env.GOOGLE_CLIENT_ID,
      discord: !!process.env.DISCORD_CLIENT_ID,
    });
  });

  // Categories Routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Public Stats for Homepage
  app.get("/api/public/stats", async (req, res) => {
    try {
      const stats = await storage.getPublicStats();
      res.json(stats);
    } catch (error) {
      console.error("Get public stats error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Public Reviews/Testimonials
  app.get("/api/public/reviews", async (req, res) => {
    try {
      const reviews = await storage.getApprovedReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Submit a new review (requires login)
  app.post("/api/reviews", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول لإضافة تقييم" });
      }

      const { productId, rating, comment } = req.body;
      
      if (!productId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "بيانات غير صحيحة" });
      }

      const review = await storage.createReview({
        userId,
        productId,
        rating,
        comment: comment || null,
      });

      res.status(201).json({ 
        message: "تم إرسال التقييم بنجاح وسيتم مراجعته", 
        review 
      });
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Stripe Checkout - Create checkout session for product purchase
  app.post("/api/checkout/create-session", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      const currentUser = await storage.getUser(userId);
      if (currentUser?.isBanned) {
        req.session.destroy(() => {});
        return res.status(403).json({ message: "تم حظر هذا الحساب" });
      }

      const { productId } = req.body;

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }

      if (product.stock <= 0) {
        return res.status(400).json({ message: "المنتج غير متوفر" });
      }

      // Release expired reservations first
      await storage.releaseExpiredReservations();

      const availableKey = await storage.getAvailableKey(productId);
      if (!availableKey) {
        return res.status(400).json({ message: "لا توجد مفاتيح متاحة لهذا المنتج" });
      }

      const stripe = await getUncachableStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.titleEn || product.titleAr,
              description: product.descriptionEn?.slice(0, 500) || product.descriptionAr?.slice(0, 500),
            },
            unit_amount: Math.round(parseFloat(product.price) * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&product_id=${productId}`,
        cancel_url: `${baseUrl}/product/${productId}`,
        metadata: {
          userId,
          productId,
          productKeyId: availableKey.id,
        },
      });

      // Reserve the key for this session to prevent overselling
      await storage.reserveKey(availableKey.id, session.id);

      res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
      console.error("Create checkout session error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء جلسة الدفع" });
    }
  });

  // Stripe Checkout Success - Verify order status (fulfillment happens via webhook)
  app.post("/api/checkout/complete", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ message: "جلسة غير صالحة" });
      }

      // Check if order already exists for this session
      const existingOrder = await storage.getOrderByStripeSession(sessionId);
      if (existingOrder) {
        return res.json({ 
          success: true, 
          orderId: existingOrder.id,
          message: "تم إكمال الطلب بنجاح! تم إضافة المنتج إلى خزنتك الرقمية."
        });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      // Verify session belongs to this user
      const sessionUserId = session.metadata?.userId;
      if (sessionUserId !== userId) {
        return res.status(403).json({ message: "جلسة غير صالحة" });
      }

      // If payment was successful but order not yet created (webhook pending)
      if (session.payment_status === 'paid') {
        return res.json({ 
          success: false, 
          pending: true,
          message: "جاري معالجة الطلب..."
        });
      }

      return res.status(400).json({ message: "الدفع لم يكتمل" });
    } catch (error) {
      console.error("Complete checkout error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء التحقق من الطلب" });
    }
  });

  // Check order status by session ID (for polling)
  app.get("/api/checkout/status/:sessionId", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      const { sessionId } = req.params;
      
      const existingOrder = await storage.getOrderByStripeSession(sessionId);
      if (existingOrder) {
        return res.json({ 
          status: "completed",
          orderId: existingOrder.id
        });
      }

      // Check Stripe session status
      try {
        const stripe = await getUncachableStripeClient();
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.metadata?.userId !== userId) {
          return res.status(403).json({ message: "جلسة غير صالحة" });
        }

        return res.json({
          status: session.payment_status === 'paid' ? 'paid_pending_fulfillment' : session.payment_status
        });
      } catch {
        return res.json({ status: "unknown" });
      }
    } catch (error) {
      console.error("Check status error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Get Stripe publishable key for frontend
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Get Stripe config error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Products Routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Vault Routes - Get user's purchased digital items
  app.get("/api/vault", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      const currentUser = await storage.getUser(userId);
      if (currentUser?.isBanned) {
        req.session.destroy(() => {});
        return res.status(403).json({ message: "تم حظر هذا الحساب" });
      }

      const vaultItems = await storage.getVaultItems(userId);
      res.json(vaultItems);
    } catch (error) {
      console.error("Get vault error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Orders Routes
  app.get("/api/orders/my", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      const currentUser = await storage.getUser(userId);
      if (currentUser?.isBanned) {
        req.session.destroy(() => {});
        return res.status(403).json({ message: "تم حظر هذا الحساب" });
      }

      const orders = await storage.getOrdersByUser(userId);
      
      // Get product info for each order
      const ordersWithProducts = await Promise.all(
        orders.map(async (order) => {
          const product = await storage.getProduct(order.productId);
          return { ...order, product };
        })
      );

      res.json(ordersWithProducts);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      const currentUser = await storage.getUser(userId);
      if (currentUser?.isBanned) {
        req.session.destroy(() => {});
        return res.status(403).json({ message: "تم حظر هذا الحساب" });
      }

      const { productId, paymentMethod, totalAmount } = req.body;

      // SECURITY: Card payments MUST go through Stripe checkout
      if (paymentMethod === "card") {
        return res.status(400).json({ 
          message: "يجب استخدام Stripe للدفع بالبطاقة",
          redirect: "/api/checkout/create-session"
        });
      }

      // Only USDT payments allowed through this endpoint
      if (paymentMethod !== "usdt") {
        return res.status(400).json({ message: "طريقة دفع غير مدعومة" });
      }

      // Verify product exists and has stock
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }

      if (product.stock <= 0) {
        return res.status(400).json({ message: "المنتج غير متوفر" });
      }

      // Check for available digital key
      const availableKey = await storage.getAvailableKey(productId);
      if (!availableKey) {
        return res.status(400).json({ message: "لا توجد مفاتيح متاحة لهذا المنتج" });
      }

      // Create pending USDT order (admin must manually approve after payment verification)
      const order = await storage.createOrder({
        userId,
        productId,
        paymentMethod,
        totalAmount: product.price,
      });

      // Note: USDT orders stay "pending" until admin manually confirms payment and completes them
      res.json(order);
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء الطلب" });
    }
  });

  // Authentication middleware with ban check
  const isAuthenticated = async (req: any, res: any, next: any) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "غير مسجل الدخول" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "المستخدم غير موجود" });
    }

    if (user.isBanned) {
      req.session.destroy(() => {});
      return res.status(403).json({ message: "تم حظر هذا الحساب" });
    }

    req.user = user;
    next();
  };

  // Admin Routes
  const isAdmin = async (req: any, res: any, next: any) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "غير مسجل الدخول" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(403).json({ message: "غير مصرح" });
    }

    if (user.isBanned) {
      req.session.destroy(() => {});
      return res.status(403).json({ message: "تم حظر هذا الحساب" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "غير مصرح" });
    }

    next();
  };

  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.post("/api/admin/products", isAdmin, async (req, res) => {
    try {
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const product = await storage.createProduct(parsed.data);
      res.json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء المنتج" });
    }
  });

  app.patch("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.delete("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Admin User Management Routes
  app.get("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.patch("/api/admin/users/:id/ban", isAdmin, async (req, res) => {
    try {
      const parsed = adminBanUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      
      const { isBanned } = parsed.data;
      const user = await storage.updateUser(req.params.id, { isBanned });
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Ban user error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.patch("/api/admin/users/:id/admin", isAdmin, async (req, res) => {
    try {
      const parsed = adminToggleAdminSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      
      const { isAdmin: makeAdmin } = parsed.data;
      const user = await storage.updateUser(req.params.id, { isAdmin: makeAdmin });
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update admin status error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Admin Order Management Routes
  app.get("/api/admin/orders/:id", isAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }
      res.json(order);
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.patch("/api/admin/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const parsed = adminOrderStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      
      const { status } = parsed.data;
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }

      // Prevent re-processing completed or cancelled orders
      if (order.status !== "pending") {
        return res.status(400).json({ message: "لا يمكن تعديل حالة الطلب المكتمل أو الملغي" });
      }

      // If completing order, create digital item
      if (status === "completed") {
        const product = await storage.getProduct(order.productId);
        if (!product || product.stock <= 0) {
          return res.status(400).json({ message: "المنتج غير متوفر في المخزون" });
        }
        
        await storage.updateProduct(order.productId, { stock: product.stock - 1 });
        await storage.createDigitalItem({
          orderId: order.id,
          content: `LICENSE-KEY-${order.id.slice(0, 8).toUpperCase()}`,
          type: "key",
        });
      }

      await storage.updateOrderStatus(req.params.id, status);
      const updatedOrder = await storage.getOrder(req.params.id);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // ==================== Admin Category Management ====================
  app.post("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      const parsed = insertCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      // Check if slug already exists
      const existing = await storage.getCategoryBySlug(parsed.data.slug);
      if (existing) {
        return res.status(400).json({ message: "هذا الاسم المختصر مستخدم بالفعل" });
      }

      const category = await storage.createCategory(parsed.data);
      res.json(category);
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء التصنيف" });
    }
  });

  app.patch("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ message: "التصنيف غير موجود" });
      }
      res.json(category);
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.delete("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // ==================== Admin Reviews Management ====================
  app.get("/api/admin/reviews", isAdmin, async (req, res) => {
    try {
      const reviews = await storage.getAllReviewsWithDetails();
      res.json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.patch("/api/admin/reviews/:id/approve", isAdmin, async (req, res) => {
    try {
      const review = await storage.approveReview(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "المراجعة غير موجودة" });
      }
      res.json(review);
    } catch (error) {
      console.error("Approve review error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.patch("/api/admin/reviews/:id/reject", isAdmin, async (req, res) => {
    try {
      const review = await storage.rejectReview(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "المراجعة غير موجودة" });
      }
      res.json(review);
    } catch (error) {
      console.error("Reject review error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.delete("/api/admin/reviews/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteReview(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete review error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // ==================== Admin Product Keys Management ====================
  app.get("/api/admin/product-keys", isAdmin, async (req, res) => {
    try {
      const keys = await storage.getAllProductKeys();
      res.json(keys);
    } catch (error) {
      console.error("Get product keys error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.get("/api/admin/product-keys/:productId", isAdmin, async (req, res) => {
    try {
      const keys = await storage.getProductKeysByProduct(req.params.productId);
      res.json(keys);
    } catch (error) {
      console.error("Get product keys error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  app.post("/api/admin/product-keys", isAdmin, async (req, res) => {
    try {
      const parsed = insertProductKeySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      // Verify product exists
      const product = await storage.getProduct(parsed.data.productId);
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }

      const key = await storage.createProductKey(parsed.data);
      
      // Update product stock
      await storage.updateProduct(parsed.data.productId, { stock: product.stock + 1 });
      
      res.json(key);
    } catch (error) {
      console.error("Create product key error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء المفتاح" });
    }
  });

  app.delete("/api/admin/product-keys/:id", isAdmin, async (req, res) => {
    try {
      // Get the key to find its product and check if unused
      const keys = await storage.getAllProductKeys();
      const keyToDelete = keys.find(k => k.id === req.params.id);
      
      if (keyToDelete && !keyToDelete.isUsed) {
        // Decrement product stock
        const product = await storage.getProduct(keyToDelete.productId);
        if (product && product.stock > 0) {
          await storage.updateProduct(keyToDelete.productId, { stock: product.stock - 1 });
        }
      }
      
      await storage.deleteProductKey(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete product key error:", error);
      res.status(500).json({ message: "حدث خطأ" });
    }
  });

  // Make first registered user an admin (for demo purposes)
  const allUsers = await storage.getAllUsers();
  if (allUsers.length === 0) {
    // Create demo admin user
    const hashedPassword = await hashPassword("admin123");
    await storage.createUser({
      name: "مدير النظام",
      username: "admin",
      email: "admin@znd.com",
      password: hashedPassword,
      isAdmin: true,
    });
    console.log("Demo admin created: admin@znd.com / admin123");
  }

  return httpServer;
}
