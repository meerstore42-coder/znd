import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Package, Shield, Zap, CreditCard, Bitcoin, ArrowRight, ArrowLeft, Check, Copy, Plus, Sparkles, Star } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product, Category } from "@shared/schema";

export default function ProductDetail() {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"usdt" | "card">("card");
  const [copied, setCopied] = useState(false);

  const USDT_WALLET = "TYourWalletAddressHere123456789";

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!product || !user) throw new Error("Missing data");
      
      if (paymentMethod === "card") {
        const response = await apiRequest("POST", "/api/checkout/create-session", {
          productId: product.id,
        });
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
        return data;
      } else {
        return apiRequest("POST", "/api/orders", {
          productId: product.id,
          userId: user.id,
          paymentMethod,
          totalAmount: product.price,
        });
      }
    },
    onSuccess: (data) => {
      if (paymentMethod === "usdt") {
        queryClient.invalidateQueries({ queryKey: ["/api/orders/my"] });
        setIsPaymentOpen(false);
        toast({
          title: t("تم الطلب بنجاح", "Order placed successfully"),
          description: t("يرجى إرسال المبلغ ثم انتظار تأكيد الدفع", "Please send the amount and wait for payment confirmation"),
        });
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: t("خطأ", "Error"),
        description: error.message || t("فشل إتمام الطلب", "Failed to place order"),
        variant: "destructive",
      });
    },
  });

  const copyWallet = () => {
    navigator.clipboard.writeText(USDT_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
          </div>
          <div className="text-center relative">
            <div className="h-24 w-24 rounded-3xl bg-zinc-900/80 border border-zinc-800/50 flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t("المنتج غير موجود", "Product not found")}</h2>
            <Button onClick={() => setLocation("/products")} className="gap-2">
              {t("تصفح المنتجات", "Browse Products")}
              <ArrowIcon className="h-4 w-4" />
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const title = language === "ar" ? product.titleAr : product.titleEn;
  const description = language === "ar" ? product.descriptionAr : product.descriptionEn;
  const category = categories?.find(c => c.id === product.categoryId);
  const categoryName = category ? (language === "ar" ? category.nameAr : category.nameEn) : null;

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = hasDiscount 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  const handleBuy = () => {
    if (!user) {
      toast({
        title: t("يجب تسجيل الدخول", "Login required"),
        description: t("يرجى تسجيل الدخول للشراء", "Please login to make a purchase"),
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }
    setIsPaymentOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section with Background */}
        <section className="relative py-8 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="container mx-auto px-4 relative">
            <Button
              variant="ghost"
              className="mb-6 gap-2 hover:bg-zinc-800/50"
              onClick={() => setLocation("/products")}
              data-testid="button-back"
            >
              <ArrowIcon className="h-4 w-4 rotate-180" />
              {t("العودة للمنتجات", "Back to Products")}
            </Button>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Product Image */}
              <div className="relative">
                <div className="relative aspect-square rounded-3xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 overflow-hidden group">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-24 w-24 text-zinc-700" />
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-red-500 text-white text-base px-4 py-1.5 font-bold">
                        -{discountPercentage}%
                      </Badge>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {categoryName && (
                  <Badge className="bg-primary/10 text-primary border-primary/30 px-3 py-1">
                    <Sparkles className="h-3 w-3 ml-1" />
                    {categoryName}
                  </Badge>
                )}

                <h1 className="text-3xl md:text-4xl font-bold neon-text" data-testid="text-product-title">
                  {title}
                </h1>

                <div className="flex items-center gap-4">
                  <span className="text-4xl md:text-5xl font-bold text-primary" data-testid="text-product-price">
                    ${product.price}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-zinc-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                <p className="text-lg text-zinc-400 leading-relaxed">
                  {description}
                </p>

                <div className="flex items-center gap-3">
                  {product.stock > 0 ? (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30 px-3 py-1">
                      <Check className="h-3 w-3 ml-1" />
                      {t("متوفر", "In Stock")} ({product.stock})
                    </Badge>
                  ) : (
                    <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">
                      {t("نفذت الكمية", "Out of Stock")}
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="gap-2 border-zinc-700 hover:bg-zinc-800 hover:border-primary/50" 
                    disabled={product.stock <= 0}
                    onClick={() => {
                      addItem(product);
                      toast({
                        title: t("تمت الإضافة للسلة", "Added to Cart"),
                        description: title,
                      });
                    }}
                    data-testid="button-add-to-cart"
                  >
                    <Plus className="h-5 w-5" />
                    {t("أضف للسلة", "Add to Cart")}
                  </Button>
                  <Button 
                    size="lg" 
                    className="flex-1 gap-2 h-12 text-base" 
                    disabled={product.stock <= 0}
                    onClick={handleBuy}
                    data-testid="button-buy-product"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {t("شراء الآن", "Buy Now")}
                    <ArrowIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800/50">
                  <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">{t("آمن", "Secure")}</p>
                    <p className="text-xs text-zinc-500">{t("دفع مشفر", "Encrypted")}</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                    <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-cyan-400" />
                    </div>
                    <p className="text-sm font-medium">{t("فوري", "Instant")}</p>
                    <p className="text-xs text-zinc-500">{t("تسليم سريع", "Quick")}</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                    <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-400" />
                    </div>
                    <p className="text-sm font-medium">{t("أصلي", "Original")}</p>
                    <p className="text-xs text-zinc-500">{t("100%", "100%")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl">{t("إتمام عملية الشراء", "Complete Purchase")}</DialogTitle>
            <DialogDescription>
              {t("اختر طريقة الدفع المفضلة لديك", "Choose your preferred payment method")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Order Summary */}
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-zinc-400">{t("المنتج", "Product")}</span>
                <span className="font-medium">{title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{t("المبلغ", "Amount")}</span>
                <span className="text-2xl font-bold text-primary">${product.price}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "usdt" | "card")}>
              <div className="space-y-3">
                <Label className="flex items-center gap-4 p-4 rounded-xl border border-zinc-700/50 cursor-pointer hover:bg-zinc-800/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                  <RadioGroupItem value="card" id="card" />
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t("بطاقة ائتمان", "Credit Card")}</p>
                    <p className="text-xs text-zinc-500">Visa, MasterCard</p>
                  </div>
                </Label>

                <Label className="flex items-center gap-4 p-4 rounded-xl border border-zinc-700/50 cursor-pointer hover:bg-zinc-800/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                  <RadioGroupItem value="usdt" id="usdt" />
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Bitcoin className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">USDT (TRC20)</p>
                    <p className="text-xs text-zinc-500">{t("عملة مشفرة", "Cryptocurrency")}</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {/* USDT Wallet Info */}
            {paymentMethod === "usdt" && (
              <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                <p className="text-sm text-zinc-400">
                  {t("أرسل المبلغ إلى العنوان التالي:", "Send the amount to the following address:")}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-zinc-900 p-3 rounded-lg border border-zinc-700 overflow-x-auto font-mono">
                    {USDT_WALLET}
                  </code>
                  <Button variant="outline" size="icon" className="border-zinc-700" onClick={copyWallet}>
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-zinc-700" onClick={() => setIsPaymentOpen(false)}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button 
              onClick={() => orderMutation.mutate()}
              disabled={orderMutation.isPending}
              className="gap-2"
              data-testid="button-confirm-payment"
            >
              {orderMutation.isPending ? t("جاري المعالجة...", "Processing...") : (
                <>
                  {t("تأكيد الدفع", "Confirm Payment")}
                  <ArrowIcon className="h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
