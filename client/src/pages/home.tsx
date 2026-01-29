import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, Sparkles, Shield, Zap, CreditCard, Star, Users, Globe, Headphones, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Product, Category } from "@shared/schema";
import { 
  SiGithub, SiPython, SiJavascript, SiReact, SiNodedotjs,
  SiSteam, SiPlaystation, SiNintendoswitch, SiEpicgames, SiRiotgames,
  SiUnity, SiUnrealengine, SiDocker, SiAmazon, SiApple, SiTypescript, SiGooglecloud, SiTwitch
} from "react-icons/si";

export default function Home() {
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: publicStats } = useQuery<{ totalProducts: number; totalCustomers: number; satisfactionRate: number; totalOrders: number; totalSalesAmount: number }>({
    queryKey: ["/api/public/stats"],
  });

  const { data: reviews } = useQuery<Array<{
    id: string;
    rating: number;
    comment: string | null;
    user: { name: string; avatar: string | null };
    product: { titleAr: string; titleEn: string } | null;
    createdAt: string;
  }>>({
    queryKey: ["/api/public/reviews"],
  });

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen flex flex-col bg-background animated-gradient-bg">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section with Liquid Glass */}
        <section className="relative overflow-hidden py-24 md:py-36">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Floating Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass float-animation">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {t("منصة موثوقة وآمنة", "Trusted & Secure Platform")}
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight fade-in">
                <span className="text-gradient-blue neon-text">{t("منصة زند", "ZND Platform")}</span>
                <br />
                <span className="text-foreground">
                  {t("سوقك الرقمي المتكامل", "Your Complete Digital Marketplace")}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto fade-in stagger-1" style={{ opacity: 0 }}>
                {t(
                  "اكتشف أفضل الأدوات البرمجية والبرامج وبطاقات الألعاب والحسابات بأسعار تنافسية وأمان تام.",
                  "Discover the best programming tools, software, gaming cards, and accounts at competitive prices with complete security."
                )}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in stagger-2" style={{ opacity: 0 }}>
                <Button 
                  size="lg" 
                  className="gap-2 glass-button text-white font-semibold" 
                  onClick={() => setLocation("/products")} 
                  data-testid="button-browse-products"
                >
                  {t("تصفح المنتجات", "Browse Products")}
                  <ArrowIcon className="h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="glass" 
                  onClick={() => setLocation("/register")} 
                  data-testid="button-get-started"
                >
                  {t("ابدأ الآن", "Get Started")}
                </Button>
              </div>

              {/* Floating Icons Grid */}
              <div className="relative py-12 mt-8">
                <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                  {[
                    { Icon: SiGithub, color: "#fff", bg: "from-gray-800 to-gray-900" },
                    { Icon: SiTypescript, color: "#3178C6", bg: "from-blue-600 to-blue-800" },
                    { Icon: SiPython, color: "#3776AB", bg: "from-yellow-500 to-blue-600" },
                    { Icon: SiJavascript, color: "#F7DF1E", bg: "from-yellow-400 to-yellow-600" },
                    { Icon: SiReact, color: "#61DAFB", bg: "from-cyan-500 to-cyan-700" },
                    { Icon: SiNodedotjs, color: "#339933", bg: "from-green-500 to-green-700" },
                    { Icon: SiSteam, color: "#fff", bg: "from-gray-700 to-gray-900" },
                    { Icon: SiPlaystation, color: "#003791", bg: "from-blue-700 to-blue-900" },
                    { Icon: SiTwitch, color: "#9146FF", bg: "from-purple-600 to-purple-800" },
                    { Icon: SiNintendoswitch, color: "#E60012", bg: "from-red-500 to-red-700" },
                    { Icon: SiEpicgames, color: "#fff", bg: "from-gray-800 to-black" },
                    { Icon: SiRiotgames, color: "#D32936", bg: "from-red-600 to-red-800" },
                    { Icon: SiUnity, color: "#fff", bg: "from-gray-700 to-gray-900" },
                    { Icon: SiUnrealengine, color: "#fff", bg: "from-gray-800 to-black" },
                    { Icon: SiDocker, color: "#2496ED", bg: "from-blue-500 to-blue-700" },
                    { Icon: SiAmazon, color: "#FF9900", bg: "from-orange-500 to-orange-700" },
                    { Icon: SiGooglecloud, color: "#4285F4", bg: "from-blue-500 to-cyan-600" },
                    { Icon: SiApple, color: "#fff", bg: "from-gray-700 to-gray-900" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`group relative h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br ${item.bg} flex items-center justify-center transition-all duration-500 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 cursor-pointer`}
                      style={{ 
                        animation: 'float 3s ease-in-out infinite',
                        animationDelay: `${index * 0.15}s`
                      }}
                    >
                      <item.Icon className="h-7 w-7 md:h-8 md:w-8 transition-transform group-hover:scale-110" style={{ color: item.color }} />
                    </div>
                  ))}
                </div>
                
                {/* Centered Shield Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-gradient-to-br from-card via-card to-card/80 border-2 border-primary/30 flex items-center justify-center shadow-2xl shadow-primary/30">
                    <CheckCircle className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="liquid-glass rounded-2xl p-6 max-w-2xl mx-auto">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">
                  {t("اكتشف أكبر سوق للمنتجات الرقمية", "Discover the Largest Digital Products Market")}
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => setLocation("/products")}>
                    {t("البيع", "Shop")}
                    <ArrowIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => setLocation("/category/gaming-accounts")}>
                    {t("حسابات الألعاب", "Gaming Accounts")}
                    <ArrowIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => setLocation("/category/programming-tools")}>
                    {t("أدوات البرمجة", "Programming Tools")}
                    <ArrowIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => setLocation("/category/software")}>
                    {t("البرامج", "Software")}
                    <ArrowIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Why ZND Section - Premium Design */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 neon-text">{t("ليش منصة زند؟", "Why ZND Platform?")}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t("منصة زند هي وسيط إلكتروني موثوق للمهتمين في بيع وشراء المنتجات الرقمية، جميع العمليات تخضع لرقابة منصة زند.",
                   "ZND Platform is a trusted digital intermediary for those interested in buying and selling digital products. All transactions are supervised by ZND Platform.")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: Security - Shield Design */}
              <div className="group relative bg-gradient-to-br from-card to-card/50 rounded-3xl p-8 border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                <div className="mb-8">
                  <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl" />
                    <div className="absolute inset-4 bg-gradient-to-br from-card to-background rounded-2xl flex items-center justify-center border border-primary/20">
                      <Shield className="h-20 w-20 text-primary/60 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-2xl mb-3 text-center">{t("الأمان", "Security")}</h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  {t("نلتزم بأعلى المعايير الأمنية لضمان خصوصية عملائنا",
                     "We adhere to the highest security standards to ensure our customers' privacy")}
                </p>
              </div>

              {/* Card 2: Mediation - Network Design */}
              <div className="group relative bg-gradient-to-br from-card to-card/50 rounded-3xl p-8 border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                <div className="mb-8">
                  <div className="relative w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center">
                    {/* Network diagram */}
                    <div className="relative w-full h-full">
                      {/* Center node */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-primary flex items-center justify-center z-10 shadow-lg shadow-primary/30">
                        <Zap className="h-7 w-7 text-white" />
                      </div>
                      {/* Connection lines */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                        <line x1="100" y1="100" x2="40" y2="40" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2" strokeDasharray="4,4" />
                        <line x1="100" y1="100" x2="160" y2="40" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2" strokeDasharray="4,4" />
                        <line x1="100" y1="100" x2="40" y2="160" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2" strokeDasharray="4,4" />
                        <line x1="100" y1="100" x2="160" y2="160" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2" strokeDasharray="4,4" />
                        <line x1="100" y1="100" x2="100" y2="30" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2" strokeDasharray="4,4" />
                      </svg>
                      {/* Outer nodes */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="absolute top-4 left-4 h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary/60" />
                      </div>
                      <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary/60" />
                      </div>
                      <div className="absolute bottom-4 left-4 h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary/60" />
                      </div>
                      <div className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary/60" />
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-2xl mb-3 text-center">{t("الوساطة", "Mediation")}</h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  {t("اشتر وبيع بدون أي مخاوف، جميع العمليات خاضعة للرقابة",
                     "Buy and sell without any concerns, all transactions are supervised")}
                </p>
              </div>

              {/* Card 3: User Experience - UI Mockup */}
              <div className="group relative bg-gradient-to-br from-card to-card/50 rounded-3xl p-8 border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                <div className="mb-8">
                  <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                    <div className="bg-primary/5 rounded-2xl p-4 space-y-3 border border-primary/10">
                      {/* UI Mockup bars */}
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <div className="flex-1 h-3 bg-primary/20 rounded-full" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-primary/70" />
                        <div className="flex-1 h-3 bg-primary/20 rounded-full" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <div className="flex-1 h-3 bg-primary/20 rounded-full" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-primary/70" />
                        <div className="flex-1 h-3 bg-primary/20 rounded-full" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <div className="flex-1 h-3 bg-primary/20 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-2xl mb-3 text-center">{t("تجربة المستخدم", "User Experience")}</h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  {t("نأخذ تجربة المستخدم بجدية، صُممت المنصة لضمان تجربة استخدام استثنائية",
                     "We take user experience seriously, the platform is designed to ensure an exceptional experience")}
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Products Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold">{t("أحدث المنتجات", "Latest Products")}</h2>
                <p className="text-muted-foreground mt-2">
                  {t("اكتشف أحدث المنتجات المتوفرة", "Discover our newest products")}
                </p>
              </div>
              <Link href="/products">
                <Button variant="ghost" className="gap-2 glass" data-testid="link-all-products">
                  {t("عرض الكل", "View All")}
                  <ArrowIcon className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product, index) => (
                  <div key={product.id} className={`fade-in stagger-${(index % 5) + 1}`} style={{ opacity: 0 }}>
                    <ProductCard 
                      product={product}
                      category={categories?.find(c => c.id === product.categoryId)}
                      onClick={() => setLocation(`/product/${product.id}`)}
                      onBuy={() => setLocation(`/product/${product.id}`)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground liquid-glass rounded-2xl">
                {t("لا توجد منتجات حالياً", "No products available")}
              </div>
            )}
          </div>
        </section>

        {/* Customer Reviews Section - Vertical Scroll */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("آراء العملاء", "Customer Reviews")}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("تعكس تقييم عملائنا مدى رضاهم عن جودة الخدمة المقدمة", 
                   "Our customers' reviews reflect their satisfaction with the quality of service provided")}
              </p>
            </div>
          </div>

          {/* Vertical Scrolling Columns with mask fade */}
          <div className="relative h-[600px] overflow-hidden reviews-container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 h-full">
              {(() => {
                const avatarColors = [
                  "from-purple-500 to-pink-500",
                  "from-cyan-500 to-blue-500", 
                  "from-green-500 to-emerald-500",
                  "from-orange-500 to-red-500",
                  "from-yellow-500 to-amber-500",
                  "from-indigo-500 to-violet-500",
                ];
                
                const allReviews = reviews && reviews.length > 0 
                  ? reviews.map(r => ({
                      name: r.user.name,
                      text: r.comment || t("تجربة ممتازة!", "Excellent experience!"),
                      rating: r.rating,
                      avatar: r.user.name.charAt(0),
                    }))
                  : [];
                
                const duplicatedReviews = [...allReviews, ...allReviews];
                const col1 = duplicatedReviews.filter((_, i) => i % 4 === 0);
                const col2 = duplicatedReviews.filter((_, i) => i % 4 === 1);
                const col3 = duplicatedReviews.filter((_, i) => i % 4 === 2);
                const col4 = duplicatedReviews.filter((_, i) => i % 4 === 3);

                const renderReviewCard = (review: typeof allReviews[0], index: number, colorIndex: number) => (
                  <div key={index} className="review-card-glass rounded-2xl p-4">
                    <p className="text-gray-200 mb-3 text-sm leading-relaxed">{review.text}</p>
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarColors[colorIndex % avatarColors.length]} flex items-center justify-center overflow-hidden`}>
                        <span className="text-xs font-bold text-white">{review.avatar}</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm text-white">{review.name}</div>
                      </div>
                    </div>
                  </div>
                );

                if (allReviews.length === 0) {
                  return <div className="col-span-4 flex items-center justify-center text-muted-foreground">{t("لا توجد تقييمات حتى الآن", "No reviews yet")}</div>;
                }

                return (
                  <>
                    <div className="relative overflow-hidden h-full">
                      <div className="flex flex-col gap-4 animate-scroll-up">
                        {col1.length > 0 ? col1.map((r, i) => renderReviewCard(r, i, 0)) : duplicatedReviews.slice(0, 4).map((r, i) => renderReviewCard(r, i, 0))}
                      </div>
                    </div>
                    <div className="relative overflow-hidden h-full">
                      <div className="flex flex-col gap-4 animate-scroll-down">
                        {col2.length > 0 ? col2.map((r, i) => renderReviewCard(r, i, 1)) : duplicatedReviews.slice(0, 4).map((r, i) => renderReviewCard(r, i, 1))}
                      </div>
                    </div>
                    <div className="relative overflow-hidden h-full hidden md:block">
                      <div className="flex flex-col gap-4 animate-scroll-up" style={{ animationDelay: '2s' }}>
                        {col3.length > 0 ? col3.map((r, i) => renderReviewCard(r, i, 2)) : duplicatedReviews.slice(0, 4).map((r, i) => renderReviewCard(r, i, 2))}
                      </div>
                    </div>
                    <div className="relative overflow-hidden h-full hidden md:block">
                      <div className="flex flex-col gap-4 animate-scroll-down" style={{ animationDelay: '3s' }}>
                        {col4.length > 0 ? col4.map((r, i) => renderReviewCard(r, i, 3)) : duplicatedReviews.slice(0, 4).map((r, i) => renderReviewCard(r, i, 3))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* CTA */}
          <div className="container mx-auto px-4 mt-12">
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="rounded-full gap-2" onClick={() => setLocation("/reviews")} data-testid="button-rate-platform">
                {t("قيّم المنصة", "Rate the Platform")}
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="gap-2" onClick={() => setLocation("/reviews")} data-testid="button-view-more-reviews">
                {t("مشاهدة المزيد", "View More")}
                <ArrowIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section with Liquid Glass */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-3xl liquid-glass p-10 md:p-16">
              {/* Animated Background */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-[80px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1.5s' }} />
              </div>
              
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl text-center md:text-start">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {t("انضم إلى منصة زند اليوم", "Join ZND Platform Today")}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {t(
                      "سجل الآن واحصل على وصول حصري لأفضل المنتجات الرقمية بأسعار تنافسية ودعم على مدار الساعة.",
                      "Register now and get exclusive access to the best digital products at competitive prices with 24/7 support."
                    )}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="gap-2 glass-button text-white font-semibold" 
                    onClick={() => setLocation("/register")} 
                    data-testid="button-cta-register"
                  >
                    {t("إنشاء حساب مجاني", "Create Free Account")}
                    <ArrowIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">{t("دفع آمن", "Secure Payment")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span className="text-sm">{t("خدمة عالمية", "Global Service")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span className="text-sm">{t("تسليم فوري", "Instant Delivery")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                <span className="text-sm">{t("دعم 24/7", "24/7 Support")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - بلغة الأرقام */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[180px]" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-[150px]" />
          </div>
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 neon-text">
                {t("زند بلغة الأرقام", "ZND in Numbers")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("أرقامنا تتحدث عننا - عشرات الآلاف من العملاء يثقون في زند", "Our numbers speak for us - Tens of thousands of customers trust ZND")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Products Card */}
              <div className="relative group" data-testid="stat-products">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground text-sm">{t("المنتجات المعروضة", "Products Listed")}</span>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {publicStats ? publicStats.totalProducts.toLocaleString() : "37,429"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("أكثر من الآلاف يثقون في زند", "Thousands trust ZND")}
                  </p>
                </div>
              </div>

              {/* Orders Card */}
              <div className="relative group" data-testid="stat-orders">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground text-sm">{t("طلبات الأعضاء", "Member Orders")}</span>
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-cyan-500" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {publicStats ? publicStats.totalOrders.toLocaleString() : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("تخطينا كل التوقعات", "Exceeded all expectations")}
                  </p>
                </div>
              </div>

              {/* Members Card */}
              <div className="relative group" data-testid="stat-members">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 hover:border-green-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground text-sm">{t("الأعضاء", "Members")}</span>
                    <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {publicStats ? publicStats.totalCustomers.toLocaleString() : "165,069"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("كل يوم نكتسب عملاء أكثر", "Growing every day")}
                  </p>
                </div>
              </div>

              {/* Sales Card */}
              <div className="relative group" data-testid="stat-sales">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 hover:border-yellow-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground text-sm">{t("مبيعات المنصة", "Platform Sales")}</span>
                    <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    ${publicStats ? publicStats.totalSalesAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("بالدولار الأمريكي", "In US Dollars")}
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
