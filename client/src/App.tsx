import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { ScrollToTop } from "@/components/scroll-to-top";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import CategoryPage from "@/pages/category";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Cart from "@/pages/cart";
import CheckoutSuccess from "@/pages/checkout-success";
import Reviews from "@/pages/reviews";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import VerifyEmail from "@/pages/verify-email";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/products" component={Products} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/vault">{() => <Redirect to="/dashboard" />}</Route>
      <Route path="/settings" component={Settings} />
      <Route path="/admin" component={Admin} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <ScrollToTop />
              <Toaster />
              <Router />
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
