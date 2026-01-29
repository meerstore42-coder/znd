import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingBag, Key, Clock, CheckCircle2, XCircle, AlertCircle, Settings, Copy, Check, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocation, Redirect } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Order, Product, DigitalItem } from "@shared/schema";

interface OrderWithProduct extends Order {
  product?: Product;
}

interface VaultItem {
  item: DigitalItem;
  order: Order;
  product: Product | null;
}

export default function Dashboard() {
  const { t, language, isRTL } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const { data: orders, isLoading: ordersLoading } = useQuery<OrderWithProduct[]>({
    queryKey: ["/api/orders/my"],
    enabled: !!user,
  });

  const { data: vaultItems, isLoading: vaultLoading } = useQuery<VaultItem[]>({
    queryKey: ["/api/vault"],
    enabled: !!user,
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: t("تم النسخ", "Copied"),
      description: t("تم نسخ المفتاح إلى الحافظة", "Key copied to clipboard"),
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  const completedOrders = orders?.filter(o => o.status === "completed") || [];
  const pendingOrders = orders?.filter(o => o.status === "pending") || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/30"><CheckCircle2 className="h-3 w-3 ml-1" />{t("مكتمل", "Completed")}</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 ml-1" />{t("قيد الانتظار", "Pending")}</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 ml-1" />{t("ملغي", "Cancelled")}</Badge>;
      default:
        return <Badge className="bg-zinc-800 text-zinc-400"><AlertCircle className="h-3 w-3 ml-1" />{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="container mx-auto px-4 relative">
            {/* User Profile Card */}
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-6 md:p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border-3 border-primary/30">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-cyan-500/10 text-primary text-3xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-right">
                  <h1 className="text-2xl md:text-3xl font-bold mb-1 neon-text">{user.name}</h1>
                  <p className="text-muted-foreground mb-1 text-lg">@{user.username}</p>
                  <p className="text-sm text-zinc-500">{user.email}</p>
                </div>

                <Button 
                  variant="outline" 
                  className="gap-2 border-zinc-700 hover:bg-zinc-800 hover:border-primary/50"
                  onClick={() => setLocation("/settings")} 
                  data-testid="button-settings"
                >
                  <Settings className="h-4 w-4" />
                  {t("الإعدادات", "Settings")}
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/10 flex items-center justify-center">
                  <ShoppingBag className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">{t("إجمالي الطلبات", "Total Orders")}</p>
                  <p className="text-3xl font-bold">{orders?.length || 0}</p>
                </div>
              </div>

              <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">{t("طلبات مكتملة", "Completed")}</p>
                  <p className="text-3xl font-bold">{completedOrders.length}</p>
                </div>
              </div>

              <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">{t("قيد الانتظار", "Pending")}</p>
                  <p className="text-3xl font-bold">{pendingOrders.length}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="vault" className="w-full">
              <TabsList className="bg-zinc-900/60 border border-zinc-800/50 p-1 rounded-xl mb-8">
                <TabsTrigger value="vault" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-vault">
                  <Key className="h-4 w-4" />
                  {t("الخزنة الآمنة", "Secure Vault")}
                </TabsTrigger>
                <TabsTrigger value="orders" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-orders">
                  <ShoppingBag className="h-4 w-4" />
                  {t("الطلبات", "Orders")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vault">
                <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t("الخزنة الآمنة", "Secure Vault")}</h2>
                      <p className="text-sm text-zinc-500">{t("الوصول إلى منتجاتك المشتراة", "Access your purchased products")}</p>
                    </div>
                  </div>

                  {vaultLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                      ))}
                    </div>
                  ) : vaultItems && vaultItems.length > 0 ? (
                    <div className="space-y-4">
                      {vaultItems.map((vaultItem) => (
                        <div 
                          key={vaultItem.item.id}
                          className="group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-primary/30 transition-all"
                          data-testid={`vault-item-${vaultItem.item.id}`}
                        >
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/10 flex items-center justify-center shrink-0">
                            <Key className="h-7 w-7 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-lg">
                              {vaultItem.product 
                                ? (language === "ar" ? vaultItem.product.titleAr : vaultItem.product.titleEn)
                                : t("منتج", "Product")}
                            </h4>
                            <p className="text-sm text-zinc-500 mb-2">
                              {new Date(vaultItem.order.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <code className="text-xs bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-700 font-mono truncate max-w-[250px]">
                                {vaultItem.item.content}
                              </code>
                              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                                {vaultItem.item.type === "key" ? t("مفتاح", "Key") : 
                                 vaultItem.item.type === "file" ? t("ملف", "File") : 
                                 t("حساب", "Account")}
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            className="gap-2 border-zinc-700 hover:bg-zinc-700 shrink-0"
                            onClick={() => copyToClipboard(vaultItem.item.content, vaultItem.item.id)}
                            data-testid={`button-copy-${vaultItem.item.id}`}
                          >
                            {copiedId === vaultItem.item.id ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            {copiedId === vaultItem.item.id ? t("تم النسخ", "Copied") : t("نسخ", "Copy")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="h-20 w-20 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto mb-6">
                        <Key className="h-10 w-10 text-zinc-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        {t("الخزنة فارغة", "Vault is empty")}
                      </h3>
                      <p className="text-zinc-500 mb-6">
                        {t("لم تقم بشراء أي منتجات بعد", "You haven't purchased any products yet")}
                      </p>
                      <Button onClick={() => setLocation("/products")} className="gap-2" data-testid="button-browse-products">
                        <Sparkles className="h-4 w-4" />
                        {t("تصفح المنتجات", "Browse Products")}
                        <ArrowIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t("سجل الطلبات", "Order History")}</h2>
                      <p className="text-sm text-zinc-500">{t("عرض جميع طلباتك", "View all your orders")}</p>
                    </div>
                  </div>

                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-xl" />
                      ))}
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div 
                          key={order.id}
                          className="flex items-center gap-4 p-5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-primary/30 transition-all"
                          data-testid={`order-item-${order.id}`}
                        >
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/10 flex items-center justify-center">
                            <Package className="h-7 w-7 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">
                              {order.product 
                                ? (language === "ar" ? order.product.titleAr : order.product.titleEn)
                                : t("منتج", "Product")}
                            </h4>
                            <p className="text-sm text-zinc-500">
                              <span className="text-primary font-medium">${order.totalAmount}</span>
                              <span className="mx-2">•</span>
                              {order.paymentMethod.toUpperCase()}
                            </p>
                          </div>
                          <div className="text-left flex flex-col items-end gap-1">
                            {getStatusBadge(order.status)}
                            <p className="text-xs text-zinc-500 mt-1">
                              {new Date(order.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="h-20 w-20 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="h-10 w-10 text-zinc-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        {t("لا توجد طلبات", "No orders yet")}
                      </h3>
                      <p className="text-zinc-500 mb-6">
                        {t("لم تقم بأي طلبات بعد", "You haven't placed any orders yet")}
                      </p>
                      <Button onClick={() => setLocation("/products")} className="gap-2" data-testid="button-start-shopping">
                        <Sparkles className="h-4 w-4" />
                        {t("ابدأ التسوق", "Start Shopping")}
                        <ArrowIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
