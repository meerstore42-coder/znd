import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal, Package, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredProducts = products?.filter((product) => {
    const title = language === "ar" ? product.titleAr : product.titleEn;
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter;
    return matchesSearch && matchesCategory && product.isActive;
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

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
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/10 flex items-center justify-center">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold neon-text" data-testid="text-products-title">
                  {t("المنتجات", "Products")}
                </h1>
                <p className="text-muted-foreground">
                  {t("تصفح مجموعتنا الكاملة من المنتجات الرقمية", "Browse our complete collection of digital products")}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("ابحث عن منتج...", "Search for a product...")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-10 bg-zinc-800/50 border-zinc-700/50 focus:border-primary/50"
                    data-testid="input-search"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-zinc-800/50 border-zinc-700/50" data-testid="select-category">
                    <Filter className="h-4 w-4 ml-2 text-primary" />
                    <SelectValue placeholder={t("جميع الأقسام", "All Categories")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("جميع الأقسام", "All Categories")}</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {language === "ar" ? category.nameAr : category.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48 bg-zinc-800/50 border-zinc-700/50" data-testid="select-sort">
                    <SlidersHorizontal className="h-4 w-4 ml-2 text-cyan-400" />
                    <SelectValue placeholder={t("ترتيب حسب", "Sort by")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t("الأحدث", "Newest")}</SelectItem>
                    <SelectItem value="price-low">{t("السعر: من الأقل", "Price: Low to High")}</SelectItem>
                    <SelectItem value="price-high">{t("السعر: من الأعلى", "Price: High to Low")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Results count */}
              <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {t(`عرض ${filteredProducts?.length || 0} منتج`, `Showing ${filteredProducts?.length || 0} products`)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
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
              <div className="text-center py-20">
                <div className="h-24 w-24 rounded-2xl bg-zinc-900/80 border border-zinc-800/50 flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("لا توجد نتائج", "No results found")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("جرب البحث بكلمات مختلفة", "Try searching with different keywords")}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => { setSearch(""); setCategoryFilter("all"); }}
                  data-testid="button-clear-filters"
                >
                  {t("مسح الفلاتر", "Clear Filters")}
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
