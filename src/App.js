import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import { Cart, Checkout } from "./pages/CartCheckout";
import Orders from "./pages/Orders";
import { Login, Register, ForgotPassword } from "./pages/Auth";
import { Contact, Profile } from "./pages/ContactProfile";
import AdminPanel from "./pages/AdminPanel";
import Wishlist from "./pages/Wishlist";
import PolicyPage from "./pages/PolicyPage";
import AdminSiteSettings from "./pages/AdminSiteSettings";
import ScrollToTop from "./components/ScrollToTop";
import WelcomeScreen from "./components/WelcomeScreen";
import "./index.css";

function ProtectedRoute({ children, adminOnly }) {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  if (!adminOnly && isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();
  if (currentUser) return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// Inject AdminSiteSettings into the admin panel via a wrapper route
function AdminSiteSettingsWrapper() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ flex: 1, padding: "28px 32px" }}>
        <AdminSiteSettings />
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/shop" element={<AppLayout><Shop /></AppLayout>} />
      <Route path="/product/:id" element={<AppLayout><ProductDetail /></AppLayout>} />
      <Route path="/contact" element={<AppLayout><Contact /></AppLayout>} />
      <Route path="/policy/:type" element={<AppLayout><PolicyPage /></AppLayout>} />

      {/* Auth */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* User protected */}
      <Route path="/cart" element={<ProtectedRoute><AppLayout><Cart /></AppLayout></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><AppLayout><Checkout /></AppLayout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><AppLayout><Orders /></AppLayout></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><AppLayout><Wishlist /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <WelcomeScreen />
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            style: { background: "#1a1a1a", color: "#f5f0e8", border: "1px solid rgba(212,255,0,0.2)", fontFamily: "Space Grotesk, sans-serif", fontSize: "14px" },
            success: { iconTheme: { primary: "#d4ff00", secondary: "#0a0a0a" } },
            error: { iconTheme: { primary: "#ff2d78", secondary: "#fff" } },
          }} />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
