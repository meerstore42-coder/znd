import { useLanguage } from "@/lib/language-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Shield, Lock, Eye, Database, Bell, Users } from "lucide-react";

export default function Privacy() {
  const { t, language } = useLanguage();

  const sections = [
    {
      icon: Database,
      titleAr: "جمع البيانات",
      titleEn: "Data Collection",
      contentAr: "نقوم بجمع المعلومات الضرورية فقط لتقديم خدماتنا، بما في ذلك الاسم والبريد الإلكتروني ومعلومات الدفع. لا نبيع أو نشارك بياناتك مع أطراف ثالثة.",
      contentEn: "We only collect information necessary to provide our services, including name, email, and payment information. We do not sell or share your data with third parties.",
    },
    {
      icon: Lock,
      titleAr: "أمان البيانات",
      titleEn: "Data Security",
      contentAr: "نستخدم تشفير SSL/TLS لحماية جميع البيانات المنقولة. يتم تخزين كلمات المرور بشكل مشفر ولا يمكن لأي شخص الوصول إليها.",
      contentEn: "We use SSL/TLS encryption to protect all transmitted data. Passwords are stored encrypted and no one can access them.",
    },
    {
      icon: Eye,
      titleAr: "استخدام البيانات",
      titleEn: "Data Usage",
      contentAr: "نستخدم بياناتك لتحسين تجربة التسوق، معالجة الطلبات، وإرسال التحديثات المهمة. يمكنك إلغاء الاشتراك في أي وقت.",
      contentEn: "We use your data to improve shopping experience, process orders, and send important updates. You can unsubscribe at any time.",
    },
    {
      icon: Users,
      titleAr: "حقوقك",
      titleEn: "Your Rights",
      contentAr: "لديك الحق في الوصول إلى بياناتك، تعديلها، أو حذفها في أي وقت. تواصل معنا لأي استفسارات تتعلق بخصوصيتك.",
      contentEn: "You have the right to access, modify, or delete your data at any time. Contact us for any privacy-related inquiries.",
    },
    {
      icon: Bell,
      titleAr: "ملفات تعريف الارتباط",
      titleEn: "Cookies",
      contentAr: "نستخدم ملفات تعريف الارتباط لتحسين تجربة المستخدم وتذكر تفضيلاتك. يمكنك إدارة إعدادات الكوكيز من متصفحك.",
      contentEn: "We use cookies to improve user experience and remember your preferences. You can manage cookie settings from your browser.",
    },
    {
      icon: Shield,
      titleAr: "التحديثات",
      titleEn: "Updates",
      contentAr: "قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإعلامك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع.",
      contentEn: "We may update the privacy policy from time to time. We will notify you of any significant changes via email or site notification.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 animated-gradient-bg opacity-30" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4 neon-text" data-testid="text-privacy-title">
                {t("سياسة الخصوصية", "Privacy Policy")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t(
                  "نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية",
                  "We respect your privacy and are committed to protecting your personal data"
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {sections.map((section, index) => (
                <div key={index} className="liquid-glass rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <section.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-2">
                        {language === "ar" ? section.titleAr : section.titleEn}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {language === "ar" ? section.contentAr : section.contentEn}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center pt-8">
                <p className="text-sm text-muted-foreground">
                  {t("آخر تحديث: يناير 2024", "Last updated: January 2024")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
