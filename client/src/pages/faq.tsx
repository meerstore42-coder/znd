import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FAQItem {
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "general",
    questionAr: "ما هي منصة زند؟",
    questionEn: "What is ZND Platform?",
    answerAr: "منصة زند هي سوق رقمي موثوق لشراء أدوات البرمجة والبرامج وبطاقات الألعاب وحسابات الألعاب. نوفر منتجات أصلية بأسعار تنافسية مع تسليم فوري.",
    answerEn: "ZND Platform is a trusted digital marketplace for purchasing programming tools, software, gaming cards, and gaming accounts. We provide genuine products at competitive prices with instant delivery.",
  },
  {
    category: "general",
    questionAr: "هل المنتجات أصلية؟",
    questionEn: "Are the products genuine?",
    answerAr: "نعم، جميع منتجاتنا أصلية 100% ومضمونة. نحصل على منتجاتنا من مصادر موثوقة ومعتمدة.",
    answerEn: "Yes, all our products are 100% genuine and guaranteed. We source our products from trusted and authorized sources.",
  },
  {
    category: "payment",
    questionAr: "ما هي طرق الدفع المتاحة؟",
    questionEn: "What payment methods are available?",
    answerAr: "نقبل الدفع عبر USDT (TRC20) وبطاقات الائتمان (Visa, Mastercard). جميع المعاملات مشفرة وآمنة.",
    answerEn: "We accept payment via USDT (TRC20) and credit cards (Visa, Mastercard). All transactions are encrypted and secure.",
  },
  {
    category: "payment",
    questionAr: "هل الدفع آمن؟",
    questionEn: "Is the payment secure?",
    answerAr: "نعم، نستخدم أحدث تقنيات التشفير لحماية معلومات الدفع الخاصة بك. لا نحتفظ ببيانات بطاقتك الائتمانية.",
    answerEn: "Yes, we use the latest encryption technologies to protect your payment information. We do not store your credit card data.",
  },
  {
    category: "delivery",
    questionAr: "كم يستغرق التسليم؟",
    questionEn: "How long does delivery take?",
    answerAr: "التسليم فوري! بمجرد إتمام الدفع، ستجد المنتج في خزنتك الشخصية خلال ثوانٍ.",
    answerEn: "Delivery is instant! Once payment is completed, you'll find the product in your personal vault within seconds.",
  },
  {
    category: "delivery",
    questionAr: "أين أجد مشترياتي؟",
    questionEn: "Where do I find my purchases?",
    answerAr: "جميع مشترياتك متاحة في لوحة التحكم الخاصة بك ضمن قسم 'الخزنة الآمنة'. يمكنك الوصول إليها في أي وقت.",
    answerEn: "All your purchases are available in your dashboard under the 'Secure Vault' section. You can access them anytime.",
  },
  {
    category: "account",
    questionAr: "كيف أنشئ حساب؟",
    questionEn: "How do I create an account?",
    answerAr: "انقر على 'إنشاء حساب' وأدخل بياناتك الأساسية. العملية سريعة وسهلة وتستغرق أقل من دقيقة.",
    answerEn: "Click on 'Create Account' and enter your basic information. The process is quick and easy, taking less than a minute.",
  },
  {
    category: "account",
    questionAr: "نسيت كلمة المرور، ماذا أفعل؟",
    questionEn: "I forgot my password, what do I do?",
    answerAr: "انقر على 'نسيت كلمة المرور' في صفحة تسجيل الدخول وأدخل بريدك الإلكتروني. ستتلقى رابط إعادة تعيين كلمة المرور.",
    answerEn: "Click on 'Forgot Password' on the login page and enter your email. You will receive a password reset link.",
  },
  {
    category: "support",
    questionAr: "كيف أتواصل مع الدعم؟",
    questionEn: "How do I contact support?",
    answerAr: "يمكنك التواصل معنا عبر صفحة 'اتصل بنا' أو إرسال بريد إلكتروني إلى support@znd.com. فريقنا متاح 24/7.",
    answerEn: "You can contact us through the 'Contact Us' page or send an email to support@znd.com. Our team is available 24/7.",
  },
  {
    category: "support",
    questionAr: "هل يمكنني استرداد أموالي؟",
    questionEn: "Can I get a refund?",
    answerAr: "نعم، نقدم ضمان استرداد الأموال خلال 24 ساعة من الشراء إذا كان المنتج معيباً أو لا يعمل بشكل صحيح.",
    answerEn: "Yes, we offer a money-back guarantee within 24 hours of purchase if the product is defective or not working properly.",
  },
];

const categories = [
  { id: "all", labelAr: "الكل", labelEn: "All" },
  { id: "general", labelAr: "عام", labelEn: "General" },
  { id: "payment", labelAr: "الدفع", labelEn: "Payment" },
  { id: "delivery", labelAr: "التسليم", labelEn: "Delivery" },
  { id: "account", labelAr: "الحساب", labelEn: "Account" },
  { id: "support", labelAr: "الدعم", labelEn: "Support" },
];

export default function FAQ() {
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFAQ = faqData.filter((item) => {
    const question = language === "ar" ? item.questionAr : item.questionEn;
    const answer = language === "ar" ? item.answerAr : item.answerEn;
    const matchesSearch = question.toLowerCase().includes(search.toLowerCase()) ||
      answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 animated-gradient-bg opacity-20" />
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-6 pulse-glow">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 neon-text" data-testid="text-faq-title">
                {t("الأسئلة الشائعة", "Frequently Asked Questions")}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t(
                  "إجابات على أكثر الأسئلة شيوعاً",
                  "Answers to the most commonly asked questions"
                )}
              </p>
              <div className="relative max-w-md mx-auto">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={t("ابحث في الأسئلة...", "Search questions...")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input ps-12"
                  data-testid="input-search-faq"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "glass hover-elevate"
                  )}
                  data-testid={`button-category-${cat.id}`}
                >
                  {t(cat.labelAr, cat.labelEn)}
                </button>
              ))}
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {filteredFAQ.length > 0 ? (
                filteredFAQ.map((item, index) => (
                  <div
                    key={index}
                    className="glass-card rounded-2xl overflow-hidden"
                  >
                    <button
                      className="w-full p-6 flex items-center justify-between text-start"
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      data-testid={`button-faq-${index}`}
                    >
                      <span className="font-semibold pe-4">
                        {t(item.questionAr, item.questionEn)}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 flex-shrink-0 transition-transform",
                          openIndex === index && "rotate-180"
                        )}
                      />
                    </button>
                    {openIndex === index && (
                      <div className="px-6 pb-6 text-muted-foreground">
                        {t(item.answerAr, item.answerEn)}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {t("لم يتم العثور على نتائج", "No results found")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
