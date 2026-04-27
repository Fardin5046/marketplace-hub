import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/lib/store";

import PublicLayout from "@/components/layouts/PublicLayout";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import VendorLayout from "@/components/layouts/VendorLayout";
import AdminLayout from "@/components/layouts/AdminLayout";

import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Wishlist from "./pages/Wishlist";
import Search from "./pages/Search";
import Vendors from "./pages/Vendors";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import AccountProfile from "./pages/account/AccountProfile";
import Addresses from "./pages/account/Addresses";
import OrderHistory from "./pages/account/OrderHistory";
import OrderDetails from "./pages/account/OrderDetails";
import InvoicePreview from "./pages/account/InvoicePreview";
import MyReviews from "./pages/account/MyReviews";
import Settings from "./pages/account/Settings";

import VendorOnboarding from "./pages/vendor/VendorOnboarding";
import VendorOverview from "./pages/vendor/VendorOverview";
import VendorProducts from "./pages/vendor/VendorProducts";
import ProductForm from "./pages/vendor/ProductForm";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorRevenue from "./pages/vendor/VendorRevenue";
import VendorPayouts from "./pages/vendor/VendorPayouts";
import VendorStore from "./pages/vendor/VendorStore";
import VendorSettings from "./pages/vendor/VendorSettings";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminCategories from "./pages/admin/AdminCategories";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <StoreProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public marketplace */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/search" element={<Search />} />
              <Route path="/vendors" element={<Vendors />} />
            </Route>

            {/* Auth (no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer account */}
            <Route element={<CustomerLayout />}>
              <Route path="/account" element={<AccountProfile />} />
              <Route path="/account/addresses" element={<Addresses />} />
              <Route path="/account/orders" element={<OrderHistory />} />
              <Route path="/account/orders/:id" element={<OrderDetails />} />
              <Route path="/account/orders/:id/invoice" element={<InvoicePreview />} />
              <Route path="/account/reviews" element={<MyReviews />} />
              <Route path="/account/settings" element={<Settings />} />
            </Route>

            {/* Vendor */}
            <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
            <Route element={<VendorLayout />}>
              <Route path="/vendor" element={<VendorOverview />} />
              <Route path="/vendor/products" element={<VendorProducts />} />
              <Route path="/vendor/products/new" element={<ProductForm />} />
              <Route path="/vendor/products/:id/edit" element={<ProductForm />} />
              <Route path="/vendor/orders" element={<VendorOrders />} />
              <Route path="/vendor/revenue" element={<VendorRevenue />} />
              <Route path="/vendor/payouts" element={<VendorPayouts />} />
              <Route path="/vendor/store" element={<VendorStore />} />
              <Route path="/vendor/settings" element={<VendorSettings />} />
            </Route>

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/vendors" element={<AdminVendors />} />
              <Route path="/admin/disputes" element={<AdminDisputes />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </StoreProvider>
  </QueryClientProvider>
);

export default App;
