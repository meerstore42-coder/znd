import { useLanguage } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export function CartSheet() {
  const { t, language } = useLanguage();
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      setOpen(false);
      setLocation("/login");
      return;
    }
    if (items.length === 1) {
      setOpen(false);
      setLocation(`/product/${items[0].product.id}`);
    } else {
      setOpen(false);
      setLocation("/cart");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              data-testid="badge-cart-count"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96 flex flex-col glass border-border/50">
        <SheetHeader className="border-b border-border/50 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {t("سلة التسوق", "Shopping Cart")}
            {totalItems > 0 && (
              <Badge variant="secondary">{totalItems}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{t("السلة فارغة", "Your cart is empty")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("أضف منتجات للبدء", "Add products to get started")}
              </p>
            </div>
            <Button variant="outline" onClick={() => { setOpen(false); setLocation("/products"); }}>
              {t("تصفح المنتجات", "Browse Products")}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4 space-y-4">
              {items.map((item) => (
                <div 
                  key={item.product.id} 
                  className="flex gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
                  data-testid={`cart-item-${item.product.id}`}
                >
                  <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={language === "ar" ? item.product.titleAr : item.product.titleEn}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">
                      {language === "ar" ? item.product.titleAr : item.product.titleEn}
                    </p>
                    <p className="text-primary font-bold mt-1">
                      ${item.product.price}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        data-testid={`button-decrease-${item.product.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        data-testid={`button-increase-${item.product.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive mr-auto"
                        onClick={() => removeItem(item.product.id)}
                        data-testid={`button-remove-${item.product.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter className="border-t border-border/50 pt-4 flex-col gap-4">
              <div className="flex justify-between items-center w-full">
                <span className="text-muted-foreground">{t("الإجمالي", "Total")}</span>
                <span className="text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={clearCart}
                  data-testid="button-clear-cart"
                >
                  {t("إفراغ السلة", "Clear Cart")}
                </Button>
                <Button 
                  className="flex-1 gap-2"
                  onClick={handleCheckout}
                  data-testid="button-checkout"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t("إتمام الشراء", "Checkout")}
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
