import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, Package, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function CheckoutSuccess() {
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("loading");
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);

  const completeOrder = useCallback(async (sessionId: string): Promise<"success" | "pending" | "error"> => {
    try {
      const response = await apiRequest("POST", "/api/checkout/complete", { sessionId });
      const data = await response.json();
      
      if (data.success) {
        setStatus("success");
        setMessage(data.message || t("تم إكمال الطلب بنجاح!", "Order completed successfully!"));
        return "success";
      } else if (data.pending) {
        return "pending";
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      if (error.message?.includes("الدفع لم يكتمل") || error.message?.includes("Payment not complete")) {
        return "pending";
      }
      throw error;
    }
  }, [t]);

  const checkStatus = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/checkout/status/${sessionId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      return data.status;
    } catch {
      return "unknown";
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");

    if (!sessionId) {
      setStatus("error");
      setMessage(t("جلسة غير صالحة", "Invalid session"));
      return;
    }

    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    async function processPayment() {
      try {
        const result = await completeOrder(sessionId!);
        if (result === "success") {
          if (pollInterval) clearInterval(pollInterval);
          return;
        }
        
        setStatus("pending");
        setMessage(t("جاري معالجة الدفع...", "Processing payment..."));
        
        let currentAttempt = 0;
        pollInterval = setInterval(async () => {
          if (!isMounted) return;
          
          currentAttempt++;
          setAttempts(currentAttempt);
          
          const orderStatus = await checkStatus(sessionId!);
          
          if (orderStatus === "completed") {
            if (pollInterval) clearInterval(pollInterval);
            setStatus("success");
            setMessage(t("تم إكمال الطلب بنجاح!", "Order completed successfully!"));
            return;
          }
          
          if (orderStatus === "paid_pending_fulfillment") {
            try {
              const retryResult = await completeOrder(sessionId!);
              if (retryResult === "success" && pollInterval) {
                clearInterval(pollInterval);
              }
            } catch (error: any) {
              console.error("Retry complete error:", error);
            }
          }
          
          if (currentAttempt >= 30) {
            if (pollInterval) clearInterval(pollInterval);
            setStatus("pending");
            setMessage(t("الدفع قيد المعالجة. يرجى التحقق من خزنتك لاحقاً.", "Payment is being processed. Please check your vault later."));
          }
        }, 2000);
        
      } catch (error: any) {
        if (isMounted) {
          setStatus("error");
          setMessage(error.message || t("حدث خطأ أثناء إكمال الطلب", "Error completing order"));
        }
      }
    }

    processPayment();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [completeOrder, checkStatus, t, attempts]);

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="liquid-glass border-0">
            <CardContent className="p-8 text-center space-y-6">
              {(status === "loading" || status === "pending") && (
                <>
                  <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
                  <h1 className="text-2xl font-bold">
                    {t("جاري معالجة طلبك...", "Processing your order...")}
                  </h1>
                  <p className="text-muted-foreground">
                    {message || t("يرجى الانتظار", "Please wait")}
                  </p>
                  {status === "pending" && (
                    <p className="text-sm text-muted-foreground">
                      {t("قد يستغرق هذا بضع ثوانٍ", "This may take a few seconds")}
                    </p>
                  )}
                </>
              )}

              {status === "success" && (
                <>
                  <div className="h-20 w-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-green-500">
                    {t("تم الدفع بنجاح!", "Payment Successful!")}
                  </h1>
                  <p className="text-muted-foreground">{message}</p>
                  
                  <div className="pt-4 space-y-3">
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => setLocation("/dashboard")}
                      data-testid="button-go-to-vault"
                    >
                      <Package className="h-5 w-5" />
                      {t("الذهاب إلى خزنتي", "Go to My Vault")}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full gap-2" 
                      onClick={() => setLocation("/products")}
                      data-testid="button-continue-shopping"
                    >
                      <ArrowIcon className="h-5 w-5" />
                      {t("مواصلة التسوق", "Continue Shopping")}
                    </Button>
                  </div>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="h-20 w-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                  </div>
                  <h1 className="text-2xl font-bold text-destructive">
                    {t("حدث خطأ", "An Error Occurred")}
                  </h1>
                  <p className="text-muted-foreground">{message}</p>
                  
                  <div className="pt-4 space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2" 
                      onClick={() => setLocation("/dashboard")}
                    >
                      <Package className="h-5 w-5" />
                      {t("تحقق من خزنتك", "Check Your Vault")}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full gap-2" 
                      onClick={() => setLocation("/products")}
                    >
                      <ArrowIcon className="h-5 w-5" />
                      {t("العودة للمنتجات", "Back to Products")}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
