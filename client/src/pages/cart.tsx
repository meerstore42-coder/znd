import { useLanguage } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, CreditCard, Sparkles, Package } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Cart() {
  const { t, language, isRTL } = useLanguage();
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (items.length === 0) throw new Error("Cart is empty");
      if (!user) throw new Error("Please login first");
      
      const firstProduct = items[0].product;
      const response = await apiRequest("POST", "/api/checkout/create-session", {
        productId: firstProduct.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: t("خطأ", "Error"),
        description: error.message || t("فشل في إنشاء جلسة الدفع", "Failed to create checkout session"),
        variant: "destructive",
      });
    },
  });

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: t("يجب تسجيل الدخول", "Login required"),
        description: t("يرجى تسجيل الدخول للشراء", "Please login to make a purchase"),
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (items.length === 1) {
      setLocation(`/product/${items[0].product.id}`);
    } else {
      toast({
        title: t("ملاحظة", "Note"),
        description: t("حالياً يتم دعم شراء منتج واحد في كل عملية", "Currently only single product checkout is supported per transaction"),
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px]" />
          </div>
          <div className="text-center max-w-md mx-auto px-4 relative">
            <div className="h-28 w-28 rounded-3xl bg-zinc-900/80 border border-zinc-800/50 flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="h-14 w-14 text-zinc-600" />
            </div>
            <h1 className="text-3xl font-bold mb-3" data-testid="text-empty-cart">
              {t("السلة فارغة", "Your cart is empty")}
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              {t("لم تقم بإضافة أي منتجات للسلة بعد", "You haven't added any products to your cart yet")}
            </p>
            <Button 
              size="lg" 
              onClick={() => setLocation("/products")} 
              className="gap-3 px-8" 
              data-testid="button-browse-products"
            >
              <ShoppingBag className="h-5 w-5" />
              {t("تصفح المنتجات", "Browse Products")}
              <ArrowIcon className="h-4 w-4" />
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="container mx-auto px-4 relative">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/10 flex items-center justify-center">
                <ShoppingCart className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold neon-text" data-testid="text-cart-title">
                  {t("سلة التسوق", "Shopping Cart")}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {t(`لديك ${totalItems} منتج في السلة`, `You have ${totalItems} item(s) in your cart`)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.product.id} 
                    className="group relative bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 hover:border-primary/30 transition-all duration-300"
                    data-testid={`cart-item-${item.product.id}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative flex gap-5">
                      <div className="h-28 w-28 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700/50">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={language === "ar" ? item.product.titleAr : item.product.titleEn}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 truncate">
                          {language === "ar" ? item.product.titleAr : item.product.titleEn}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {language === "ar" ? item.product.descriptionAr : item.product.descriptionEn}
                        </p>
                        <p className="text-xl font-bold text-primary">
                          ${item.product.price}
                        </p>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => removeItem(item.product.id)}
                          data-testid={`button-remove-${item.product.id}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                        
                        <div className="flex items-center gap-3 bg-zinc-800/80 rounded-xl p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 hover:bg-zinc-700"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            data-testid={`button-decrease-${item.product.id}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 hover:bg-zinc-700"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            data-testid={`button-increase-${item.product.id}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">{t("ملخص الطلب", "Order Summary")}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("عدد المنتجات", "Items")}</span>
                      <span className="font-medium">{totalItems}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("المجموع الفرعي", "Subtotal")}</span>
                      <span className="font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                    <div className="flex justify-between font-bold text-xl">
                      <span>{t("الإجمالي", "Total")}</span>
                      <span className="text-primary">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button 
                      className="w-full gap-3 h-12 text-base" 
                      size="lg"
                      onClick={handleCheckout}
                      disabled={checkoutMutation.isPending}
                      data-testid="button-checkout"
                    >
                      <CreditCard className="h-5 w-5" />
                      {t("إتمام الشراء", "Proceed to Checkout")}
                      <ArrowIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-zinc-700 hover:bg-zinc-800"
                      onClick={clearCart}
                      data-testid="button-clear-cart"
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      {t("إفراغ السلة", "Clear Cart")}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => setLocation("/products")}
                      data-testid="button-continue-shopping"
                    >
                      {t("متابعة التسوق", "Continue Shopping")}
                    </Button>
                  </div>
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
