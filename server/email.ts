import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'ZND Platform <onboarding@resend.dev>';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, name: string, code: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', Arial, sans-serif; background: #000; color: #fff; padding: 20px; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; background: #111; border-radius: 12px; padding: 40px; border: 1px solid #222; }
        .logo { text-align: center; color: #0ea5e9; font-size: 28px; font-weight: bold; margin-bottom: 30px; }
        .code { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: #fff; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 30px 0; }
        .message { color: #a1a1aa; font-size: 16px; line-height: 1.8; text-align: center; }
        .footer { color: #71717a; font-size: 14px; text-align: center; margin-top: 40px; border-top: 1px solid #222; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">منصة زند</div>
        <p class="message">مرحباً ${name}،</p>
        <p class="message">شكراً لتسجيلك في منصة زند. استخدم الرمز التالي لتأكيد بريدك الإلكتروني:</p>
        <div class="code">${code}</div>
        <p class="message">هذا الرمز صالح لمدة 24 ساعة.</p>
        <p class="message">إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد.</p>
        <div class="footer">
          منصة زند - متجرك الرقمي الموثوق<br>
          © 2026 جميع الحقوق محفوظة
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'تأكيد البريد الإلكتروني - منصة زند',
    html,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, resetToken: string, resetUrl: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', Arial, sans-serif; background: #000; color: #fff; padding: 20px; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; background: #111; border-radius: 12px; padding: 40px; border: 1px solid #222; }
        .logo { text-align: center; color: #0ea5e9; font-size: 28px; font-weight: bold; margin-bottom: 30px; }
        .button { display: block; background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: #fff; font-size: 18px; font-weight: bold; text-align: center; padding: 16px 32px; border-radius: 8px; text-decoration: none; margin: 30px auto; max-width: 250px; }
        .message { color: #a1a1aa; font-size: 16px; line-height: 1.8; text-align: center; }
        .warning { color: #f59e0b; font-size: 14px; text-align: center; margin-top: 20px; }
        .footer { color: #71717a; font-size: 14px; text-align: center; margin-top: 40px; border-top: 1px solid #222; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">منصة زند</div>
        <p class="message">مرحباً ${name}،</p>
        <p class="message">تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
        <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
        <p class="warning">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
        <p class="message">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.</p>
        <div class="footer">
          منصة زند - متجرك الرقمي الموثوق<br>
          © 2026 جميع الحقوق محفوظة
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'إعادة تعيين كلمة المرور - منصة زند',
    html,
  });
}

export async function sendEmailChangeVerification(email: string, name: string, code: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', Arial, sans-serif; background: #000; color: #fff; padding: 20px; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; background: #111; border-radius: 12px; padding: 40px; border: 1px solid #222; }
        .logo { text-align: center; color: #0ea5e9; font-size: 28px; font-weight: bold; margin-bottom: 30px; }
        .code { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: #fff; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 30px 0; }
        .message { color: #a1a1aa; font-size: 16px; line-height: 1.8; text-align: center; }
        .warning { color: #f59e0b; font-size: 14px; text-align: center; margin-top: 20px; }
        .footer { color: #71717a; font-size: 14px; text-align: center; margin-top: 40px; border-top: 1px solid #222; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">منصة زند</div>
        <p class="message">مرحباً ${name}،</p>
        <p class="message">تلقينا طلباً لتغيير بريدك الإلكتروني إلى هذا العنوان. استخدم الرمز التالي للتأكيد:</p>
        <div class="code">${code}</div>
        <p class="warning">هذا الرمز صالح لمدة ساعة واحدة فقط.</p>
        <p class="message">إذا لم تطلب هذا التغيير، يرجى تجاهل هذا البريد.</p>
        <div class="footer">
          منصة زند - متجرك الرقمي الموثوق<br>
          © 2026 جميع الحقوق محفوظة
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'تأكيد تغيير البريد الإلكتروني - منصة زند',
    html,
  });
}

export async function sendMfaEnrollmentNotification(email: string, name: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', Arial, sans-serif; background: #000; color: #fff; padding: 20px; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; background: #111; border-radius: 12px; padding: 40px; border: 1px solid #222; }
        .logo { text-align: center; color: #0ea5e9; font-size: 28px; font-weight: bold; margin-bottom: 30px; }
        .alert { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; font-size: 18px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .message { color: #a1a1aa; font-size: 16px; line-height: 1.8; text-align: center; }
        .warning { color: #f59e0b; font-size: 14px; text-align: center; margin-top: 20px; padding: 15px; background: #1a1a1a; border-radius: 8px; }
        .footer { color: #71717a; font-size: 14px; text-align: center; margin-top: 40px; border-top: 1px solid #222; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">منصة زند</div>
        <p class="message">مرحباً ${name}،</p>
        <div class="alert">✓ تم تفعيل المصادقة الثنائية</div>
        <p class="message">تم تفعيل المصادقة الثنائية بنجاح على حسابك. الآن حسابك محمي بطبقة أمان إضافية.</p>
        <p class="warning">⚠️ إذا لم تقم بهذا الإجراء، يرجى الاتصال بنا فوراً على support@znd.com</p>
        <div class="footer">
          منصة زند - متجرك الرقمي الموثوق<br>
          © 2026 جميع الحقوق محفوظة
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'تم تفعيل المصادقة الثنائية - منصة زند',
    html,
  });
}
