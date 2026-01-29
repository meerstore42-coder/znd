import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  LayoutDashboard, Users, Package, ShoppingBag, DollarSign, TrendingUp, 
  Plus, Edit, Trash2, Ban, Eye, MoreHorizontal, Activity, Shield, FolderTree, Star, Key, Check, X
} from "lucide-react";
import { useLocation, Redirect } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, Product, Category, Order, Review, ProductKey } from "@shared/schema";

export default function Admin() {
  const { t, language } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    price: "",
    categoryId: "",
    stock: "10",
  });
  const [editProduct, setEditProduct] = useState({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    price: "",
    categoryId: "",
    stock: "",
    isActive: true,
  });
  
  // Category management state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ nameAr: "", nameEn: "", slug: "", icon: "package" });
  const [editCategory, setEditCategory] = useState({ nameAr: "", nameEn: "", slug: "", icon: "" });
  
  // Product Keys state
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKey, setNewKey] = useState({ productId: "", keyValue: "" });
  const [selectedProductForKeys, setSelectedProductForKeys] = useState<string | null>(null);

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!user?.isAdmin,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: !!user?.isAdmin,
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: !!user?.isAdmin,
  });

  const { data: stats } = useQuery<{ totalSales: number; totalRevenue: string; totalUsers: number; todayVisitors: number }>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  // Reviews query
  type ReviewWithDetails = Review & { user: { name: string; avatar: string | null }; product: { titleAr: string; titleEn: string } | null };
  const { data: reviews } = useQuery<ReviewWithDetails[]>({
    queryKey: ["/api/admin/reviews"],
    enabled: !!user?.isAdmin,
  });

  // Product Keys query
  const { data: productKeys } = useQuery<ProductKey[]>({
    queryKey: ["/api/admin/product-keys"],
    enabled: !!user?.isAdmin,
  });

  const addProductMutation = useMutation({
    mutationFn: async (product: typeof newProduct) => {
      return apiRequest("POST", "/api/admin/products", {
        ...product,
        price: product.price,
        stock: parseInt(product.stock),
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddingProduct(false);
      setNewProduct({
        titleAr: "",
        titleEn: "",
        descriptionAr: "",
        descriptionEn: "",
        price: "",
        categoryId: "",
        stock: "10",
      });
      toast({
        title: t("تم إضافة المنتج", "Product added"),
        description: t("تم إضافة المنتج بنجاح", "Product has been added successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("خطأ", "Error"),
        description: error.message || t("فشل إضافة المنتج", "Failed to add product"),
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("DELETE", `/api/admin/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: t("تم حذف المنتج", "Product deleted"),
        description: t("تم حذف المنتج بنجاح", "Product has been deleted successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("خطأ", "Error"),
        description: error.message || t("فشل حذف المنتج", "Failed to delete product"),
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: any }) => {
      return apiRequest("PATCH", `/api/admin/products/${productId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      toast({
        title: t("تم تحديث المنتج", "Product updated"),
        description: t("تم تحديث المنتج بنجاح", "Product has been updated successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("خطأ", "Error"),
        description: error.message || t("فشل تحديث المنتج", "Failed to update product"),
        variant: "destructive",
      });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, isBanned }: { userId: string; isBanned: boolean }) => {
      return apiRequest("PATCH", `/api/admin/users/${userId}/ban`, { isBanned });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: variables.isBanned ? t("تم حظر المستخدم", "User banned") : t("تم رفع الحظر", "User unbanned"),
        description: variables.isBanned 
          ? t("تم حظر المستخدم بنجاح", "User has been banned successfully")
          : t("تم رفع الحظر عن المستخدم بنجاح", "User has been unbanned successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("خطأ", "Error"),
        description: error.message || t("فشلت العملية", "Operation failed"),
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: t("تم تحديث حالة الطلب", "Order status updated"),
        description: t("تم تحديث حالة الطلب بنجاح", "Order status has been updated successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("خطأ", "Error"),
        description: error.message || t("فشل تحديث حالة الطلب", "Failed to update order status"),
        variant: "destructive",
      });
    },
  });

  // Category mutations
  const addCategoryMutation = useMutation({
    mutationFn: async (category: typeof newCategory) => {
      return apiRequest("POST", "/api/admin/categories", category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsAddingCategory(false);
      setNewCategory({ nameAr: "", nameEn: "", slug: "", icon: "package" });
      toast({ title: t("تم إضافة التصنيف", "Category added") });
    },
    onError: (error: any) => {
      toast({ title: t("خطأ", "Error"), description: error.message, variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ categoryId, data }: { categoryId: string; data: any }) => {
      return apiRequest("PATCH", `/api/admin/categories/${categoryId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setEditingCategory(null);
      toast({ title: t("تم تحديث التصنيف", "Category updated") });
    },
    onError: (error: any) => {
      toast({ title: t("خطأ", "Error"), description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return apiRequest("DELETE", `/api/admin/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: t("تم حذف التصنيف", "Category deleted") });
    },
    onError: (error: any) => {
      toast({ title: t("خطأ", "Error"), description: error.message, variant: "destructive" });
    },
  });

  // Review mutations
  const approveReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("PATCH", `/api/admin/reviews/${reviewId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: t("تمت الموافقة", "Approved") });
    },
    onError: (error: any) => {
      toast({ title: t("خطأ", "Error"), description: error.message, variant: "destructive" });
    },
  });

  const rejectReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("PATCH", `/api/admin/reviews/${reviewId}/reject`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: t("تم الرفض", "Rejected") });
    },
    onError: (error: any) => {
      toast({ title: t("خطأ", "Error"), description: error.message, variant: "destructive" });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("DELETE", `/api/admin/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: t("تم حذف المراجعة", "Review deleted") });
    },
    onError: (error: any) => {
      toast({ title: t("خطأ", "Error"), description: error.message, variant: "destructive" });
    },
  });

  // Product Key mutations
  const addProductKeyMutation = useMutation({
    mutationFn: async (key: { productId: string; keyValue: string }) => {
      return apiRequest("POST", "/api/admin/product-keys", key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddingKey(false);
      setNewKey({ productId: "", keyValue: "" });
      toast({ title: t("تم إضافة المفتاح", "Key added") });
    },
    onError: (error: any) => {
      toast({ title: t("خطأ", "Error"), description: error.message, variant: "destructive" });
    },
  });

  const deleteProductKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      return apiRequest("DELETE", `/api/admin/product-keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-keys"] });
      toast({ title: t("تم حذف المفتاح", "Key deleted") });
    },
    onError: (error: any) => {
      toast({ title: t("خطأ", "Error"), description: error.message, variant: "destructive" });
    },
  });

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditProduct({
      titleAr: product.titleAr,
      titleEn: product.titleEn,
      descriptionAr: product.descriptionAr || "",
      descriptionEn: product.descriptionEn || "",
      price: product.price,
      categoryId: product.categoryId || "",
      stock: product.stock.toString(),
      isActive: product.isActive,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Redirect to="/" />;
  }

  const totalRevenue = stats?.totalRevenue || "0";
  const totalSales = stats?.totalSales || 0;
  const totalUsers = stats?.totalUsers || users?.length || 0;
  const todayVisitors = stats?.todayVisitors || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("لوحة الإدارة", "Admin Dashboard")}</h1>
              <p className="text-muted-foreground text-sm">
                {t("إدارة المنصة والمستخدمين والمنتجات", "Manage platform, users, and products")}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("إجمالي الإيرادات", "Total Revenue")}</p>
                  <p className="text-2xl font-bold">${totalRevenue}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("إجمالي المبيعات", "Total Sales")}</p>
                  <p className="text-2xl font-bold">{totalSales}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("المستخدمين", "Total Users")}</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("زوار اليوم", "Today's Visitors")}</p>
                  <p className="text-2xl font-bold">{todayVisitors}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="mb-6 flex-wrap gap-1">
              <TabsTrigger value="products" className="gap-2" data-testid="admin-tab-products">
                <Package className="h-4 w-4" />
                {t("المنتجات", "Products")}
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2" data-testid="admin-tab-categories">
                <FolderTree className="h-4 w-4" />
                {t("التصنيفات", "Categories")}
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2" data-testid="admin-tab-users">
                <Users className="h-4 w-4" />
                {t("المستخدمين", "Users")}
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2" data-testid="admin-tab-orders">
                <ShoppingBag className="h-4 w-4" />
                {t("الطلبات", "Orders")}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2" data-testid="admin-tab-reviews">
                <Star className="h-4 w-4" />
                {t("المراجعات", "Reviews")}
              </TabsTrigger>
              <TabsTrigger value="keys" className="gap-2" data-testid="admin-tab-keys">
                <Key className="h-4 w-4" />
                {t("المفاتيح", "Keys")}
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t("إدارة المنتجات", "Manage Products")}</CardTitle>
                    <CardDescription>{t("إضافة وتعديل وحذف المنتجات", "Add, edit, and delete products")}</CardDescription>
                  </div>
                  <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                    <DialogTrigger asChild>
                      <Button className="gap-2" data-testid="button-add-product">
                        <Plus className="h-4 w-4" />
                        {t("إضافة منتج", "Add Product")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{t("إضافة منتج جديد", "Add New Product")}</DialogTitle>
                        <DialogDescription>
                          {t("أدخل تفاصيل المنتج الجديد", "Enter the details of the new product")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label>{t("العنوان (عربي)", "Title (Arabic)")}</Label>
                          <Input 
                            value={newProduct.titleAr}
                            onChange={(e) => setNewProduct({...newProduct, titleAr: e.target.value})}
                            placeholder={t("عنوان المنتج بالعربية", "Product title in Arabic")}
                            data-testid="input-product-title-ar"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("العنوان (إنجليزي)", "Title (English)")}</Label>
                          <Input 
                            value={newProduct.titleEn}
                            onChange={(e) => setNewProduct({...newProduct, titleEn: e.target.value})}
                            placeholder="Product title in English"
                            data-testid="input-product-title-en"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>{t("الوصف (عربي)", "Description (Arabic)")}</Label>
                          <Textarea 
                            value={newProduct.descriptionAr}
                            onChange={(e) => setNewProduct({...newProduct, descriptionAr: e.target.value})}
                            placeholder={t("وصف المنتج بالعربية", "Product description in Arabic")}
                            data-testid="input-product-desc-ar"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>{t("الوصف (إنجليزي)", "Description (English)")}</Label>
                          <Textarea 
                            value={newProduct.descriptionEn}
                            onChange={(e) => setNewProduct({...newProduct, descriptionEn: e.target.value})}
                            placeholder="Product description in English"
                            data-testid="input-product-desc-en"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("السعر (دولار)", "Price (USD)")}</Label>
                          <Input 
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                            placeholder="9.99"
                            data-testid="input-product-price"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("الكمية", "Stock")}</Label>
                          <Input 
                            type="number"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                            placeholder="10"
                            data-testid="input-product-stock"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>{t("القسم", "Category")}</Label>
                          <Select 
                            value={newProduct.categoryId}
                            onValueChange={(value) => setNewProduct({...newProduct, categoryId: value})}
                          >
                            <SelectTrigger data-testid="select-product-category">
                              <SelectValue placeholder={t("اختر القسم", "Select category")} />
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {language === "ar" ? cat.nameAr : cat.nameEn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
                          {t("إلغاء", "Cancel")}
                        </Button>
                        <Button 
                          onClick={() => addProductMutation.mutate(newProduct)}
                          disabled={addProductMutation.isPending}
                          data-testid="button-save-product"
                        >
                          {addProductMutation.isPending ? t("جاري الحفظ...", "Saving...") : t("حفظ المنتج", "Save Product")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Product Dialog */}
                  <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{t("تعديل المنتج", "Edit Product")}</DialogTitle>
                        <DialogDescription>
                          {t("قم بتعديل معلومات المنتج", "Edit product information")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t("العنوان بالعربية", "Arabic Title")}</Label>
                            <Input 
                              value={editProduct.titleAr}
                              onChange={(e) => setEditProduct({...editProduct, titleAr: e.target.value})}
                              data-testid="input-edit-title-ar"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("العنوان بالإنجليزية", "English Title")}</Label>
                            <Input 
                              value={editProduct.titleEn}
                              onChange={(e) => setEditProduct({...editProduct, titleEn: e.target.value})}
                              data-testid="input-edit-title-en"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{t("الوصف بالعربية", "Arabic Description")}</Label>
                          <Textarea 
                            value={editProduct.descriptionAr}
                            onChange={(e) => setEditProduct({...editProduct, descriptionAr: e.target.value})}
                            rows={2}
                            data-testid="input-edit-desc-ar"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("الوصف بالإنجليزية", "English Description")}</Label>
                          <Textarea 
                            value={editProduct.descriptionEn}
                            onChange={(e) => setEditProduct({...editProduct, descriptionEn: e.target.value})}
                            rows={2}
                            data-testid="input-edit-desc-en"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>{t("السعر", "Price")}</Label>
                            <Input 
                              type="number"
                              value={editProduct.price}
                              onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                              step="0.01"
                              data-testid="input-edit-price"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("الكمية", "Stock")}</Label>
                            <Input 
                              type="number"
                              value={editProduct.stock}
                              onChange={(e) => setEditProduct({...editProduct, stock: e.target.value})}
                              data-testid="input-edit-stock"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("الحالة", "Status")}</Label>
                            <Select 
                              value={editProduct.isActive ? "active" : "inactive"}
                              onValueChange={(val) => setEditProduct({...editProduct, isActive: val === "active"})}
                            >
                              <SelectTrigger data-testid="select-edit-status">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">{t("نشط", "Active")}</SelectItem>
                                <SelectItem value="inactive">{t("غير نشط", "Inactive")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{t("القسم", "Category")}</Label>
                          <Select 
                            value={editProduct.categoryId}
                            onValueChange={(val) => setEditProduct({...editProduct, categoryId: val})}
                          >
                            <SelectTrigger data-testid="select-edit-category">
                              <SelectValue placeholder={t("اختر القسم", "Select category")} />
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {language === "ar" ? cat.nameAr : cat.nameEn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingProduct(null)}>
                          {t("إلغاء", "Cancel")}
                        </Button>
                        <Button 
                          onClick={() => {
                            if (editingProduct) {
                              updateProductMutation.mutate({
                                productId: editingProduct.id,
                                data: {
                                  ...editProduct,
                                  price: editProduct.price,
                                  stock: parseInt(editProduct.stock),
                                }
                              });
                            }
                          }}
                          disabled={updateProductMutation.isPending}
                          data-testid="button-update-product"
                        >
                          {updateProductMutation.isPending ? t("جاري الحفظ...", "Saving...") : t("حفظ التغييرات", "Save Changes")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                      ))}
                    </div>
                  ) : products && products.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("المنتج", "Product")}</TableHead>
                          <TableHead>{t("السعر", "Price")}</TableHead>
                          <TableHead>{t("الكمية", "Stock")}</TableHead>
                          <TableHead>{t("الحالة", "Status")}</TableHead>
                          <TableHead>{t("إجراءات", "Actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium">{language === "ar" ? product.titleAr : product.titleEn}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {categories?.find(c => c.id === product.categoryId)?.nameAr || ""}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>${product.price}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              {product.isActive ? (
                                <Badge className="bg-green-500/20 text-green-500">{t("نشط", "Active")}</Badge>
                              ) : (
                                <Badge variant="secondary">{t("غير نشط", "Inactive")}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openEditDialog(product)}
                                  data-testid={`button-edit-${product.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive"
                                  onClick={() => deleteProductMutation.mutate(product.id)}
                                  disabled={deleteProductMutation.isPending}
                                  data-testid={`button-delete-${product.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t("لا توجد منتجات", "No products yet")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>{t("إدارة المستخدمين", "Manage Users")}</CardTitle>
                  <CardDescription>{t("عرض وإدارة حسابات المستخدمين", "View and manage user accounts")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                      ))}
                    </div>
                  ) : users && users.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("المستخدم", "User")}</TableHead>
                          <TableHead>{t("البريد الإلكتروني", "Email")}</TableHead>
                          <TableHead>{t("الدور", "Role")}</TableHead>
                          <TableHead>{t("الحالة", "Status")}</TableHead>
                          <TableHead>{t("إجراءات", "Actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id} data-testid={`user-row-${u.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary font-medium">{u.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="font-medium">{u.name}</p>
                                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              {u.isAdmin ? (
                                <Badge className="bg-primary/20 text-primary">{t("مدير", "Admin")}</Badge>
                              ) : (
                                <Badge variant="secondary">{t("مستخدم", "User")}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {(u as any).isBanned ? (
                                <Badge className="bg-red-500/20 text-red-500">{t("محظور", "Banned")}</Badge>
                              ) : u.isVerified ? (
                                <Badge className="bg-green-500/20 text-green-500">{t("نشط", "Active")}</Badge>
                              ) : (
                                <Badge variant="secondary">{t("غير موثق", "Unverified")}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {!u.isAdmin && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className={(u as any).isBanned ? "text-green-500" : "text-destructive"}
                                    onClick={() => banUserMutation.mutate({ userId: u.id, isBanned: !(u as any).isBanned })}
                                    disabled={banUserMutation.isPending}
                                    data-testid={`button-ban-${u.id}`}
                                  >
                                    {(u as any).isBanned ? <Shield className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t("لا يوجد مستخدمين", "No users yet")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>{t("جميع الطلبات", "All Orders")}</CardTitle>
                  <CardDescription>{t("عرض وإدارة جميع الطلبات", "View and manage all orders")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders && orders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("رقم الطلب", "Order ID")}</TableHead>
                          <TableHead>{t("المستخدم", "User")}</TableHead>
                          <TableHead>{t("المبلغ", "Amount")}</TableHead>
                          <TableHead>{t("طريقة الدفع", "Payment")}</TableHead>
                          <TableHead>{t("الحالة", "Status")}</TableHead>
                          <TableHead>{t("التاريخ", "Date")}</TableHead>
                          <TableHead>{t("إجراءات", "Actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                            <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                            <TableCell>{order.userId.slice(0, 8)}...</TableCell>
                            <TableCell>${order.totalAmount}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{order.paymentMethod.toUpperCase()}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                order.status === "completed" ? "bg-green-500/20 text-green-500" :
                                order.status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                                "bg-red-500/20 text-red-500"
                              }>
                                {order.status === "completed" ? t("مكتمل", "Completed") :
                                 order.status === "pending" ? t("قيد الانتظار", "Pending") :
                                 t("ملغي", "Cancelled")}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {order.status === "pending" && (
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, status: "completed" })}
                                    disabled={updateOrderStatusMutation.isPending}
                                    data-testid={`button-complete-${order.id}`}
                                  >
                                    {t("تأكيد", "Confirm")}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, status: "cancelled" })}
                                    disabled={updateOrderStatusMutation.isPending}
                                    data-testid={`button-cancel-${order.id}`}
                                  >
                                    {t("إلغاء", "Cancel")}
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t("لا توجد طلبات", "No orders yet")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle>{t("إدارة التصنيفات", "Manage Categories")}</CardTitle>
                    <CardDescription>{t("إضافة وتعديل وحذف التصنيفات", "Add, edit, and delete categories")}</CardDescription>
                  </div>
                  <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                    <DialogTrigger asChild>
                      <Button className="gap-2" data-testid="button-add-category">
                        <Plus className="h-4 w-4" />
                        {t("إضافة تصنيف", "Add Category")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("إضافة تصنيف جديد", "Add New Category")}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>{t("الاسم (عربي)", "Name (Arabic)")}</Label>
                          <Input 
                            value={newCategory.nameAr}
                            onChange={(e) => setNewCategory({...newCategory, nameAr: e.target.value})}
                            placeholder={t("اسم التصنيف بالعربية", "Category name in Arabic")}
                            data-testid="input-category-name-ar"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("الاسم (إنجليزي)", "Name (English)")}</Label>
                          <Input 
                            value={newCategory.nameEn}
                            onChange={(e) => setNewCategory({...newCategory, nameEn: e.target.value})}
                            placeholder={t("اسم التصنيف بالإنجليزية", "Category name in English")}
                            data-testid="input-category-name-en"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("الاسم المختصر (slug)", "Slug")}</Label>
                          <Input 
                            value={newCategory.slug}
                            onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                            placeholder="category-slug"
                            data-testid="input-category-slug"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("الأيقونة", "Icon")}</Label>
                          <Select value={newCategory.icon} onValueChange={(v) => setNewCategory({...newCategory, icon: v})}>
                            <SelectTrigger data-testid="select-category-icon">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="code">Code</SelectItem>
                              <SelectItem value="package">Package</SelectItem>
                              <SelectItem value="gamepad">Gamepad</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="key">Key</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={() => addCategoryMutation.mutate(newCategory)} 
                          disabled={addCategoryMutation.isPending || !newCategory.nameAr || !newCategory.nameEn || !newCategory.slug}
                          data-testid="button-submit-category"
                        >
                          {addCategoryMutation.isPending ? t("جاري الإضافة...", "Adding...") : t("إضافة", "Add")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {categories && categories.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("الاسم (عربي)", "Name (Arabic)")}</TableHead>
                          <TableHead>{t("الاسم (إنجليزي)", "Name (English)")}</TableHead>
                          <TableHead>{t("الاسم المختصر", "Slug")}</TableHead>
                          <TableHead>{t("الأيقونة", "Icon")}</TableHead>
                          <TableHead>{t("إجراءات", "Actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((cat) => (
                          <TableRow key={cat.id} data-testid={`category-row-${cat.id}`}>
                            <TableCell className="font-medium">{cat.nameAr}</TableCell>
                            <TableCell>{cat.nameEn}</TableCell>
                            <TableCell className="font-mono text-sm">{cat.slug}</TableCell>
                            <TableCell>{cat.icon}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setEditingCategory(cat);
                                    setEditCategory({ nameAr: cat.nameAr, nameEn: cat.nameEn, slug: cat.slug, icon: cat.icon || "package" });
                                  }}
                                  data-testid={`button-edit-category-${cat.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive"
                                  onClick={() => deleteCategoryMutation.mutate(cat.id)}
                                  disabled={deleteCategoryMutation.isPending}
                                  data-testid={`button-delete-category-${cat.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t("لا توجد تصنيفات", "No categories yet")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Category Dialog */}
              <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("تعديل التصنيف", "Edit Category")}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>{t("الاسم (عربي)", "Name (Arabic)")}</Label>
                      <Input 
                        value={editCategory.nameAr}
                        onChange={(e) => setEditCategory({...editCategory, nameAr: e.target.value})}
                        data-testid="input-edit-category-name-ar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("الاسم (إنجليزي)", "Name (English)")}</Label>
                      <Input 
                        value={editCategory.nameEn}
                        onChange={(e) => setEditCategory({...editCategory, nameEn: e.target.value})}
                        data-testid="input-edit-category-name-en"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("الاسم المختصر", "Slug")}</Label>
                      <Input 
                        value={editCategory.slug}
                        onChange={(e) => setEditCategory({...editCategory, slug: e.target.value})}
                        data-testid="input-edit-category-slug"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("الأيقونة", "Icon")}</Label>
                      <Select value={editCategory.icon} onValueChange={(v) => setEditCategory({...editCategory, icon: v})}>
                        <SelectTrigger data-testid="select-edit-category-icon">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="code">Code</SelectItem>
                          <SelectItem value="package">Package</SelectItem>
                          <SelectItem value="gamepad">Gamepad</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="key">Key</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={() => editingCategory && updateCategoryMutation.mutate({ categoryId: editingCategory.id, data: editCategory })} 
                      disabled={updateCategoryMutation.isPending}
                      data-testid="button-update-category"
                    >
                      {updateCategoryMutation.isPending ? t("جاري التحديث...", "Updating...") : t("تحديث", "Update")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>{t("إدارة المراجعات", "Manage Reviews")}</CardTitle>
                  <CardDescription>{t("الموافقة أو رفض مراجعات العملاء", "Approve or reject customer reviews")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {reviews && reviews.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("العميل", "Customer")}</TableHead>
                          <TableHead>{t("المنتج", "Product")}</TableHead>
                          <TableHead>{t("التقييم", "Rating")}</TableHead>
                          <TableHead>{t("المراجعة", "Review")}</TableHead>
                          <TableHead>{t("الحالة", "Status")}</TableHead>
                          <TableHead>{t("إجراءات", "Actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviews.map((review) => (
                          <TableRow key={review.id} data-testid={`review-row-${review.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary text-sm font-medium">{review.user.name.charAt(0)}</span>
                                </div>
                                <span className="font-medium">{review.user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{language === "ar" ? review.product?.titleAr : review.product?.titleEn}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
                            <TableCell>
                              {review.isApproved ? (
                                <Badge className="bg-green-500/20 text-green-500">{t("موافق عليه", "Approved")}</Badge>
                              ) : (
                                <Badge variant="secondary">{t("بانتظار الموافقة", "Pending")}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {!review.isApproved && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-green-500"
                                    onClick={() => approveReviewMutation.mutate(review.id)}
                                    disabled={approveReviewMutation.isPending}
                                    data-testid={`button-approve-review-${review.id}`}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                {review.isApproved && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-yellow-500"
                                    onClick={() => rejectReviewMutation.mutate(review.id)}
                                    disabled={rejectReviewMutation.isPending}
                                    data-testid={`button-reject-review-${review.id}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive"
                                  onClick={() => deleteReviewMutation.mutate(review.id)}
                                  disabled={deleteReviewMutation.isPending}
                                  data-testid={`button-delete-review-${review.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t("لا توجد مراجعات", "No reviews yet")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Product Keys Tab */}
            <TabsContent value="keys">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle>{t("إدارة مفاتيح المنتجات", "Product Keys Management")}</CardTitle>
                    <CardDescription>{t("إضافة وعرض وحذف مفاتيح المنتجات الرقمية", "Add, view, and delete digital product keys")}</CardDescription>
                  </div>
                  <Dialog open={isAddingKey} onOpenChange={setIsAddingKey}>
                    <DialogTrigger asChild>
                      <Button className="gap-2" data-testid="button-add-key">
                        <Plus className="h-4 w-4" />
                        {t("إضافة مفتاح", "Add Key")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("إضافة مفتاح جديد", "Add New Key")}</DialogTitle>
                        <DialogDescription>{t("سيتم تحديث المخزون تلقائياً", "Stock will be updated automatically")}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>{t("المنتج", "Product")}</Label>
                          <Select value={newKey.productId} onValueChange={(v) => setNewKey({...newKey, productId: v})}>
                            <SelectTrigger data-testid="select-key-product">
                              <SelectValue placeholder={t("اختر المنتج", "Select product")} />
                            </SelectTrigger>
                            <SelectContent>
                              {products?.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {language === "ar" ? p.titleAr : p.titleEn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t("المفتاح", "Key Value")}</Label>
                          <Input 
                            value={newKey.keyValue}
                            onChange={(e) => setNewKey({...newKey, keyValue: e.target.value})}
                            placeholder={t("أدخل المفتاح", "Enter the key")}
                            data-testid="input-key-value"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={() => addProductKeyMutation.mutate(newKey)} 
                          disabled={addProductKeyMutation.isPending || !newKey.productId || !newKey.keyValue}
                          data-testid="button-submit-key"
                        >
                          {addProductKeyMutation.isPending ? t("جاري الإضافة...", "Adding...") : t("إضافة", "Add")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {productKeys && productKeys.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("المنتج", "Product")}</TableHead>
                          <TableHead>{t("المفتاح", "Key")}</TableHead>
                          <TableHead>{t("الحالة", "Status")}</TableHead>
                          <TableHead>{t("تاريخ الإنشاء", "Created")}</TableHead>
                          <TableHead>{t("إجراءات", "Actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productKeys.map((key) => {
                          const product = products?.find(p => p.id === key.productId);
                          return (
                            <TableRow key={key.id} data-testid={`key-row-${key.id}`}>
                              <TableCell>{language === "ar" ? product?.titleAr : product?.titleEn}</TableCell>
                              <TableCell className="font-mono text-sm">{key.keyValue?.slice(0, 20) ?? "N/A"}...</TableCell>
                              <TableCell>
                                {key.isUsed ? (
                                  <Badge className="bg-red-500/20 text-red-500">{t("مستخدم", "Used")}</Badge>
                                ) : key.isReserved ? (
                                  <Badge className="bg-yellow-500/20 text-yellow-500">{t("محجوز", "Reserved")}</Badge>
                                ) : (
                                  <Badge className="bg-green-500/20 text-green-500">{t("متاح", "Available")}</Badge>
                                )}
                              </TableCell>
                              <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {!key.isUsed && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive"
                                    onClick={() => deleteProductKeyMutation.mutate(key.id)}
                                    disabled={deleteProductKeyMutation.isPending}
                                    data-testid={`button-delete-key-${key.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t("لا توجد مفاتيح", "No keys yet")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
