import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, ShoppingBag, Package, MessageSquare, Star, RotateCcw, Settings, LogOut, Plus, Trash2, Edit, Check, X, Truck, Save, Tag, Image as ImageIcon, Layout, ChevronUp, ChevronDown, Globe } from "lucide-react";
import AdminSiteSettings from "./AdminSiteSettings";
import { dataManager } from "../dataManager";
import toast from "react-hot-toast";

const compressImage = async (file) => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url); // Free memory
      let w = img.width, h = img.height;
      if (w > 1000) { h *= 1000 / w; w = 1000; }
      const cvs = document.createElement("canvas");
      cvs.width = w; cvs.height = h;
      cvs.getContext("2d").drawImage(img, 0, 0, w, h);
      cvs.toBlob(b => resolve(new File([b], file.name.replace(/\.[^/.]+$/, ".webp"), { type: "image/webp" })), "image/webp", 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fallback to original if compression fails
    };
  });
};

const DEFAULT_SLIDES = [
  { id: 1, image: "/tshirt1.jpg", title: "TRIBE NOMADIC", subtitle: "The Dragon Collection — Wild & Untamed", badge: "NEW DROP", cta: "Shop Now", link: "/shop" },
  { id: 2, image: "/tshirt3.png", title: "PHANTOM EDITION", subtitle: "Made For The Villains — Dare To Be Different", badge: "BESTSELLER", cta: "Explore", link: "/shop?cat=Mens" },
  { id: 3, image: "/tshirt2.jpg", title: "ELEGANT SERIES", subtitle: "Minimalist Drip — Less Is More", badge: "LIMITED", cta: "Shop Now", link: "/shop?cat=Unisex" },
  { id: 4, image: "/tshirt4.png", title: "VOGGUE7 ORIGINALS", subtitle: "Fresh Drops Every Week — Stay Ahead", badge: "HOT", cta: "View All", link: "/shop" },
];

export default function AdminPanel() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    dataManager.checkAndMigrate();
  }, []);

  if (!isAdmin) { navigate("/"); return null; }

  const navItems = [
    { path: "/admin", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
    { path: "/admin/homepage", icon: <Layout size={16} />, label: "Homepage" },
    { path: "/admin/products", icon: <ShoppingBag size={16} />, label: "Products" },
    { path: "/admin/categories", icon: <Tag size={16} />, label: "Categories" },
    { path: "/admin/orders", icon: <Package size={16} />, label: "Orders" },
    { path: "/admin/returns", icon: <RotateCcw size={16} />, label: "Returns" },
    { path: "/admin/support", icon: <MessageSquare size={16} />, label: "Support" },
    { path: "/admin/reviews", icon: <Star size={16} />, label: "Reviews" },
    { path: "/admin/settings", icon: <Settings size={16} />, label: "Settings" },
    { path: "/admin/site", icon: <Globe size={16} />, label: "Site Settings" },
  ];

  const isActive = (path) => path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="sidebar">
        <div style={{ padding: "20px 20px 20px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--neon)", letterSpacing: 2 }}>VOGGUE7</div>
          <div style={{ fontSize: 10, color: "var(--gray3)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Admin Panel</div>
        </div>
        {navItems.map(item => (
          <Link key={item.path} to={item.path} className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}>
            {item.icon} {item.label}
          </Link>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={async () => { await logout(); navigate("/"); }}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14, width: "100%", marginTop: 20 }}>
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minWidth: 0 }}>
        {/* Mobile nav */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, overflowX: "auto", paddingBottom: 6 }} className="mobile-admin-nav">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, whiteSpace: "nowrap", fontSize: 12, fontWeight: 600, flexShrink: 0, background: isActive(item.path) ? "rgba(212,255,0,0.1)" : "var(--gray)", color: isActive(item.path) ? "var(--neon)" : "var(--gray3)", border: `1px solid ${isActive(item.path) ? "rgba(212,255,0,0.3)" : "var(--border)"}` }}>
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/homepage" element={<AdminHomepage />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/categories" element={<AdminCategories />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/returns" element={<AdminReturns />} />
          <Route path="/support" element={<AdminSupport />} />
          <Route path="/reviews" element={<AdminReviews />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="/site" element={<AdminSiteSettings />} />
        </Routes>
      </main>
      <style>{`@media (min-width: 769px) { .mobile-admin-nav { display: none !important; } }`}</style>
    </div>
  );
}

// ---- DASHBOARD ----
function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, pending: 0, pendingPayment: 0, returns: 0 });
  useEffect(() => {
    (async () => {
      const [orders, products] = await Promise.all([dataManager.getOrders(), dataManager.getProducts()]);
      setStats({
        orders: orders.length,
        revenue: orders.filter(o => o.status !== "cancelled" && o.status !== "returned").reduce((s, o) => s + (o.total || 0), 0),
        products: products.length,
        pending: orders.filter(o => o.status === "pending").length,
        pendingPayment: orders.filter(o => o.paymentStatus === "pending_verification").length,
        returns: orders.filter(o => o.status === "return_requested").length,
      });
    })();
  }, []);

  const cards = [
    { label: "Total Orders", value: stats.orders, icon: "📦", color: "#60a5fa" },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: "💰", color: "#4ade80" },
    { label: "Products", value: stats.products, icon: "👕", color: "var(--neon)" },
    { label: "Pending Orders", value: stats.pending, icon: "⏳", color: "#fbbf24" },
    { label: "Verify Payment", value: stats.pendingPayment, icon: "🔍", color: "var(--orange)" },
    { label: "Return Requests", value: stats.returns, icon: "↩️", color: "var(--neon2)" },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>DASHBOARD</h1>
      <p style={{ color: "var(--gray3)", marginBottom: 28 }}>Welcome back, Admin! 🔥</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} className="card" style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 12, color: "var(--gray3)", marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>
      {stats.pendingPayment > 0 && (
        <div style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.25)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "var(--orange)", fontSize: 14 }}>{stats.pendingPayment} UPI payment(s) awaiting verification</div>
            <div style={{ fontSize: 12, color: "var(--gray3)" }}>Verify UTR numbers in Orders section</div>
          </div>
          <Link to="/admin/orders" className="btn btn-primary" style={{ padding: "7px 14px", fontSize: 12 }}>Verify Now</Link>
        </div>
      )}
      {stats.returns > 0 && (
        <div style={{ background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.25)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>↩️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "var(--neon2)", fontSize: 14 }}>{stats.returns} return request(s) pending</div>
          </div>
          <Link to="/admin/returns" className="btn" style={{ padding: "7px 14px", fontSize: 12, background: "var(--neon2)", color: "white" }}>View Returns</Link>
        </div>
      )}
    </div>
  );
}

// ---- HOMEPAGE EDITOR ----
function AdminHomepage() {
  const [tab, setTab] = useState("slides");
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [features, setFeatures] = useState([
    { icon: "⚡", title: "Lightning Drops", desc: "New styles every week" },
    { icon: "🚚", title: "Fast Delivery", desc: "Pan India 3–5 days" },
    { icon: "↩️", title: "7-Day Returns", desc: "No questions asked" },
    { icon: "🔒", title: "Secure Payments", desc: "UPI & COD available" },
  ]);
  const [stats, setStats] = useState([
    { value: "10K+", label: "Happy Customers" },
    { value: "500+", label: "Styles" },
    { value: "4.9★", label: "Rating" },
  ]);
  const [shippingBar, setShippingBar] = useState("Free shipping ₹999+ · 7-day returns · Secure payments · 3–5 day delivery");
  const [catImages, setCatImages] = useState([
    { name: "Mens", image: "", description: "Mens collection thumbnail" },
    { name: "Womens", image: "", description: "Womens collection thumbnail" },
    { name: "Unisex", image: "", description: "Unisex collection thumbnail" },
  ]);
  const [saving, setSaving] = useState(false);
  const [editSlide, setEditSlide] = useState(null);
  const [slideForm, setSlideForm] = useState({ image: "", title: "", subtitle: "", badge: "", cta: "Shop Now", link: "/shop" });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleCatImageUpload = async (e, i) => {
    let file = e.target.files[0];
    if (!file) return;
    setUploadingImage("cat_" + i);
    setUploadProgress(0);
    try {
      if (file.type.startsWith("image/")) file = await compressImage(file);
      setUploadProgress(20);
      setTimeout(() => setUploadProgress(60), 500);
      const url = await dataManager.uploadImage(file);
      setUploadProgress(100);
      setCatImages(prev => prev.map((c, j) => j === i ? { ...c, image: url } : c));
      toast.success("Image uploaded!");
      setUploadingImage(false);
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
      setUploadingImage(false);
    }
  };

  const handleSlideImageUpload = async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    setUploadingImage("slide");
    setUploadProgress(0);
    try {
      if (file.type.startsWith("image/")) file = await compressImage(file);
      setUploadProgress(20);
      setTimeout(() => setUploadProgress(60), 500);
      const url = await dataManager.uploadImage(file);
      setUploadProgress(100);
      setSlideForm(prev => ({ ...prev, image: url }));
      toast.success("Image uploaded!");
      setUploadingImage(false);
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    (async () => {
      const d = await dataManager.getSettings("homepage");
      if (d) {
        if (d.slides?.length) setSlides(d.slides);
        if (d.features?.length) setFeatures(d.features);
        if (d.stats?.length) setStats(d.stats);
        if (d.shippingBar) setShippingBar(d.shippingBar);
        if (d.catImages?.length) setCatImages(d.catImages);
      }
    })();
  }, []);

  async function saveAll() {
    setSaving(true);
    try {
      await dataManager.saveSettings("homepage", { slides, features, stats, shippingBar, catImages, updatedAt: new Date().toISOString() });
      toast.success("Homepage updated! 🎉");
    } catch (e) { toast.error("Failed to save"); }
    setSaving(false);
  }

  function openSlideEdit(slide, idx) {
    setEditSlide(idx);
    setSlideForm({ ...slide });
  }

  function saveSlide() {
    if (editSlide === "new") {
      setSlides(prev => [...prev, { ...slideForm, id: Date.now() }]);
    } else {
      setSlides(prev => prev.map((s, i) => i === editSlide ? { ...slideForm, id: s.id } : s));
    }
    setEditSlide(null);
    setSlideForm({ image: "", title: "", subtitle: "", badge: "", cta: "Shop Now", link: "/shop" });
  }

  const tabs = [["slides", "🖼️ Carousel Slides"], ["categories", "🗂️ Category Images"], ["features", "⚡ Features Bar"], ["stats", "📊 Stats"], ["shipping", "📢 Shipping Bar"]];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1 }}>HOMEPAGE EDITOR</h1>
        <button onClick={saveAll} className="btn btn-primary" disabled={saving}>
          <Save size={14} /> {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`tag ${tab === k ? "active" : ""}`} style={{ fontSize: 13 }}>{l}</button>
        ))}
      </div>

      {/* CATEGORY IMAGES */}
      {tab === "categories" && (
        <div>
          <p style={{ color: "var(--gray3)", fontSize: 14, marginBottom: 20 }}>
            Edit the thumbnail images shown in the "Your Vibe, Your Drip" section. Paste ImgBB or any image URL.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {catImages.map((cat, i) => (
              <div key={i} className="card" style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, alignItems: "center" }}>
                {/* Preview */}
                <div style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "2/3", background: "var(--gray2)", border: "1px solid var(--border)" }}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--gray3)", fontSize: 12, textAlign: "center", padding: 8 }}>
                      No image<br/>set
                    </div>
                  )}
                </div>
                {/* Fields */}
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--neon)", letterSpacing: 2, marginBottom: 12 }}>{cat.name.toUpperCase()}</div>
                  <div className="form-group">
                    <label className="label">Thumbnail Image</label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                      <label className="btn btn-secondary" style={{ cursor: "pointer", fontSize: 13, padding: "8px 12px", position: "relative", overflow: "hidden" }}>
                        {uploadingImage === "cat_" + i ? <div className="spinner" style={{ width:12, height:12, borderWidth:2 }} /> : <ImageIcon size={14} />}
                        {uploadingImage === "cat_" + i ? ` Uploading (${uploadProgress}%)` : " Browse Image"}
                        {uploadingImage === "cat_" + i && (
                          <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, background: "var(--neon)", width: `${uploadProgress}%`, transition: "width 0.2s ease" }} />
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleCatImageUpload(e, i)} style={{ display: "none" }} disabled={!!uploadingImage} />
                      </label>
                      <span style={{ fontSize: 12, color: "var(--gray3)" }}>or paste URL below:</span>
                    </div>
                    <input
                      type="text"
                      value={cat.image}
                      onChange={e => setCatImages(prev => prev.map((c,j) => j===i ? {...c, image: e.target.value} : c))}
                      placeholder="https://... image URL"
                      className="input"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SLIDES */}
      {tab === "slides" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ color: "var(--gray3)", fontSize: 14 }}>Manage hero carousel slides. Changes save when you click "Save All".</p>
            <button onClick={() => { setEditSlide("new"); setSlideForm({ image: "", title: "", subtitle: "", badge: "NEW", cta: "Shop Now", link: "/shop" }); }} className="btn btn-primary" style={{ padding: "8px 14px", fontSize: 13 }}>
              <Plus size={13} /> Add Slide
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {slides.map((slide, i) => (
              <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px" }}>
                <img src={slide.image} alt="" style={{ width: 80, height: 60, borderRadius: 8, objectFit: "cover", background: "var(--gray2)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{slide.title}</div>
                  <div style={{ fontSize: 12, color: "var(--gray3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{slide.subtitle}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <span className="badge badge-neon">{slide.badge}</span>
                    <span className="badge badge-gray">{slide.cta}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => i > 0 && setSlides(prev => { const a = [...prev]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })} style={{ background: "var(--gray2)", border: "none", color: "var(--gray3)", cursor: "pointer", padding: 6, borderRadius: 6 }}><ChevronUp size={14} /></button>
                  <button onClick={() => i < slides.length-1 && setSlides(prev => { const a = [...prev]; [a[i+1], a[i]] = [a[i], a[i+1]]; return a; })} style={{ background: "var(--gray2)", border: "none", color: "var(--gray3)", cursor: "pointer", padding: 6, borderRadius: 6 }}><ChevronDown size={14} /></button>
                  <button onClick={() => openSlideEdit(slide, i)} className="btn btn-ghost" style={{ padding: "6px 10px" }}><Edit size={13} /></button>
                  <button onClick={() => setSlides(prev => prev.filter((_, j) => j !== i))} className="btn btn-danger" style={{ padding: "6px 10px" }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Slide edit modal */}
          {editSlide !== null && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditSlide(null)}>
              <div className="modal-box">
                <div className="flex-between" style={{ marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700 }}>{editSlide === "new" ? "Add New Slide" : "Edit Slide"}</h3>
                  <button onClick={() => setEditSlide(null)} style={{ background: "none", border: "none", color: "var(--gray3)", cursor: "pointer" }}><X size={18} /></button>
                </div>
                <div className="form-group">
                  <label className="label">Slide Image</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                    <label className="btn btn-secondary" style={{ cursor: "pointer", fontSize: 13, padding: "8px 12px", position: "relative", overflow: "hidden" }}>
                      {uploadingImage === "slide" ? <div className="spinner" style={{ width:12, height:12, borderWidth:2 }} /> : <ImageIcon size={14} />}
                      {uploadingImage === "slide" ? ` Uploading (${uploadProgress}%)` : " Browse Image"}
                      {uploadingImage === "slide" && (
                        <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, background: "var(--neon)", width: `${uploadProgress}%`, transition: "width 0.2s ease" }} />
                      )}
                      <input type="file" accept="image/*" onChange={handleSlideImageUpload} style={{ display: "none" }} disabled={!!uploadingImage} />
                    </label>
                    <span style={{ fontSize: 12, color: "var(--gray3)" }}>or paste URL:</span>
                  </div>
                  <input type="text" value={slideForm.image} onChange={e => setSlideForm(prev => ({...prev, image: e.target.value}))} placeholder="Image URL" className="input" />
                </div>
                {[["title","Title (e.g. TRIBE NOMADIC)"],["subtitle","Subtitle / Description"],["badge","Badge (NEW DROP / HOT / LIMITED)"],["cta","Button Text (Shop Now)"],["link","Button Link (/shop or /shop?cat=Mens)"]].map(([k,p]) => (
                  <div key={k} className="form-group">
                    <label className="label">{p}</label>
                    <input type="text" value={slideForm[k]} onChange={e => setSlideForm(prev => ({...prev,[k]:e.target.value}))} placeholder={p} className="input" />
                  </div>
                ))}
                {slideForm.image && (
                  <img src={slideForm.image} alt="preview" style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 10, marginBottom: 12, background: "var(--gray2)" }} />
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveSlide} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}><Save size={14} /> Save Slide</button>
                  <button onClick={() => setEditSlide(null)} className="btn btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEATURES */}
      {tab === "features" && (
        <div>
          <p style={{ color: "var(--gray3)", fontSize: 14, marginBottom: 16 }}>Edit the 4 feature boxes shown below the hero section.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 12, alignItems: "center", padding: "14px 16px" }}>
                <input value={f.icon} onChange={e => setFeatures(prev => prev.map((x,j) => j===i ? {...x,icon:e.target.value} : x))} className="input" style={{ textAlign: "center", fontSize: 20, padding: "8px" }} />
                <input value={f.title} onChange={e => setFeatures(prev => prev.map((x,j) => j===i ? {...x,title:e.target.value} : x))} className="input" placeholder="Title" />
                <input value={f.desc} onChange={e => setFeatures(prev => prev.map((x,j) => j===i ? {...x,desc:e.target.value} : x))} className="input" placeholder="Description" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATS */}
      {tab === "stats" && (
        <div>
          <p style={{ color: "var(--gray3)", fontSize: 14, marginBottom: 16 }}>Edit the stats shown on homepage (e.g. 10K+ Happy Customers).</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.map((s, i) => (
              <div key={i} className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "center", padding: "14px 16px" }}>
                <input value={s.value} onChange={e => setStats(prev => prev.map((x,j) => j===i ? {...x,value:e.target.value} : x))} className="input" placeholder="Value (e.g. 10K+)" />
                <input value={s.label} onChange={e => setStats(prev => prev.map((x,j) => j===i ? {...x,label:e.target.value} : x))} className="input" placeholder="Label (e.g. Happy Customers)" />
                <button onClick={() => setStats(prev => prev.filter((_,j) => j!==i))} className="btn btn-danger" style={{ padding: "8px 10px" }}><Trash2 size={13} /></button>
              </div>
            ))}
            <button onClick={() => setStats(prev => [...prev, { value: "0", label: "New Stat" }])} className="btn btn-secondary" style={{ alignSelf: "flex-start" }}>
              <Plus size={13} /> Add Stat
            </button>
          </div>
        </div>
      )}

      {/* SHIPPING BAR */}
      {tab === "shipping" && (
        <div>
          <p style={{ color: "var(--gray3)", fontSize: 14, marginBottom: 16 }}>Edit the scrolling announcement bar text at the top of the page.</p>
          <div className="card">
            <label className="label">Shipping Bar Text</label>
            <textarea value={shippingBar} onChange={e => setShippingBar(e.target.value)} className="input" rows={3} placeholder="Free shipping ₹999+ · 7-day returns · Secure payments" />
            <div style={{ fontSize: 12, color: "var(--gray3)", marginTop: 8 }}>💡 Use · to separate items. This text will scroll across the top.</div>
          </div>
          <div style={{ background: "var(--neon)", color: "var(--black)", borderRadius: 8, padding: "10px 16px", marginTop: 12, fontSize: 12, fontWeight: 700, overflow: "hidden" }}>
            Preview: ✦ {shippingBar} ✦
          </div>
        </div>
      )}
    </div>
  );
}

// ---- PRODUCTS ----
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", mrp: "", category: "Mens", subcategory: "", description: "", images: "", sizes: "XS,S,M,L,XL,XXL", badge: "", stock: "100" });
  const [cats, setCats] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => { fetchProducts(); fetchCats(); }, []);

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);
    setUploadProgress(0);
    try {
      let uploadedUrls = [];
      const progressPerFile = 100 / files.length;
      
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.type.startsWith("image/")) file = await compressImage(file);
        
        // Pseudo progress per file
        setUploadProgress(Math.round((i * progressPerFile) + (progressPerFile / 2)));
        
        const url = await dataManager.uploadImage(file);
        uploadedUrls.push(url);
      }
      
      setUploadProgress(100);
      
      setForm(prev => {
        const existing = prev.images ? prev.images.trim() : "";
        const urlsStr = uploadedUrls.join(", ");
        return {
          ...prev,
          images: existing ? existing + ", " + urlsStr : urlsStr
        };
      });
      toast.success(files.length > 1 ? `${files.length} images uploaded!` : "Image uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  }

  async function fetchProducts() {
    const prods = await dataManager.getProducts();
    setProducts(prods);
  }

  async function fetchCats() {
    try {
      const data = await dataManager.getCategories();
      setCats(data);
    } catch (e) {}
  }

  const set = k => e => setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function saveProduct(e) {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error("Fill required fields!");
    const data = { name: form.name, price: Number(form.price), mrp: form.mrp ? Number(form.mrp) : null, category: form.category, subcategory: form.subcategory || null, description: form.description, images: form.images.split(",").map(s => s.trim()).filter(Boolean), sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean), badge: form.badge || null, stock: Number(form.stock) || 100 };
    try {
      if (editing) { await dataManager.updateProduct(editing.id, data); toast.success("Updated!"); }
      else { await dataManager.addProduct(data); toast.success("Product added! 🔥"); }
      setModal(false); setEditing(null);
      setForm({ name: "", price: "", mrp: "", category: "Mens", subcategory: "", description: "", images: "", sizes: "XS,S,M,L,XL,XXL", badge: "", stock: "100" });
      fetchProducts();
    } catch (e) { toast.error("Failed"); }
  }

  function openEdit(p) {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), mrp: String(p.mrp || ""), category: p.category, subcategory: p.subcategory || "", description: p.description || "", images: (p.images || []).join(", "), sizes: (p.sizes || []).join(","), badge: p.badge || "", stock: String(p.stock || 100) });
    setModal(true);
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) return;
    await dataManager.deleteProduct(id);
    toast.success("Deleted!"); fetchProducts();
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1 }}>PRODUCTS ({products.length})</h1>
        <button onClick={() => { setEditing(null); setModal(true); }} className="btn btn-primary"><Plus size={14} /> Add Product</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Badge</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={p.images?.[0] || ""} alt="" style={{ width: 40, height: 48, borderRadius: 6, objectFit: "cover", background: "var(--gray2)" }} onError={e => e.target.style.display = "none"} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      {p.mrp && <div style={{ fontSize: 11, color: "var(--gray3)", textDecoration: "line-through" }}>₹{p.mrp}</div>}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-gray">{p.category}</span>
                  {p.subcategory && <span className="badge badge-gray" style={{ marginLeft: 4, background: "rgba(255,255,255,0.05)" }}>{p.subcategory}</span>}
                </td>
                <td style={{ fontWeight: 700, color: "var(--neon)" }}>₹{p.price}</td>
                <td>{p.stock || 100}</td>
                <td>{p.badge ? <span className="badge badge-neon">{p.badge}</span> : "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(p)} className="btn btn-ghost" style={{ padding: "6px 10px" }}><Edit size={13} /></button>
                    <button onClick={() => deleteProduct(p.id)} className="btn btn-danger" style={{ padding: "6px 10px" }}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>{editing ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", color: "var(--gray3)", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <form onSubmit={saveProduct}>
              {[["name","Product Name *","text"],["price","Price (₹) *","number"],["mrp","MRP (Original Price ₹)","number"],["stock","Stock Qty","number"]].map(([k,p,t]) => (
                <div key={k} className="form-group">
                  <label className="label">{p}</label>
                  <input type={t} value={form[k]} onChange={set(k)} placeholder={p} className="input" />
                </div>
              ))}
              <div className="form-group">
                <label className="label">Badge (optional)</label>
                <select value={form.badge} onChange={set("badge")} className="input">
                  <option value="">No Badge</option>
                  <option value="NEW">🟢 NEW</option>
                  <option value="HOT">🔴 HOT</option>
                  <option value="SALE">🟡 SALE</option>
                  <option value="LIMITED">🟣 LIMITED</option>
                  <option value="BESTSELLER">⭐ BESTSELLER</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Category</label>
                <select value={form.category} onChange={e => setForm(prev => ({...prev, category: e.target.value, subcategory: ""}))} className="input">
                  {cats.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              
              {(() => {
                const selectedCat = cats.find(c => c.name === form.category);
                if (!selectedCat || !selectedCat.subcategories || selectedCat.subcategories.length === 0) return null;
                return (
                  <div className="form-group">
                    <label className="label">Subcategory</label>
                    <select value={form.subcategory} onChange={set("subcategory")} className="input">
                      <option value="">None</option>
                      {selectedCat.subcategories.map(sub => (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                );
              })()}
              <div className="form-group">
                <label className="label">Description</label>
                <textarea value={form.description} onChange={set("description")} className="input" rows={3} placeholder="Describe the product..." />
              </div>
              <div className="form-group">
                <label className="label">Product Images</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <label className="btn btn-secondary" style={{ cursor: "pointer", fontSize: 13, padding: "8px 12px", position: "relative", overflow: "hidden" }}>
                    {uploadingImage ? <div className="spinner" style={{ width:12, height:12, borderWidth:2 }} /> : <ImageIcon size={14} />}
                    {uploadingImage ? ` Uploading (${uploadProgress}%)` : " Browse Image"}
                    {uploadingImage && (
                      <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, background: "var(--neon)", width: `${uploadProgress}%`, transition: "width 0.2s ease" }} />
                    )}
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} disabled={uploadingImage} />
                  </label>
                  <span style={{ fontSize: 12, color: "var(--gray3)" }}>or paste URLs below:</span>
                </div>
                <input type="text" value={form.images} onChange={set("images")} placeholder="https://img1.jpg, https://img2.jpg" className="input" />
                {form.images && (
                   <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: 8 }}>
                     {form.images.split(",").map(url => url.trim()).filter(Boolean).map((u, i) => (
                        <div key={i} style={{ position: "relative", width: 60, height: 60, borderRadius: 6, overflow: "hidden", background: "var(--gray2)", border: "1px solid var(--border)" }}>
                          <img src={u} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} />
                          <button type="button" onClick={() => {
                            const arr = form.images.split(",").map(x=>x.trim()).filter(Boolean);
                            arr.splice(i, 1);
                            setForm(prev => ({...prev, images: arr.join(", ")}));
                          }} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", border: "none", color: "white", borderRadius: "50%", padding: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }}><X size={10} /></button>
                        </div>
                     ))}
                   </div>
                )}
              </div>
              <div className="form-group">
                <label className="label">Available Sizes</label>
                <input type="text" value={form.sizes} onChange={set("sizes")} placeholder="XS,S,M,L,XL,XXL" className="input" />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}><Save size={14} /> Save Product</button>
                <button type="button" onClick={() => setModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- CATEGORIES ----
function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", image: "", subcategories: [] });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Subcategory draft form
  const [subForm, setSubForm] = useState({ name: "", image: "" });
  const [uploadingSub, setUploadingSub] = useState(false);

  useEffect(() => { fetchCats(); }, []);

  async function fetchCats() {
    const data = await dataManager.getCategories();
    setCats(data);
  }

  async function handleImageUpload(e, isSub = false) {
    let file = e.target.files[0];
    if (!file) return;
    const setUploading = isSub ? setUploadingSub : setUploadingImage;
    setUploading(true);
    if (!isSub) setUploadProgress(0);
    try {
      if (file.type.startsWith("image/")) file = await compressImage(file);
      if (!isSub) { setUploadProgress(20); setTimeout(() => setUploadProgress(60), 500); }
      const url = await dataManager.uploadImage(file);
      if (!isSub) setUploadProgress(100);
      
      if (isSub) {
        setSubForm(prev => ({ ...prev, image: url }));
      } else {
        setForm(prev => ({ ...prev, image: url }));
      }
      toast.success("Image uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (!isSub) setUploadProgress(0);
    }
  }

  async function saveCategory(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Category name required");
    
    try {
      if (editing) {
        await dataManager.updateCategory(editing.id, form);
        toast.success("Category updated!");
      } else {
        await dataManager.addCategory(form);
        toast.success("Category added!");
      }
      setModal(false);
      fetchCats();
    } catch (e) {
      toast.error("Failed to save category");
    }
  }

  async function deleteCat(id) { 
    if (!window.confirm("Delete this category?")) return;
    await dataManager.deleteCategory(id); 
    fetchCats(); 
    toast.success("Removed!"); 
  }

  function openEdit(c) {
    setEditing(c);
    setForm({ name: c.name, image: c.image || "", subcategories: c.subcategories || [] });
    setSubForm({ name: "", image: "" });
    setModal(true);
  }

  function openNew() {
    setEditing(null);
    setForm({ name: "", image: "", subcategories: [] });
    setSubForm({ name: "", image: "" });
    setModal(true);
  }

  function addSubcategory() {
    if (!subForm.name.trim()) return toast.error("Subcategory name required");
    const subId = Date.now().toString();
    setForm(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, { id: subId, name: subForm.name.trim(), image: subForm.image }]
    }));
    setSubForm({ name: "", image: "" });
  }

  function removeSubcategory(id) {
    setForm(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter(s => s.id !== id)
    }));
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1 }}>CATEGORIES</h1>
        <button onClick={openNew} className="btn btn-primary"><Plus size={14} /> Add Category</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cats.map(c => (
          <div key={c.id} className="card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 8, overflow: "hidden", background: "var(--gray2)", flexShrink: 0 }}>
              {c.image ? <img src={c.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div className="flex-center" style={{height:"100%"}}><ImageIcon size={20} color="var(--gray3)"/></div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{c.name}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(c.subcategories || []).map(sub => (
                  <span key={sub.id} className="badge badge-gray">{sub.name}</span>
                ))}
                {(!c.subcategories || c.subcategories.length === 0) && <span style={{ fontSize: 12, color: "var(--gray3)" }}>No subcategories</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => openEdit(c)} className="btn btn-ghost" style={{ padding: "6px 10px" }}><Edit size={13} /></button>
              <button onClick={() => deleteCat(c.id)} className="btn btn-danger" style={{ padding: "6px 10px" }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        {cats.length === 0 && <div style={{ color: "var(--gray3)" }}>No categories yet.</div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box" style={{ maxWidth: 600 }}>
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>{editing ? "Edit Category" : "Add Category"}</h3>
              <button type="button" onClick={() => setModal(false)} style={{ background: "none", border: "none", color: "var(--gray3)", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <form onSubmit={saveCategory}>
              <div className="form-group">
                <label className="label">Category Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(prev => ({...prev, name: e.target.value}))} placeholder="e.g. Mens" className="input" />
              </div>

              <div className="form-group">
                <label className="label">Category Image</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <label className="btn btn-secondary" style={{ cursor: "pointer", fontSize: 13, padding: "8px 12px", position: "relative", overflow: "hidden" }}>
                    {uploadingImage ? <div className="spinner" style={{ width:12, height:12, borderWidth:2 }} /> : <ImageIcon size={14} />}
                    {uploadingImage ? ` Uploading (${uploadProgress}%)` : " Browse Image"}
                    {uploadingImage && <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, background: "var(--neon)", width: `${uploadProgress}%`, transition: "width 0.2s ease" }} />}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} style={{ display: "none" }} disabled={uploadingImage} />
                  </label>
                  <span style={{ fontSize: 12, color: "var(--gray3)" }}>or paste URL:</span>
                </div>
                <input type="text" value={form.image} onChange={e => setForm(prev => ({...prev, image: e.target.value}))} placeholder="https://..." className="input" />
                {form.image && <img src={form.image} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, marginTop: 10, background: "var(--gray2)" }} />}
              </div>

              <hr style={{ borderColor: "var(--border)", margin: "24px 0" }} />
              
              <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Subcategories</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {form.subcategories.map(sub => (
                  <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--gray)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
                    {sub.image && <img src={sub.image} alt="" style={{ width: 30, height: 30, borderRadius: 4, objectFit: "cover", background: "var(--gray2)" }} />}
                    <div style={{ flex: 1, fontWeight: 600 }}>{sub.name}</div>
                    <button type="button" onClick={() => removeSubcategory(sub.id)} className="btn btn-ghost" style={{ padding: 4, color: "#f87171" }}><X size={14} /></button>
                  </div>
                ))}
                {form.subcategories.length === 0 && <span style={{ fontSize: 13, color: "var(--gray3)" }}>No subcategories added yet.</span>}
              </div>

              {/* Add Subcategory Form */}
              <div style={{ background: "rgba(212,255,0,0.03)", border: "1px dashed rgba(212,255,0,0.2)", padding: 16, borderRadius: 10, marginBottom: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Add Subcategory</div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <input type="text" value={subForm.name} onChange={e => setSubForm(prev => ({...prev, name: e.target.value}))} placeholder="Name (e.g. Printed)" className="input" />
                  </div>
                  <div>
                    <label className="btn btn-secondary" style={{ cursor: "pointer", height: 42, display: "flex", alignItems: "center" }}>
                      {uploadingSub ? <div className="spinner" style={{ width:12, height:12, borderWidth:2 }} /> : <ImageIcon size={14} />}
                      {uploadingSub ? "..." : "Image"}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} style={{ display: "none" }} disabled={uploadingSub} />
                    </label>
                  </div>
                  <button type="button" onClick={addSubcategory} className="btn btn-secondary" style={{ height: 42 }}>Add</button>
                </div>
                {subForm.image && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={subForm.image} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", background: "var(--gray2)" }} />
                    <button type="button" onClick={() => setSubForm(prev => ({...prev, image: ""}))} style={{ background: "none", border: "none", color: "var(--gray3)", cursor: "pointer", fontSize: 12 }}>Remove Image</button>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}><Save size={14} /> Save Category</button>
                <button type="button" onClick={() => setModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- ORDERS ----
function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    (async () => {
      const orders = await dataManager.getOrders();
      setOrders(orders);
      setLoading(false);
    })();
  }, []);

  const filtered = filter === "all" ? orders
    : filter === "payment" ? orders.filter(o => o.paymentStatus === "pending_verification")
    : orders.filter(o => o.status === filter);

  async function updateStatus(orderId, status) {
    const updates = { status, updatedAt: new Date().toISOString() };
    if (status === "delivered") { updates.deliveredAt = new Date().toISOString(); }
    await dataManager.updateOrder(orderId, updates);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    toast.success(`Status → ${status}`);
  }

  async function verifyPayment(orderId) {
    await dataManager.updateOrder(orderId, { paymentStatus: "verified", status: "confirmed", updatedAt: new Date().toISOString() });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: "verified", status: "confirmed" } : o));
    toast.success("✅ Payment verified! Order confirmed.");
  }

  async function addTracking(orderId) {
    const trackingId = prompt("Enter Tracking ID / AWB Number:");
    if (!trackingId) return;
    await dataManager.updateOrder(orderId, { trackingId, status: "shipped", updatedAt: new Date().toISOString() });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trackingId, status: "shipped" } : o));
    toast.success("Tracking added & marked shipped!");
  }

  async function setDeliveryDate(orderId) {
    const days = prompt("Estimated delivery days (e.g. 5 for 5 days from today):");
    if (!days || isNaN(days)) return;
    const date = new Date();
    date.setDate(date.getDate() + Number(days));
    const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    await dataManager.updateOrder(orderId, { estimatedDelivery: dateStr, updatedAt: new Date().toISOString() });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estimatedDelivery: dateStr } : o));
    toast.success(`Delivery date set: ${dateStr}`);
  }

  if (loading) return <div className="flex-center" style={{ height: 200 }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1 }}>ORDERS ({filtered.length})</h1>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[["all","All"],["payment","⚠️ Verify Payment"],["pending","Pending"],["confirmed","Confirmed"],["shipped","Shipped"],["delivered","Delivered"],["cancelled","Cancelled"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`tag ${filter === v ? "active" : ""}`} style={{ fontSize: 12 }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(order => (
          <div key={order.id} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gray3)" }}>#{order.id.slice(0,8).toUpperCase()}</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{order.userName}</div>
                <div style={{ fontSize: 12, color: "var(--gray3)" }}>{order.userEmail} · 📱 {order.userPhone}</div>
                <div style={{ fontSize: 11, color: "var(--gray3)", marginTop: 2 }}>{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString("en-IN") : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <span className={`badge badge-${order.status === "delivered" ? "green" : order.status === "cancelled" ? "pink" : order.status === "shipped" ? "purple" : "orange"}`}>{order.status}</span>
                <span className="badge badge-gray">{order.paymentMethod?.toUpperCase()}</span>
                {order.paymentMethod === "online" && <span className={`badge badge-${order.paymentStatus === "verified" ? "green" : "orange"}`}>{order.paymentStatus === "verified" ? "✅ Verified" : "⏳ Verify"}</span>}
              </div>
            </div>

            {/* Address */}
            <div style={{ fontSize: 12, color: "var(--gray3)", marginBottom: 10 }}>
              📍 {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
            </div>

            {/* UPI verification box */}
            {order.paymentMethod === "online" && order.paymentStatus !== "verified" && (
              <div style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
                <div style={{ color: "var(--orange)", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>🔍 Payment Verification Required</div>
                <div style={{ fontSize: 13 }}>UPI ID: <strong>{order.upiId}</strong></div>
                <div style={{ fontSize: 13 }}>UTR: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--neon)" }}>{order.utrNumber}</strong></div>
                <div style={{ fontSize: 12, color: "var(--gray3)", marginTop: 4 }}>Amount: ₹{order.total}</div>
              </div>
            )}

            {/* Cancellation info */}
            {order.status === "cancelled" && order.cancelReason && (
              <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
                <div style={{ color: "#f87171", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>❌ Order Cancelled by User</div>
                <div style={{ fontSize: 13 }}>Reason: <strong style={{ color: "var(--white)" }}>{order.cancelReason}</strong></div>
              </div>
            )}

            {/* Items preview */}
            {expanded === order.id && (
              <div style={{ background: "var(--gray2)", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                {order.items?.map(item => (
                  <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <img src={item.image || ""} alt="" style={{ width: 36, height: 44, borderRadius: 6, objectFit: "cover", background: "var(--gray)", flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13 }}>{item.name} · Size: {item.size} · Qty: {item.qty}</div>
                    <div style={{ fontWeight: 700, color: "var(--neon)", fontSize: 13 }}>₹{item.price * item.qty}</div>
                  </div>
                ))}
                {order.estimatedDelivery && <div style={{ fontSize: 12, color: "var(--neon)", marginTop: 6 }}>🚚 Est. delivery: {order.estimatedDelivery}</div>}
                {order.trackingId && <div style={{ fontSize: 12, marginTop: 4 }}>📦 Tracking: <span style={{ fontFamily: "var(--font-mono)", color: "var(--neon)" }}>{order.trackingId}</span></div>}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
              <span style={{ fontWeight: 700, color: "var(--neon)", fontSize: 15 }}>₹{order.total}</span>
              <div style={{ flex: 1 }} />
              <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }}>
                {expanded === order.id ? "Hide" : "Details"}
              </button>
              {order.paymentMethod === "online" && order.paymentStatus !== "verified" && (
                <button onClick={() => verifyPayment(order.id)} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 12 }}>
                  <Check size={12} /> Verify Payment
                </button>
              )}
              {(order.status === "confirmed" || order.status === "pending") && !order.trackingId && (
                <button onClick={() => addTracking(order.id)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
                  <Truck size={12} /> Add Tracking
                </button>
              )}
              <button onClick={() => setDeliveryDate(order.id)} className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }}>📅 Set Delivery Date</button>
              <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                style={{ background: "var(--gray2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--white)", padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
                {["pending","confirmed","shipped","delivered","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "var(--gray3)" }}>No orders found</div>}
      </div>
    </div>
  );
}

// ---- RETURNS ----
function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [pickupDate, setPickupDate] = useState({});
  const [pickupInfo, setPickupInfo] = useState({});
  const [adminNote, setAdminNote] = useState({});

  useEffect(() => {
    (async () => {
      const orders = await dataManager.getOrders();
      const data = orders.filter(o => ["return_requested", "returned"].includes(o.status));
      data.sort((a,b) => (b.returnRequestedAt?.seconds||0)-(a.returnRequestedAt?.seconds||0));
      setReturns(data);
    })();
  }, []);

  function daysLeftForReturn(order) {
    const deliveredAt = order.deliveredAt?.seconds ? new Date(order.deliveredAt.seconds*1000) : null;
    if (!deliveredAt) return "N/A";
    const daysSince = (new Date()-deliveredAt)/(1000*60*60*24);
    const left = Math.max(0, Math.ceil(7-daysSince));
    return left;
  }

  function isExpired(order) {
    const deliveredAt = order.deliveredAt?.seconds ? new Date(order.deliveredAt.seconds*1000) : null;
    if (!deliveredAt) return false;
    return (new Date()-deliveredAt)/(1000*60*60*24) > 7;
  }

  async function processReturn(order, action) {
    const pd = pickupDate[order.id] || order.returnPickupDate || "";
    const pi = pickupInfo[order.id] || order.returnPickupInfo || "";
    const an = adminNote[order.id] || "";
    if (action === "approve" && !pd) { toast.error("Set pickup date before approving!"); return; }
    const status = action === "approve" ? "returned" : "delivered";
    const updates = { status, updatedAt: new Date().toISOString(), adminReturnNote: an };
    if (action === "approve") { updates.returnPickupDate = pd; updates.returnPickupInfo = pi; }
    await dataManager.updateOrder(order.id, updates);
    setReturns(prev => prev.map(o => o.id === order.id ? { ...o, ...updates } : o));
    toast.success(action==="approve" ? "Return approved! User notified. ✅" : "Return rejected.");
  }

  return (
    <div>
      <h1 style={{fontFamily:"var(--font-display)",fontSize:32,letterSpacing:1,marginBottom:20}}>RETURNS ({returns.length})</h1>
      {returns.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px",color:"var(--gray3)"}}>
          <div style={{fontSize:48,marginBottom:12}}>🎉</div><div>No return requests!</div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {returns.map(order => {
            const dLeft = daysLeftForReturn(order);
            const expired = isExpired(order);
            const reqDate = order.returnRequestedAt?.seconds ? new Date(order.returnRequestedAt.seconds*1000) : null;
            const delivDate = order.deliveredAt?.seconds ? new Date(order.deliveredAt.seconds*1000) : null;
            return (
              <div key={order.id} className="card" style={{borderLeft:`3px solid ${order.status==="returned"?"#9ca3af":"#fb923c"}`}}>
                <div className="flex-between" style={{marginBottom:12}}>
                  <div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--gray3)"}}>#{order.id.slice(0,8).toUpperCase()}</div>
                    <div style={{fontWeight:700,fontSize:16}}>{order.userName}</div>
                    <div style={{fontSize:13,color:"var(--gray3)"}}>{order.userEmail} · 📱 {order.userPhone}</div>
                  </div>
                  <span className={`badge badge-${order.status==="returned"?"gray":"orange"}`}>{order.status==="returned"?"✔️ Returned":"↩️ Pending Review"}</span>
                </div>

                {/* KEY INFO BOX */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:14}}>
                  <div style={{background:"var(--gray2)",borderRadius:8,padding:"8px 12px"}}>
                    <div style={{fontSize:10,color:"var(--gray3)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>Ordered On</div>
                    <div style={{fontSize:13,fontWeight:600}}>{order.createdAt?.seconds ? new Date(order.createdAt.seconds*1000).toLocaleDateString("en-IN") : "—"}</div>
                  </div>
                  <div style={{background:"var(--gray2)",borderRadius:8,padding:"8px 12px"}}>
                    <div style={{fontSize:10,color:"var(--gray3)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>Delivered On</div>
                    <div style={{fontSize:13,fontWeight:600}}>{delivDate ? delivDate.toLocaleDateString("en-IN") : "Not marked"}</div>
                  </div>
                  <div style={{background:"var(--gray2)",borderRadius:8,padding:"8px 12px"}}>
                    <div style={{fontSize:10,color:"var(--gray3)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>Return Requested</div>
                    <div style={{fontSize:13,fontWeight:600}}>{reqDate ? reqDate.toLocaleDateString("en-IN") : "—"}</div>
                  </div>
                  <div style={{background:expired?"rgba(248,113,113,0.1)":"rgba(74,222,128,0.08)",border:`1px solid ${expired?"rgba(248,113,113,0.3)":"rgba(74,222,128,0.2)"}`,borderRadius:8,padding:"8px 12px"}}>
                    <div style={{fontSize:10,color:"var(--gray3)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>Return Window</div>
                    <div style={{fontSize:13,fontWeight:700,color:expired?"#f87171":"#4ade80"}}>
                      {expired ? "⚠️ EXPIRED" : `${dLeft} days left`}
                    </div>
                  </div>
                </div>

                <div style={{fontSize:13,color:"var(--gray3)",marginBottom:8}}>
                  <strong style={{color:"var(--white)"}}>Items:</strong> {order.items?.map(i=>`${i.name} (${i.size})`).join(", ")} · <strong style={{color:"var(--neon)"}}>₹{order.total}</strong>
                </div>
                <div style={{fontSize:13,color:"var(--gray3)",marginBottom:8}}>
                  📍 {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                </div>
                {order.returnReason && (
                  <div style={{background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.2)",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:13}}>
                    <strong style={{color:"#fb923c"}}>Return Reason:</strong> <span style={{color:"var(--white)"}}>{order.returnReason}</span>
                  </div>
                )}

                {order.status==="return_requested" && (
                  <div style={{background:"var(--gray2)",borderRadius:12,padding:16,marginTop:8}}>
                    <div style={{fontWeight:700,marginBottom:12,fontSize:14}}>📋 Process Return</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                      <div>
                        <label className="label">Pickup Date *</label>
                        <input type="date" value={pickupDate[order.id]||""} onChange={e=>setPickupDate(p=>({...p,[order.id]:e.target.value}))} className="input"/>
                      </div>
                      <div>
                        <label className="label">Pickup Agent / Info</label>
                        <input type="text" value={pickupInfo[order.id]||""} onChange={e=>setPickupInfo(p=>({...p,[order.id]:e.target.value}))} placeholder="e.g. Delhivery pickup, call 24hr prior" className="input"/>
                      </div>
                    </div>
                    <div style={{marginBottom:12}}>
                      <label className="label">Note to Customer</label>
                      <input type="text" value={adminNote[order.id]||""} onChange={e=>setAdminNote(p=>({...p,[order.id]:e.target.value}))} placeholder="e.g. Keep product packed and ready" className="input"/>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>processReturn(order,"approve")} className="btn btn-primary" style={{padding:"8px 16px",fontSize:13}}>
                        <Check size={12}/> Approve & Set Pickup
                      </button>
                      <button onClick={()=>processReturn(order,"reject")} className="btn btn-danger" style={{padding:"8px 16px",fontSize:13}}>
                        <X size={12}/> Reject Return
                      </button>
                    </div>
                  </div>
                )}
                {order.status==="returned" && order.returnPickupDate && (
                  <div style={{background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:8,padding:"8px 12px",fontSize:13}}>
                    ✅ Pickup set: <strong style={{color:"var(--neon)"}}>{order.returnPickupDate}</strong>
                    {order.returnPickupInfo && <span style={{color:"var(--gray3)"}}> · {order.returnPickupInfo}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- SUPPORT ----
function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [reply, setReply] = useState({});
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      const tickets = await dataManager.getSupportTickets();
      setTickets(tickets);
    })();
  }, []);

  async function saveReply(ticket) {
    const text = reply[ticket.id];
    if (!text?.trim()) { toast.error("Type a reply first!"); return; }
    const updates = { adminReply: text, status: "resolved", repliedAt: { seconds: Math.floor(Date.now()/1000) } };
    await dataManager.updateSupportTicket(ticket.id, updates);
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, ...updates } : t));
    setReply(prev => ({ ...prev, [ticket.id]: "" }));
    toast.success("Reply saved! Now send it to user via Email or WhatsApp 👇");
  }

  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1 }}>SUPPORT ({tickets.length})</h1>
      </div>
      <div style={{ background: "rgba(212,255,0,0.06)", border: "1px solid rgba(212,255,0,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
        <strong style={{ color: "var(--neon)" }}>💡 How to reply:</strong>
        <span style={{ color: "var(--gray3)", marginLeft: 6 }}>Type reply → Save → Click 📧 Email or 💬 WhatsApp button to send to user. Reply also shows on user contact page.</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["all","All"],["open","⏳ Open"],["resolved","✅ Resolved"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`tag ${filter === v ? "active" : ""}`} style={{ fontSize: 12 }}>{l}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--gray3)" }}>No tickets found 🎉</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(t => (
            <div key={t.id} className="card" style={{ borderLeft: `3px solid ${t.status === "resolved" ? "#4ade80" : "var(--neon)"}` }}>
              <div className="flex-between" style={{ marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name || t.userName}</div>
                  <div style={{ fontSize: 11, color: "var(--gray3)" }}>{t.createdAt?.seconds ? new Date(t.createdAt.seconds * 1000).toLocaleString("en-IN") : ""}</div>
                </div>
                <span className={`badge badge-${t.status === "resolved" ? "green" : "orange"}`}>{t.status === "resolved" ? "✅ Resolved" : "⏳ Open"}</span>
              </div>
              <div style={{ background: "rgba(212,255,0,0.05)", border: "1px solid rgba(212,255,0,0.1)", borderRadius: 8, padding: "8px 12px", marginBottom: 10, display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div><div style={{ fontSize: 10, color: "var(--gray3)", textTransform: "uppercase", letterSpacing: 0.5 }}>Email</div><div style={{ fontSize: 13, color: "var(--neon)", fontWeight: 600 }}>{t.email || t.userEmail || "—"}</div></div>
                {(t.phone || t.userPhone) && <div><div style={{ fontSize: 10, color: "var(--gray3)", textTransform: "uppercase", letterSpacing: 0.5 }}>WhatsApp</div><div style={{ fontSize: 13, color: "var(--neon)", fontWeight: 600 }}>{t.phone || t.userPhone}</div></div>}
              </div>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 15 }}>{t.subject}</div>
              <div style={{ background: "var(--gray2)", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontSize: 13, color: "var(--gray3)", lineHeight: 1.6 }}>{t.message}</div>
              {t.adminReply ? (
                <div>
                  <div style={{ background: "rgba(212,255,0,0.06)", border: "1px solid rgba(212,255,0,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 13 }}>
                    <div style={{ color: "var(--neon)", fontWeight: 700, marginBottom: 4, fontSize: 11 }}>✅ YOUR SAVED REPLY:</div>
                    <div style={{ lineHeight: 1.6 }}>{t.adminReply}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a href={`mailto:${t.email || t.userEmail}?subject=Re: ${encodeURIComponent(t.subject)}&body=${encodeURIComponent("Hi " + (t.name||t.userName) + ",\n\n" + t.adminReply + "\n\nBest regards,\nVoggue7 Support\nvoggue7.netlify.app")}`}
                      className="btn btn-primary" style={{ padding: "8px 14px", fontSize: 12, textDecoration: "none" }}>📧 Send via Email</a>
                    {(t.phone || t.userPhone) && (
                      <a href={`https://wa.me/${(t.phone||t.userPhone).replace(/[^0-9]/g,"")}?text=${encodeURIComponent("Hi " + (t.name||t.userName) + "! 👋\n\nVoggue7 Support reply for: *" + t.subject + "*\n\n" + t.adminReply + "\n\n- Team Voggue7 🔥")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn" style={{ padding: "8px 14px", fontSize: 12, background: "#25D366", color: "white", textDecoration: "none" }}>💬 WhatsApp User</a>
                    )}
                    <button onClick={() => setTickets(prev => prev.map(x => x.id === t.id ? { ...x, adminReply: null, status: "open" } : x))}
                      style={{ background: "none", border: "1px solid var(--border)", color: "var(--gray3)", cursor: "pointer", padding: "8px 12px", borderRadius: 8, fontSize: 12 }}>✏️ Edit</button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="label" style={{ marginBottom: 6 }}>Type Reply</label>
                  <textarea value={reply[t.id] || ""} onChange={e => setReply(prev => ({ ...prev, [t.id]: e.target.value }))}
                    placeholder={`Type your reply to ${t.name || "user"}...`} className="input" rows={3} style={{ resize: "vertical", marginBottom: 10 }} />
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => saveReply(t)} className="btn btn-primary" style={{ padding: "9px 18px", fontSize: 13 }}>
                      <Save size={13} /> Save Reply
                    </button>
                    <span style={{ fontSize: 12, color: "var(--gray3)" }}>Then use Email/WhatsApp buttons to send</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- REVIEWS ----
function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    (async () => {
      const revs = await dataManager.getReviews();
      setReviews(revs);
    })();
  }, []);

  async function deleteReview(id) {
    await dataManager.deleteReview(id);
    setReviews(prev => prev.filter(r => r.id !== id));
    toast.success("Review deleted");
  }

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1, marginBottom: 20 }}>REVIEWS ({reviews.length})</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reviews.map(r => (
          <div key={r.id} className="card">
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{r.userName}</div>
                <div className="stars">{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= r.rating ? "#ffd700" : "#333" }}>★</span>)}</div>
              </div>
              <button onClick={() => deleteReview(r.id)} className="btn btn-danger" style={{ padding: "6px 10px" }}><Trash2 size={13} /></button>
            </div>
            <p style={{ color: "var(--gray3)", fontSize: 14 }}>{r.text}</p>
          </div>
        ))}
        {reviews.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "var(--gray3)" }}>No reviews yet</div>}
      </div>
    </div>
  );
}

// ---- SETTINGS ----
function AdminSettings() {
  const { currentUser, changePassword } = useAuth();
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState("7265065054@ybl");
  const [savingUpi, setSavingUpi] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await dataManager.getSettings("payment");
        if (d && d.upiId) setUpiId(d.upiId);
      } catch(e) {}
    })();
  }, []);

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!oldPass || !newPass || !confirmPass) return toast.error("Fill all fields!");
    if (newPass !== confirmPass) return toast.error("Passwords don't match!");
    if (newPass.length < 6) return toast.error("Min 6 characters!");
    setLoading(true);
    try {
      await changePassword(newPass);
      toast.success("Password changed! 🔐");
      setOldPass(""); setNewPass(""); setConfirmPass("");
    } catch (e) {
      toast.error("Failed to change password");
    }
    setLoading(false);
  }

  async function saveUpi() {
    if (!upiId.trim()) return toast.error("Enter a valid UPI ID!");
    setSavingUpi(true);
    try {
      await dataManager.saveSettings("payment", { upiId: upiId.trim(), updatedAt: new Date().toISOString() });
      toast.success("UPI ID updated! ✅");
    } catch(e) { toast.error("Failed to save UPI ID"); }
    setSavingUpi(false);
  }

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1, marginBottom: 20 }}>SETTINGS</h1>
      <div className="card" style={{ maxWidth: 520, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>🔐 Change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div className="form-group"><label className="label">Current Password</label><input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="Current password" className="input" /></div>
          <div className="form-group"><label className="label">New Password</label><input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password (min 6)" className="input" /></div>
          <div className="form-group"><label className="label">Confirm New Password</label><input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirm password" className="input" /></div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Updating..." : "Update Password"}</button>
        </form>
      </div>
      <div className="card" style={{ maxWidth: 520 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 6 }}>💳 UPI Payment ID</h3>
        <p style={{ fontSize: 13, color: "var(--gray3)", marginBottom: 14 }}>This UPI ID is shown to customers during checkout. Update it anytime.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@bank" className="input" style={{ fontFamily: "var(--font-mono)", fontSize: 15 }} />
          <button onClick={saveUpi} className="btn btn-primary" style={{ flexShrink: 0 }} disabled={savingUpi}>
            <Save size={14}/> {savingUpi ? "Saving..." : "Save"}
          </button>
        </div>
        <div style={{ fontSize: 12, color: "var(--gray3)", marginTop: 8 }}>
          Current: <span style={{ fontFamily: "var(--font-mono)", color: "var(--neon)" }}>{upiId}</span>
        </div>
      </div>
    </div>
  );
}

// ---- SITE SETTINGS (Social, Footer pages, Shipping) exported and used in Footer ----
export async function loadSiteSettings() {
  try {
    return await dataManager.getSettings("site");
  } catch (e) {}
  return null;
}
