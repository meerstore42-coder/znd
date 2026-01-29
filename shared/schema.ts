import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - includes both regular users and admins
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"), // Optional for OAuth users
  avatar: text("avatar"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  verificationCode: text("verification_code"),
  // OAuth provider IDs
  googleId: text("google_id").unique(),
  discordId: text("discord_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product categories
export const categories = pgTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionAr: text("description_ar").notNull(),
  descriptionEn: text("description_en").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  image: text("image"),
  categoryId: varchar("category_id", { length: 36 }).references(() => categories.id),
  stock: integer("stock").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  productId: varchar("product_id", { length: 36 }).references(() => products.id).notNull(),
  status: text("status").default("pending").notNull(), // pending, completed, cancelled
  paymentMethod: text("payment_method").notNull(), // usdt, card
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  stripeSessionId: text("stripe_session_id"), // For Stripe checkout idempotency
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Digital files/keys for purchased products
export const digitalItems = pgTable("digital_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id", { length: 36 }).references(() => orders.id).notNull(),
  content: text("content").notNull(), // Encrypted content (key, download link, etc.)
  type: text("type").notNull(), // key, file, account
});

// Site statistics for admin dashboard
export const siteStats = pgTable("site_stats", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").defaultNow().notNull(),
  visitors: integer("visitors").default(0).notNull(),
  sales: integer("sales").default(0).notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0").notNull(),
});

// Customer reviews/testimonials
export const reviews = pgTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  productId: varchar("product_id", { length: 36 }).references(() => products.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Email change requests
export const emailChangeRequests = pgTable("email_change_requests", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  newEmail: text("new_email").notNull(),
  verificationCode: text("verification_code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product digital keys/content inventory
export const productKeys = pgTable("product_keys", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id", { length: 36 }).references(() => products.id).notNull(),
  keyContent: text("key_content").notNull(), // The actual key, code, or credentials
  isUsed: boolean("is_used").default(false).notNull(),
  isReserved: boolean("is_reserved").default(false).notNull(), // Reserved during checkout
  reservedSessionId: text("reserved_session_id"), // Stripe session ID that reserved this key
  reservedAt: timestamp("reserved_at"), // When the key was reserved
  usedByOrderId: varchar("used_by_order_id", { length: 36 }).references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const productKeysRelations = relations(productKeys, ({ one }) => ({
  product: one(products, {
    fields: [productKeys.productId],
    references: [products.id],
  }),
  usedByOrder: one(orders, {
    fields: [productKeys.usedByOrderId],
    references: [orders.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  digitalItems: many(digitalItems),
}));

export const digitalItemsRelations = relations(digitalItems, ({ one }) => ({
  order: one(orders, {
    fields: [digitalItems.orderId],
    references: [orders.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isVerified: true,
  verificationCode: true,
}).extend({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertDigitalItemSchema = createInsertSchema(digitalItems).omit({
  id: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  isApproved: true,
}).extend({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const insertProductKeySchema = createInsertSchema(productKeys).omit({
  id: true,
  createdAt: true,
  isUsed: true,
  usedByOrderId: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

// Profile update schema
export const updateProfileSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
});

// Password change schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
  newPassword: z.string().min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"),
});

// Admin ban user schema
export const adminBanUserSchema = z.object({
  isBanned: z.boolean(),
});

// Admin update order status schema
export const adminOrderStatusSchema = z.object({
  status: z.enum(["pending", "completed", "cancelled"]),
});

// Admin toggle admin schema
export const adminToggleAdminSchema = z.object({
  isAdmin: z.boolean(),
});

// Password reset request schema
export const requestPasswordResetSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
});

// Password reset schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "رمز إعادة التعيين مطلوب"),
  newPassword: z.string().min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"),
});

// Email verification schema
export const verifyEmailSchema = z.object({
  code: z.string().length(6, "رمز التحقق يجب أن يكون 6 أرقام"),
});

// Email change request schema
export const requestEmailChangeSchema = z.object({
  newEmail: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

// Email change verification schema
export const verifyEmailChangeSchema = z.object({
  code: z.string().length(6, "رمز التحقق يجب أن يكون 6 أرقام"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertDigitalItem = z.infer<typeof insertDigitalItemSchema>;
export type DigitalItem = typeof digitalItems.$inferSelect;
export type SiteStats = typeof siteStats.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertProductKey = z.infer<typeof insertProductKeySchema>;
export type ProductKey = typeof productKeys.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type EmailChangeRequest = typeof emailChangeRequests.$inferSelect;
