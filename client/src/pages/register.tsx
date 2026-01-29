import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Loader2, Mail, Lock, Eye, EyeOff, User, AtSign } from "lucide-react";
import { SiGoogle, SiDiscord } from "react-icons/si";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { z } from "zod";

type RegisterForm = z.infer<typeof insertUserSchema>;

export default function Register() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthConfig, setOauthConfig] = useState<{ google: boolean; discord: boolean }>({ google: false, discord: false });

  useEffect(() => {
    fetch("/api/auth/oauth-config")
      .then(res => res.json())
      .then(data => setOauthConfig(data))
      .catch(() => {});
  }, []);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      isAdmin: false,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Registration failed");
      }

      login(result.user);
      toast({
        title: t("تم إنشاء الحساب بنجاح", "Account created successfully"),
        description: t("مرحباً بك في منصة زند", "Welcome to ZND Platform"),
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: t("خطأ", "Error"),
        description: error.message || t("فشل إنشاء الحساب", "Registration failed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background animated-gradient-bg">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-primary/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <Card className="w-full max-w-md liquid-glass rounded-2xl relative fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 pulse-glow">
              <span className="text-primary-foreground font-bold text-2xl">Z</span>
            </div>
            <CardTitle className="text-2xl">
              {t("إنشاء حساب جديد", "Create Account")}
            </CardTitle>
            <CardDescription>
              {t("أنشئ حسابك للوصول إلى منتجاتنا الرقمية", "Create your account to access our digital products")}
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("الاسم الكامل", "Full Name")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder={t("أدخل اسمك", "Enter your name")}
                            className="pr-10"
                            data-testid="input-name"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("اسم المستخدم", "Username")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder={t("اختر اسم مستخدم", "Choose a username")}
                            className="pr-10"
                            data-testid="input-username"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("البريد الإلكتروني", "Email")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="name@example.com"
                            className="pr-10"
                            data-testid="input-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("كلمة المرور", "Password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pr-10 pl-10"
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full glass-button text-white font-medium" disabled={isLoading} data-testid="button-submit-register">
                  {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  {t("إنشاء الحساب", "Create Account")}
                </Button>

                {(oauthConfig.google || oauthConfig.discord) && (
                  <>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          {t("أو التسجيل عبر", "Or register with")}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full">
                      {oauthConfig.google && (
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.location.href = "/api/auth/google"}
                          data-testid="button-google-register"
                        >
                          <SiGoogle className="h-4 w-4 ml-2" />
                          Google
                        </Button>
                      )}
                      {oauthConfig.discord && (
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.location.href = "/api/auth/discord"}
                          data-testid="button-discord-register"
                        >
                          <SiDiscord className="h-4 w-4 ml-2" />
                          Discord
                        </Button>
                      )}
                    </div>
                  </>
                )}

                <p className="text-sm text-center text-muted-foreground">
                  {t("لديك حساب بالفعل؟", "Already have an account?")}{" "}
                  <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
                    {t("سجل دخول", "Login")}
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
