import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Twitter, Github, Mail, MessageCircle, Send, Shield, Zap, CreditCard, ArrowRight, ArrowLeft } from "lucide-react";

export function Footer() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSubscribing(false);
    setEmail("");
    toast({
      title: t("تم الاشتراك بنجاح", "Successfully subscribed!"),
      description: t("شكراً لاشتراكك في نشرتنا البريدية", "Thank you for subscribing to our newsletter"),
    });
  };

  return (
    <footer className="relative border-t border-border/20 glass-header">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center pulse-glow">
                <span className="text-primary-foreground font-bold text-2xl">Z</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gradient-blue block">
                  {t("زند", "ZND")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("سوقك الرقمي المتكامل", "Your Digital Marketplace")}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              {t(
                "منصة زند هي وجهتك الموثوقة للحصول على أفضل الأدوات البرمجية والبرامج وبطاقات الألعاب والحسابات بأسعار تنافسية وأمان تام.",
                "ZND Platform is your trusted destination for the best programming tools, software, gaming cards, and accounts at competitive prices with complete security."
              )}
            </p>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{t("آمن 100%", "100% Secure")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{t("تسليم فوري", "Instant")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{t("دفع سهل", "Easy Pay")}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">{t("اشترك في النشرة البريدية", "Subscribe to Newsletter")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("احصل على أحدث العروض والخصومات مباشرة على بريدك الإلكتروني", "Get the latest offers and discounts directly to your email")}
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder={t("أدخل بريدك الإلكتروني", "Enter your email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button type="submit" disabled={isSubscribing} data-testid="button-subscribe">
                {isSubscribing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline mr-2">{t("اشتراك", "Subscribe")}</span>
                  </>
                )}
              </Button>
            </form>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{t("تابعنا", "Follow us")}:</span>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-lg glass flex items-center justify-center hover-elevate" data-testid="link-twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-lg glass flex items-center justify-center hover-elevate" data-testid="link-github">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-lg glass flex items-center justify-center hover-elevate" data-testid="link-discord">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="mailto:support@znd.com" className="h-10 w-10 rounded-lg glass flex items-center justify-center hover-elevate" data-testid="link-email">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-border/20">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t("روابط سريعة", "Quick Links")}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("المنتجات", "Products")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("من نحن", "About Us")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("لوحة التحكم", "Dashboard")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t("الأقسام", "Categories")}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/programming-tools" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("أدوات برمجية", "Programming Tools")}
                </Link>
              </li>
              <li>
                <Link href="/category/software" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("برامج", "Software")}
                </Link>
              </li>
              <li>
                <Link href="/category/gaming-cards" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("بطاقات الألعاب", "Gaming Cards")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t("الدعم", "Support")}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("تواصل معنا", "Contact Us")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("الأسئلة الشائعة", "FAQ")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{t("قانوني", "Legal")}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("سياسة الخصوصية", "Privacy Policy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("شروط الاستخدام", "Terms of Service")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t("جميع الحقوق محفوظة © 2024 منصة زند", "© 2024 ZND Platform. All rights reserved.")}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">{t("مدعوم بـ", "Powered by")}</span>
            <span className="text-xs text-primary font-medium">ZND Technologies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
