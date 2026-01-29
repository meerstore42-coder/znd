import { useLanguage } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Sparkles, Plus } from "lucide-react";
import type { Product, Category } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  category?: Category;
  onBuy?: () => void;
  onClick?: () => void;
}

export function ProductCard({ product, category, onBuy, onClick }: ProductCardProps) {
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const title = language === "ar" ? product.titleAr : product.titleEn;
  const description = language === "ar" ? product.descriptionAr : product.descriptionEn;
  const categoryName = category 
    ? (language === "ar" ? category.nameAr : category.nameEn)
    : null;

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = hasDiscount 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  return (
    <Card 
      className="group relative overflow-visible glass-card rounded-2xl cursor-pointer hover-elevate transition-all duration-300"
      data-testid={`card-product-${product.id}`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-4">
        <div className="relative aspect-square rounded-xl bg-gradient-to-br from-primary/5 to-transparent flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img 
              src={product.image} 
              alt={title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="relative">
              <Package className="h-16 w-16 text-primary/30" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-pulse" />
            </div>
          )}
          {hasDiscount && (
            <Badge 
              className="absolute top-3 right-3 bg-destructive text-destructive-foreground shadow-lg"
              data-testid={`badge-discount-${product.id}`}
            >
              -{discountPercentage}%
            </Badge>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center rounded-xl">
              <Badge variant="secondary" className="text-sm">{t("نفذت الكمية", "Out of Stock")}</Badge>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {categoryName && (
            <span className="inline-block text-xs text-primary font-medium px-2 py-1 rounded-full bg-primary/10">
              {categoryName}
            </span>
          )}
          <h3 className="font-semibold text-base leading-tight line-clamp-2" data-testid={`text-title-${product.id}`}>
            {title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary neon-text" data-testid={`text-price-${product.id}`}>
            ${product.price}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button 
          variant="outline"
          size="icon"
          className="flex-shrink-0"
          disabled={product.stock <= 0}
          onClick={(e) => {
            e.stopPropagation();
            addItem(product);
            toast({
              title: t("تمت الإضافة", "Added to Cart"),
              description: title,
            });
          }}
          data-testid={`button-add-cart-${product.id}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button 
          className="flex-1 gap-2 glass-button text-white font-medium"
          disabled={product.stock <= 0}
          onClick={(e) => {
            e.stopPropagation();
            if (onBuy) onBuy();
          }}
          data-testid={`button-buy-${product.id}`}
        >
          <ShoppingCart className="h-4 w-4" />
          {t("شراء الآن", "Buy Now")}
        </Button>
      </CardFooter>
    </Card>
  );
}
