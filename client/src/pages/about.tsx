import { useLanguage } from "@/lib/language-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Shield, Zap, Users, Award, Target, Heart } from "lucide-react";

export default function About() {
  const { t } = useLanguage();

  const values = [
    {
      icon: Shield,
      titleAr: "الأمان أولاً",
      titleEn: "Security First",
      descAr: "نضمن حماية بياناتك ومشترياتك بأعلى معايير الأمان",
      descEn: "We ensure your data and purchases are protected with the highest security standards",
    },
    {
      icon: Zap,
      titleAr: "تسليم فوري",
      titleEn: "Instant Delivery",
      descAr: "احصل على منتجاتك الرقمية فوراً بعد إتمام الدفع",
      descEn: "Get your digital products instantly after completing payment",
    },
    {
      icon: Users,
      titleAr: "دعم متواصل",
      titleEn: "24/7 Support",
      descAr: "فريق دعم متخصص متاح على مدار الساعة لمساعدتك",
      descEn: "Specialized support team available around the clock to help you",
    },
    {
      icon: Award,
      titleAr: "منتجات أصلية",
      titleEn: "Genuine Products",
      descAr: "جميع منتجاتنا أصلية ومضمونة 100%",
      descEn: "All our products are 100% genuine and guaranteed",
    },
  ];

  const stats = [
    { valueAr: "+10,000", valueEn: "10,000+", labelAr: "عميل سعيد", labelEn: "Happy Customers" },
    { valueAr: "+50,000", valueEn: "50,000+", labelAr: "طلب مكتمل", labelEn: "Completed Orders" },
    { valueAr: "+500", valueEn: "500+", labelAr: "منتج رقمي", labelEn: "Digital Products" },
    { valueAr: "24/7", valueEn: "24/7", labelAr: "دعم فني", labelEn: "Technical Support" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 animated-gradient-bg opacity-20" />
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 neon-text" data-testid="text-about-title">
                {t("من نحن", "About Us")}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t(
                  "منصة زند هي وجهتك الموثوقة للمنتجات الرقمية. نقدم أدوات البرمجة والبرامج وبطاقات الألعاب وحسابات الألعاب بأسعار تنافسية وجودة عالية.",
                  "ZND Platform is your trusted destination for digital products. We offer programming tools, software, gaming cards, and gaming accounts at competitive prices with high quality."
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="glass-card rounded-2xl p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {t(stat.valueAr, stat.valueEn)}
                  </div>
                  <div className="text-muted-foreground">
                    {t(stat.labelAr, stat.labelEn)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t("قيمنا", "Our Values")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t(
                  "نلتزم بمجموعة من القيم الأساسية التي توجه كل ما نقوم به",
                  "We are committed to a set of core values that guide everything we do"
                )}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="glass-card rounded-2xl p-6">
                  <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {t(value.titleAr, value.titleEn)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(value.descAr, value.descEn)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="liquid-glass rounded-3xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-8 w-8 text-primary" />
                    <h2 className="text-2xl font-bold">{t("رؤيتنا", "Our Vision")}</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(
                      "نسعى لأن نكون المنصة الرائدة في العالم العربي لتوفير المنتجات الرقمية بطريقة آمنة وسهلة، مع التركيز على تجربة مستخدم استثنائية.",
                      "We aim to be the leading platform in the Arab world for providing digital products in a safe and easy way, with a focus on exceptional user experience."
                    )}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                    <h2 className="text-2xl font-bold">{t("مهمتنا", "Our Mission")}</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(
                      "تمكين المستخدمين من الوصول إلى أفضل الأدوات والبرامج الرقمية بأسعار عادلة، مع ضمان أعلى مستويات الأمان والموثوقية.",
                      "Empowering users to access the best digital tools and software at fair prices, while ensuring the highest levels of security and reliability."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
