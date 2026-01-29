import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useSearch } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      return apiRequest("POST", "/api/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message || (language === "ar" ? "حدث خطأ" : "An error occurred"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    resetMutation.mutate(data);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <Card className="w-full max-w-md bg-zinc-900/60 backdrop-blur border-zinc-800">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">
              {language === "ar" ? "رابط غير صالح" : "Invalid Link"}
            </h2>
            <p className="text-zinc-400 mb-6">
              {language === "ar" 
                ? "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية."
                : "The password reset link is invalid or expired."}
            </p>
            <Link href="/forgot-password">
              <Button className="">
                {language === "ar" ? "طلب رابط جديد" : "Request New Link"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <Card className="w-full max-w-md bg-zinc-900/60 backdrop-blur border-zinc-800">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-4">
              {language === "ar" ? "تم تغيير كلمة المرور" : "Password Changed"}
            </h2>
            <p className="text-zinc-400 mb-6">
              {language === "ar" 
                ? "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة."
                : "Your password has been changed. You can now log in with your new password."}
            </p>
            <Link href="/login">
              <Button className="">
                {language === "ar" ? "تسجيل الدخول" : "Log In"}
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
            {language === "ar" ? "إعادة تعيين كلمة المرور" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {language === "ar" 
              ? "أدخل كلمة المرور الجديدة"
              : "Enter your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">
                      {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          className="bg-zinc-800 border-zinc-700 text-white pr-10"
                          data-testid="input-new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">
                      {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          className="bg-zinc-800 border-zinc-700 text-white pr-10"
                          data-testid="input-confirm-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={resetMutation.isPending}
                data-testid="button-submit"
              >
                {resetMutation.isPending 
                  ? (language === "ar" ? "جاري التغيير..." : "Changing...")
                  : (language === "ar" ? "تغيير كلمة المرور" : "Change Password")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
