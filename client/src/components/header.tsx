import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { LanguageToggle } from "./language-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { User, LogOut, LayoutDashboard, Settings, ShieldCheck, Menu, X, ShoppingBag, Info, Phone, Home } from "lucide-react";
import { CartSheet } from "./cart-sheet";

export function Header() {
  const { t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("الرئيسية", "Home"), icon: Home },
    { href: "/products", label: t("المنتجات", "Products"), icon: ShoppingBag },
    { href: "/about", label: t("من نحن", "About"), icon: Info },
    { href: "/contact", label: t("اتصل بنا", "Contact"), icon: Phone },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    setLocation(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-header">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="w-80 glass border-border/50">
              <SheetHeader className="border-b border-border/50 pb-4">
                <SheetTitle className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xl">Z</span>
                  </div>
                  <span className="text-xl font-bold text-gradient-blue">{t("زند", "ZND")}</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {navLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => handleNavClick(link.href)}
                    data-testid={`mobile-link-${link.href.replace("/", "") || "home"}`}
                  >
                    <link.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{link.label}</span>
                  </Button>
                ))}
                {user && (
                  <>
                    <div className="h-px bg-border/50 my-2" />
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => handleNavClick("/dashboard")}
                      data-testid="mobile-link-dashboard"
                    >
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                      <span className="font-medium">{t("لوحة التحكم", "Dashboard")}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => handleNavClick("/settings")}
                      data-testid="mobile-link-settings"
                    >
                      <Settings className="h-5 w-5 text-primary" />
                      <span className="font-medium">{t("الإعدادات", "Settings")}</span>
                    </Button>
                    {user.isAdmin && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12"
                        onClick={() => handleNavClick("/admin")}
                        data-testid="mobile-link-admin"
                      >
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span className="font-medium">{t("لوحة الإدارة", "Admin Panel")}</span>
                      </Button>
                    )}
                    <div className="h-px bg-border/50 my-2" />
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive"
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      data-testid="mobile-link-logout"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">{t("تسجيل الخروج", "Logout")}</span>
                    </Button>
                  </>
                )}
                {!user && (
                  <>
                    <div className="h-px bg-border/50 my-2" />
                    <Button
                      className="w-full gap-2"
                      onClick={() => handleNavClick("/login")}
                      data-testid="mobile-link-login"
                    >
                      {t("تسجيل الدخول", "Login")}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => handleNavClick("/register")}
                      data-testid="mobile-link-register"
                    >
                      {t("إنشاء حساب", "Register")}
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-3" data-testid="link-home">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center pulse-glow">
                <span className="text-primary-foreground font-bold text-xl">Z</span>
              </div>
              <span className="text-xl font-bold text-gradient-blue">
                {t("زند", "ZND")}
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-products">
            {t("المنتجات", "Products")}
          </Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">
            {t("من نحن", "About")}
          </Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">
            {t("اتصل بنا", "Contact")}
          </Link>
          <Link href="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-faq">
            {t("الأسئلة الشائعة", "FAQ")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <CartSheet />
          <LanguageToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">@{user.username}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/dashboard")} data-testid="menu-dashboard">
                  <LayoutDashboard className="ml-2 h-4 w-4" />
                  {t("لوحة التحكم", "Dashboard")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/settings")} data-testid="menu-settings">
                  <Settings className="ml-2 h-4 w-4" />
                  {t("الإعدادات", "Settings")}
                </DropdownMenuItem>
                {user.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation("/admin")} data-testid="menu-admin">
                      <ShieldCheck className="ml-2 h-4 w-4" />
                      {t("لوحة الإدارة", "Admin Panel")}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive" data-testid="menu-logout">
                  <LogOut className="ml-2 h-4 w-4" />
                  {t("تسجيل الخروج", "Logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/login")} data-testid="button-login">
                {t("دخول", "Login")}
              </Button>
              <Button size="sm" onClick={() => setLocation("/register")} data-testid="button-register">
                {t("تسجيل", "Register")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
