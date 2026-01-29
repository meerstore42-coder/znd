import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  user: {
    name: string;
    avatar: string | null;
  };
  product: {
    titleAr: string;
    titleEn: string;
  };
}

interface Product {
  id: string;
  titleAr: string;
  titleEn: string;
}

export default function Reviews() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/public/reviews"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { productId: string; rating: number; comment: string }) => {
      return apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      toast({
        title: t("تم إرسال التقييم", "Review Submitted"),
        description: t("شكراً! سيتم مراجعة تقييمك ونشره قريباً", "Thank you! Your review will be reviewed and published soon"),
      });
      setIsDialogOpen(false);
      setSelectedProduct("");
      setRating(5);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/public/reviews"] });
    },
    onError: () => {
      toast({
        title: t("خطأ", "Error"),
        description: t("حدث خطأ أثناء إرسال التقييم", "An error occurred while submitting the review"),
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (!selectedProduct) {
      toast({
        title: t("خطأ", "Error"),
        description: t("يرجى اختيار المنتج", "Please select a product"),
        variant: "destructive",
      });
      return;
    }
    submitReviewMutation.mutate({
      productId: selectedProduct,
      rating,
      comment,
    });
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-cyan-500 to-blue-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-yellow-500 to-amber-500",
      "from-indigo-500 to-violet-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("آراء العملاء", "Customer Reviews")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t(
              "تعكس تقييمات عملائنا مدى رضاهم عن جودة الخدمة المقدمة",
              "Our customers' reviews reflect their satisfaction with the quality of service provided"
            )}
          </p>

          {user ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-add-review">
                  <MessageSquare className="h-4 w-4" />
                  {t("أضف تقييمك", "Add Your Review")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("إضافة تقييم جديد", "Add New Review")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t("المنتج", "Product")}
                    </label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger data-testid="select-product">
                        <SelectValue placeholder={t("اختر المنتج", "Select Product")} />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {isRTL ? product.titleAr : product.titleEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t("التقييم", "Rating")}
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                          data-testid={`star-${star}`}
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              star <= rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-muted-foreground hover:text-yellow-500"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t("تعليقك", "Your Comment")}
                    </label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t("شاركنا تجربتك...", "Share your experience...")}
                      className="min-h-[100px]"
                      data-testid="input-comment"
                    />
                  </div>

                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitReviewMutation.isPending}
                    className="w-full gap-2"
                    data-testid="button-submit-review"
                  >
                    <Send className="h-4 w-4" />
                    {submitReviewMutation.isPending
                      ? t("جاري الإرسال...", "Submitting...")
                      : t("إرسال التقييم", "Submit Review")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Link href="/login">
              <Button className="gap-2" data-testid="button-login-to-review">
                <MessageSquare className="h-4 w-4" />
                {t("سجل دخولك لإضافة تقييم", "Login to Add Review")}
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 w-4 bg-muted rounded" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="h-4 bg-muted rounded w-24" />
                </div>
              </Card>
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <Card
                key={review.id}
                className="review-card-glass rounded-2xl p-6"
                data-testid={`review-card-${review.id}`}
              >
                <p className="text-gray-200 mb-4 leading-relaxed">
                  {review.comment || t("تجربة ممتازة!", "Excellent experience!")}
                </p>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarColor(index)} flex items-center justify-center`}
                    >
                      <span className="text-sm font-bold text-white">
                        {review.user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{review.user.name}</div>
                      <div className="text-xs text-gray-400">
                        {isRTL ? review.product.titleAr : review.product.titleEn}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t("لا توجد تقييمات حتى الآن", "No reviews yet")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
