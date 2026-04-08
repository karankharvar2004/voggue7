import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, Menu, X, LogOut, Settings, Package, Heart, Home, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../pages/Home";
import toast from "react-hot-toast";
import { dataManager } from "../dataManager";

export default function Navbar() {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const { wishlist } = useWishlist();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    dataManager.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location]);

  // Close menu on outside click
  useEffect(() => {
    if (dropOpen) {
      const close = (e) => { if (!e.target.closest(".user-drop")) setDropOpen(false); };
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }
  }, [dropOpen]);

  async function handleLogout() {
    await logout();
    toast.success("Logged out! See ya 👋");
    navigate("/");
  }

  const isActive = (path) => location.pathname === path || location.pathname + location.search === path;

  return (
    <>
      {/* Announcement bar */}
      <div className="announcement">
        <div className="marquee-wrap">
          <div className="marquee-track">
            {"✦ FREE SHIPPING OVER ₹999 ✦ COD AVAILABLE ✦ 7-DAY RETURNS ✦ GENZ DRIP ONLY ".repeat(6)}
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(10,10,10,0.96)" : "var(--black)",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: "1px solid var(--border)",
        transition: "all 0.3s ease",
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 90 }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <img src="/Logo.png?v=3" alt="Voggue7 Logo" style={{ height: 76, objectFit: "contain", filter: "invert(1)" }} />
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="desktop-nav-links">
            <Link to="/shop" style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: isActive("/shop") ? "var(--neon)" : "var(--gray3)", transition: "all 0.2s" }}>All Drops</Link>

            {categories.map(cat => (
              <div key={cat.id} style={{ position: "relative" }} className="nav-cat-drop">
                <Link to={`/shop?cat=${encodeURIComponent(cat.name)}`} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: location.search.includes(`cat=${cat.name}`) ? "var(--neon)" : "var(--gray3)", transition: "all 0.2s", display: "block" }}>
                  {cat.name}
                </Link>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="nav-cat-menu" style={{ position: "absolute", top: "100%", left: 0, background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", minWidth: 160, display: "flex", flexDirection: "column", gap: 4, zIndex: 300, opacity: 0, visibility: "hidden", transition: "all 0.2s", transform: "translateY(10px)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                    {cat.subcategories.map(sub => (
                      <Link key={sub.id} to={`/shop?cat=${encodeURIComponent(cat.name)}&subcat=${encodeURIComponent(sub.name)}`} className="nav-cat-item" style={{ padding: "8px 12px", fontSize: 13, color: "var(--gray3)", borderRadius: 8, transition: "0.2s", textDecoration: "none" }}>
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {currentUser && !isAdmin && (
              <Link to="/orders" style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: isActive("/orders") ? "var(--neon)" : "var(--gray3)", transition: "all 0.2s" }}>Track</Link>
            )}
            <Link to="/contact" style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: isActive("/contact") ? "var(--neon)" : "var(--gray3)", transition: "all 0.2s" }}>Contact</Link>
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {currentUser ? (
              <>
                {!isAdmin && (
                  <>
                    <Link to="/wishlist" style={{ position: "relative", padding: 8, color: "var(--gray3)", display: "flex" }} className="desktop-only">
                      <Heart size={19} />
                      {wishlist.length > 0 && <span style={{ position: "absolute", top: 4, right: 4, background: "var(--neon2)", color: "white", fontSize: 8, fontWeight: 800, width: 14, height: 14, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{wishlist.length}</span>}
                    </Link>
                    <Link to="/cart" style={{ position: "relative", padding: 8, color: "var(--gray3)", display: "flex" }} className="desktop-only">
                      <ShoppingBag size={19} />
                      {count > 0 && <span style={{ position: "absolute", top: 4, right: 4, background: "var(--neon)", color: "var(--black)", fontSize: 8, fontWeight: 800, width: 14, height: 14, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>}
                    </Link>
                  </>
                )}
                {/* Avatar dropdown */}
                <div style={{ position: "relative" }} className="user-drop">
                  <button onClick={(e) => { e.stopPropagation(); setDropOpen(!dropOpen); }}
                    style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--white)", flexShrink: 0 }}>
                    <User size={15} />
                  </button>
                  {dropOpen && (
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 14, padding: 8, minWidth: 190, zIndex: 200, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
                      <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{userProfile?.name || "User"}</div>
                        <div style={{ fontSize: 11, color: "var(--gray3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{currentUser.email}</div>
                        {isAdmin && <span className="badge badge-neon" style={{ marginTop: 6, fontSize: 10 }}>Admin</span>}
                      </div>
                      {isAdmin ? (
                        <NavDropItem label="Admin Panel" to="/admin" icon={<Settings size={13} />} onClick={() => setDropOpen(false)} />
                      ) : (
                        <>
                          <NavDropItem label="My Orders" to="/orders" icon={<Package size={13} />} onClick={() => setDropOpen(false)} />
                          <NavDropItem label="Wishlist" to="/wishlist" icon={<Heart size={13} />} onClick={() => setDropOpen(false)} />
                          <NavDropItem label="Profile" to="/profile" icon={<User size={13} />} onClick={() => setDropOpen(false)} />
                        </>
                      )}
                      <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 13, borderRadius: 8 }}>
                        <LogOut size={13} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", gap: 6 }}>
                <Link to="/login" className="btn btn-secondary" style={{ padding: "7px 14px", fontSize: 12 }}>Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: "7px 14px", fontSize: 12 }}>Sign Up</Link>
              </div>
            )}
            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", color: "var(--white)", cursor: "pointer", padding: 8, display: "none", alignItems: "center" }}
              className="mobile-hamburger">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {menuOpen && (
          <div style={{ background: "var(--gray)", borderTop: "1px solid var(--border)", padding: "12px 16px 20px", maxHeight: "80vh", overflowY: "auto" }}>
            <Link to="/shop" style={{ display: "block", padding: "12px 4px", fontSize: 16, fontWeight: 600, color: "var(--gray3)", borderBottom: "1px solid var(--border)", textDecoration: "none" }}>🛍️ All Drops</Link>

            {categories.map(cat => (
              <div key={cat.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <Link to={`/shop?cat=${encodeURIComponent(cat.name)}`} style={{ display: "block", padding: "12px 4px", fontSize: 16, fontWeight: 600, color: "var(--gray3)", textDecoration: "none" }}>{cat.name}</Link>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div style={{ paddingLeft: 16, paddingBottom: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    {cat.subcategories.map(sub => (
                      <Link key={sub.id} to={`/shop?cat=${encodeURIComponent(cat.name)}&subcat=${encodeURIComponent(sub.name)}`} style={{ fontSize: 14, color: "var(--gray3)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: "var(--border)" }}>↳</span> {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link to="/contact" style={{ display: "block", padding: "12px 4px", fontSize: 16, fontWeight: 600, color: "var(--gray3)", borderBottom: "1px solid var(--border)", textDecoration: "none" }}>📞 Contact</Link>
            {currentUser && !isAdmin && (
              <>
                <Link to="/orders" style={{ display: "block", padding: "12px 4px", fontSize: 16, fontWeight: 600, color: "var(--gray3)", borderBottom: "1px solid var(--border)" }}>📦 Track Order</Link>
                <Link to="/profile" style={{ display: "block", padding: "12px 4px", fontSize: 16, fontWeight: 600, color: "var(--gray3)", borderBottom: "1px solid var(--border)" }}>👤 Profile</Link>
              </>
            )}
            {currentUser && isAdmin && (
              <Link to="/admin" style={{ display: "block", padding: "12px 4px", fontSize: 16, fontWeight: 700, color: "var(--neon)", borderBottom: "1px solid var(--border)" }}>⚡ Admin Panel</Link>
            )}
            {!currentUser && (
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <Link to="/login" className="btn btn-secondary" style={{ flex: 1 }}>Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ flex: 1 }}>Sign Up</Link>
              </div>
            )}
            {currentUser && (
              <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "12px 4px", background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Mobile Bottom Nav — for users (not admin) */}
      {currentUser && !isAdmin && (
        <nav className="mobile-bottom-nav">
          {[
            ["/", <Home size={20} />, "Home"],
            ["/shop", <Search size={20} />, "Shop"],
            ["/wishlist", <Heart size={20} />, "Wishlist", wishlist.length],
            ["/cart", <ShoppingBag size={20} />, "Cart", count],
            ["/orders", <Package size={20} />, "Orders"],
          ].map(([path, icon, label, badge]) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 4px", color: active ? "var(--neon)" : "var(--gray3)", position: "relative", textDecoration: "none" }}>
                <div style={{ position: "relative" }}>
                  {icon}
                  {badge > 0 && (
                    <span style={{ position: "absolute", top: -4, right: -6, background: active ? "var(--black)" : "var(--neon)", color: active ? "var(--neon)" : "var(--black)", fontSize: 9, fontWeight: 800, width: 14, height: 14, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid var(--black)" }}>
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Guest mobile bottom nav */}
      {!currentUser && (
        <nav className="mobile-bottom-nav">
          {[
            ["/", <Home size={20} />, "Home"],
            ["/shop", <Search size={20} />, "Shop"],
            ["/contact", <Package size={20} />, "Contact"],
            ["/login", <User size={20} />, "Login"],
          ].map(([path, icon, label]) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 4px", color: active ? "var(--neon)" : "var(--gray3)", textDecoration: "none" }}>
                {icon}
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      <style>{`
        @media (max-width: 767px) {
          .desktop-nav-links { display: none !important; }
          .desktop-only { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
        @media (min-width: 768px) {
          .mobile-hamburger { display: none !important; }
        }
        .nav-cat-drop:hover .nav-cat-menu {
          opacity: 1 !important;
          visibility: visible !important;
          transform: translateY(0) !important;
        }
        .nav-cat-item:hover {
          background: rgba(255,255,255,0.05);
          color: var(--neon) !important;
        }
      `}</style>
    </>
  );
}

function NavDropItem({ label, to, icon, onClick }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => { navigate(to); onClick(); }}
      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", background: "none", border: "none", color: "var(--white)", cursor: "pointer", fontSize: 13, borderRadius: 8, textAlign: "left", minHeight: 44 }}>
      {icon} {label}
    </button>
  );
}
