import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowLeft, ArrowRight, Package, Code, Gamepad2, UserCircle, Sparkles } from "lucide-react";
import type { Category, Product } from "@shared/schema";

const iconMap: Record<string, typeof Code> = {
  code: Code,
  package: Package,
  "gamepad-2": Gamepad2,
  "user-circle": UserCircle,
};

export default function CategoryPage() {
  const { t, language, isRTL } = useLanguage();
  const [, params] = useRoute("/category/:slug");
  const [, setLocation] = useLocation();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const category = categories?.find(c => c.slug === params?.slug);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = products?.filter(
    (p) => p.categoryId === category?.id && p.isActive
  );

  const categoryName = category
    ? language === "ar"
      ? category.nameAr
      : category.nameEn
    : "";

  const Icon = iconMap[category?.icon || "package"] || Package;
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="container mx-auto px-4 relative">
            <Button
              variant="ghost"
              className="mb-6 gap-2 hover:bg-zinc-800/50"
              onClick={() => setLocation("/products")}
              data-testid="button-back-products"
            >
              <ArrowIcon className="h-4 w-4" />
              {t("العودة للمنتجات", "Back to Products")}
            </Button>

            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/20 flex items-center justify-center">
                <Icon className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold neon-text mb-2" data-testid="text-category-title">
                  {categoryName}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {filteredProducts?.length || 0} {t("منتج متاح", "products available")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <div key={product.id} className={`fade-in stagger-${(index % 5) + 1}`} style={{ opacity: 0 }}>
                    <ProductCard
                      product={product}
                      category={category}
                      onClick={() => setLocation(`/product/${product.id}`)}
                      onBuy={() => setLocation(`/product/${product.id}`)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="h-28 w-28 mx-auto mb-8 rounded-3xl bg-zinc-900/80 border border-zinc-800/50 flex items-center justify-center">
                  <Package className="h-14 w-14 text-zinc-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  {t("لا توجد منتجات", "No Products Found")}
                </h3>
                <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                  {t(
                    "لا توجد منتجات في هذا التصنيف حالياً",
                    "There are no products in this category yet"
                  )}
                </p>
                <Button size="lg" onClick={() => setLocation("/products")} className="gap-2" data-testid="button-browse-all">
                  {t("تصفح جميع المنتجات", "Browse All Products")}
                  {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
