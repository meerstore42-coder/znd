import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const forgotMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      return apiRequest("POST", "/api/auth/forgot-password", data);
    },
    onSuccess: () => {
      setSent(true);
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "حدث خطأ" : "An error occurred"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotMutation.mutate(data);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <Card className="w-full max-w-md bg-zinc-900/60 backdrop-blur border-zinc-800">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-4">
              {language === "ar" ? "تم إرسال الرابط" : "Reset Link Sent"}
            </h2>
            <p className="text-zinc-400 mb-6">
              {language === "ar" 
                ? "إذا كان البريد الإلكتروني مسجلاً لدينا، ستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور."
                : "If the email is registered, you'll receive a password reset link."}
            </p>
            <Link href="/login">
              <Button className="">
                {language === "ar" ? "العودة لتسجيل الدخول" : "Back to Login"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <Card className="w-full max-w-md bg-zinc-900/60 backdrop-blur border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">
            {language === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {language === "ar" 
              ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين"
              : "Enter your email and we'll send you a reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">
                      {language === "ar" ? "البريد الإلكتروني" : "Email"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="example@email.com"
                          className="bg-zinc-800 border-zinc-700 text-white pr-10"
                          data-testid="input-email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={forgotMutation.isPending}
                data-testid="button-submit"
              >
                {forgotMutation.isPending 
                  ? (language === "ar" ? "جاري الإرسال..." : "Sending...")
                  : (language === "ar" ? "إرسال رابط إعادة التعيين" : "Send Reset Link")}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-primary hover:underline inline-flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              {language === "ar" ? "العودة لتسجيل الدخول" : "Back to Login"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
