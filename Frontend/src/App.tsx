import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

// Customer Store Pages
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import SizeGuide from "./pages/SizeGuide";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/useAuth";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import ResetPassword from "./pages/ResetPassword";
import RefundReturns from "./pages/RefundReturns";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

// Admin Portal Pages & Layout
import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import CreateProduct from "./admin/pages/CreateProduct";
import ProductView from "./admin/pages/ProductView";
import ProductEdit from "./admin/pages/ProductEdit";
import OrderDetails from "./admin/pages/OrderDetails";
import CategoryManagement from "./admin/pages/CategoryManagement";
import ProductReviews from "./admin/pages/ProductReviews";
import UserManagement from "./admin/pages/UserManagement";
import ContactDetails from "./admin/pages/ContactDetails";
import AdminSettings from "./admin/pages/AdminSettings";

import { ProductsProvider } from "./context/ProductsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <AuthProvider>
          <ProductsProvider>
            <ScrollToTop />
          <Routes>
            {/* Customer Storefront Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/collections/:slug" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/refund-returns" element={<RefundReturns />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Distinct Admin Portal Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="create-product" element={<CreateProduct />} />
              <Route path="products/create" element={<CreateProduct />} />
              <Route path="products/:productId" element={<ProductView />} />
              <Route path="products/edit/:productId" element={<ProductEdit />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="orders" element={<OrderDetails />} />
              <Route path="order-details" element={<OrderDetails />} />
              <Route path="reviews" element={<ProductReviews />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="contacts" element={<ContactDetails />} />
              <Route path="contact-details" element={<ContactDetails />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ProductsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
