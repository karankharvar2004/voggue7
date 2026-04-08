import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dataManager } from "../dataManager";
import { useAuth } from "../contexts/AuthContext";
import { Heart, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export function useWishlist() {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`wishlist_${currentUser.uid}`);
      if (saved) setWishlist(JSON.parse(saved));
    }
  }, [currentUser]);
  function toggle(productId) {
    if (!currentUser) { toast.error("Login to save wishlist!"); return; }
    
    const isCurrentlyWishlisted = wishlist.includes(productId);
    const next = isCurrentlyWishlisted 
      ? wishlist.filter(id => id !== productId) 
      : [...wishlist, productId];
      
    setWishlist(next);
    localStorage.setItem(`wishlist_${currentUser.uid}`, JSON.stringify(next));
    toast(isCurrentlyWishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
  }
  function isWishlisted(id) { return wishlist.includes(id); }
  return { wishlist, toggle, isWishlisted };
}

const DEFAULT_SLIDES = [
  { id: 1, image: "/tshirt1.jpg", title: "TRIBE NOMADIC", subtitle: "The Dragon Collection — Wild & Untamed", badge: "NEW DROP", cta: "Shop Now", link: "/shop" },
  { id: 2, image: "/tshirt3.png", title: "PHANTOM EDITION", subtitle: "Made For The Villains — Dare To Be Different", badge: "BESTSELLER", cta: "Explore", link: "/shop?cat=Mens" },
  { id: 3, image: "/tshirt2.jpg", title: "ELEGANT SERIES", subtitle: "Minimalist Drip — Less Is More", badge: "LIMITED", cta: "Shop Now", link: "/shop?cat=Unisex" },
  { id: 4, image: "/tshirt4.png", title: "VOGGUE7 ORIGINALS", subtitle: "Fresh Drops Every Week — Stay Ahead", badge: "HOT", cta: "View All", link: "/shop" },
];

const DEFAULT_FEATURES = [
  { icon: "⚡", title: "Lightning Drops", desc: "New styles every week" },
  { icon: "🚚", title: "Fast Delivery", desc: "Pan India 3–5 days" },
  { icon: "↩️", title: "7-Day Returns", desc: "No questions asked" },
  { icon: "🔒", title: "Secure Payments", desc: "UPI & COD available" },
];

const DEFAULT_STATS = [
  { value: "10K+", label: "Happy Customers" },
  { value: "500+", label: "Styles" },
  { value: "4.9★", label: "Rating" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [shippingBar, setShippingBar] = useState("Free shipping ₹999+ · 7-day returns · Secure payments · 3–5 day delivery");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [catImages, setCatImages] = useState({});
  const slideTimer = useRef(null);
  const navigate = useNavigate();
  const { isWishlisted, toggle } = useWishlist();

  useEffect(() => {
    (async () => {
      // Load products INDEPENDENTLY
      try {
        const prods = await dataManager.getProducts();
        prods.sort((a,b) => (new Date(b.createdAt) - new Date(a.createdAt)));
        
        // Deduplicate products with the exact same name (case-insensitive) 
        // to handle the case where the same product is added multiple times for different categories.
        const uniqueProds = [];
        const seenNames = new Set();
        for (const p of prods) {
          const n = (p.name || "").toLowerCase().trim();
          if (!seenNames.has(n)) {
            seenNames.add(n);
            uniqueProds.push(p);
          }
        }
        
        setProducts(uniqueProds.slice(0, 8));
      } catch (e) {
        console.error("Products load error:", e);
      }
      setLoading(false);

      // Load settings separately
      try {
        const data = await dataManager.getSettings("homepage");
        if (data) {
          if (data.slides?.length) setSlides(data.slides);
          if (data.features?.length) setFeatures(data.features);
          if (data.stats?.length) setStats(data.stats);
          if (data.shippingBar) setShippingBar(data.shippingBar);
          if (data.catImages?.length) {
            const imgMap = {};
            data.catImages.forEach(c => { if (c.image) imgMap[c.name] = c.image; });
            setCatImages(imgMap);
          }
        }
      } catch (e) { console.warn("Settings load error (non-critical):", e); }

      // Load categories separately
      try {
        const cats = await dataManager.getCategories();
        setCategories(cats);
      } catch (e) { console.warn("Categories load error:", e); }
    })();
  }, []);

  useEffect(() => {
    slideTimer.current = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 4500);
    return () => clearInterval(slideTimer.current);
  }, [slides.length]);

  function nextSlide() { clearInterval(slideTimer.current); setCurrentSlide(p => (p + 1) % slides.length); }
  function prevSlide() { clearInterval(slideTimer.current); setCurrentSlide(p => (p - 1 + slides.length) % slides.length); }

  const defaultCatImages = { Mens: "/tshirt2.jpg", Womens: "/tshirt3.png", Unisex: "/tshirt1.jpg" };
  const getCatImg = (name) => catImages[name] || defaultCatImages[name] || "/tshirt4.png";
  const displayCats = categories.length > 0
    ? categories.slice(0, 3).map(c => ({ name: c.name, img: getCatImg(c.name) }))
    : [{ name: "Mens", img: getCatImg("Mens") }, { name: "Womens", img: getCatImg("Womens") }, { name: "Unisex", img: getCatImg("Unisex") }];

  return (
    <div>
      {/* HERO CAROUSEL */}
      <section style={{ position: "relative", height: "85vh", minHeight: 480, maxHeight: 800, overflow: "hidden", background: "var(--black)" }}>
        {slides.map((slide, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, opacity: i === currentSlide ? 1 : 0, transition: "opacity 0.9s ease", pointerEvents: i === currentSlide ? "all" : "none" }}>
            <img src={slide.image} alt={slide.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(10,10,10,0.98) 35%, rgba(10,10,10,0.15) 100%)" }} />
            <div className="container" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center" }}>
              <div style={{ maxWidth: 560, width: "100%" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(212,255,0,0.12)", border: "1px solid rgba(212,255,0,0.3)", borderRadius: 100, padding: "4px 12px", fontSize: 10, fontWeight: 800, color: "var(--neon)", letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>
                  ⚡ {slide.badge}
                </div>
                <h1 className="hero-title" style={{ marginBottom: 12 }}>
                  {slide.title?.split(" ").map((word, wi) => (
                    <span key={wi} style={{ display: "block", color: wi % 2 === 1 ? "var(--neon)" : "var(--white)" }}>{word}</span>
                  ))}
                </h1>
                <p style={{ color: "rgba(245,240,232,0.55)", fontSize: "clamp(13px,2vw,16px)", lineHeight: 1.6, marginBottom: 24, maxWidth: 360 }}>{slide.subtitle}</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link to={slide.link || "/shop"} className="btn btn-primary" style={{ fontSize: 14, padding: "12px 24px" }}>
                    {slide.cta} <ArrowRight size={14} />
                  </Link>
                  <Link to="/shop" className="btn btn-secondary" style={{ fontSize: 14, padding: "12px 20px" }}>All Drops</Link>
                </div>
              </div>
              {/* Right image panel - hidden on mobile */}
              <div style={{ position: "absolute", right: 0, top: "10%", bottom: "10%", width: "38%", borderRadius: "16px 0 0 16px", overflow: "hidden", border: "1.5px solid rgba(212,255,0,0.12)" }} className="hero-img-panel">
                <img src={slide.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,10,10,0.7) 0%, transparent 50%)" }} />
              </div>
            </div>
          </div>
        ))}

        <button onClick={prevSlide} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", zIndex: 10 }}>
          <ChevronLeft size={20} />
        </button>
        <button onClick={nextSlide} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", zIndex: 10 }}>
          <ChevronRight size={20} />
        </button>
        <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 10 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? 28 : 8, height: 8, borderRadius: 4, background: i === currentSlide ? "var(--neon)" : "rgba(255,255,255,0.25)", border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }} />
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 24, right: 24, fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.35)", zIndex: 10 }}>
          {String(currentSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>
      </section>

      {/* Features bar */}
      <section style={{ background: "var(--gray2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "22px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "rgba(212,255,0,0.1)", padding: "10px 11px", borderRadius: 10, fontSize: 18, lineHeight: 1 }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{f.title}</div>
                  <div style={{ fontSize: 11, color: "var(--gray3)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "36px 0", borderBottom: "1px solid var(--border)", background: "var(--black)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(30px,6vw,80px)", flexWrap: "wrap" }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,48px)", color: "var(--neon)", letterSpacing: 2 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--gray3)", letterSpacing: 0.5, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - real thumbnails */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 10, color: "var(--neon)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, fontWeight: 800 }}>Collections</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,5vw,52px)", letterSpacing: 3 }}>YOUR VIBE, YOUR DRIP</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(8px,2vw,14px)" }}>
            {displayCats.map(cat => (
              <Link key={cat.name} to={`/shop?cat=${cat.name}`}
                style={{ display: "block", borderRadius: 18, overflow: "hidden", position: "relative", aspectRatio: "2/3", border: "1px solid var(--border)", transition: "all 0.35s ease" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-10px)"; e.currentTarget.style.borderColor = "rgba(212,255,0,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "var(--border)"; }}>
                <img src={cat.img} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.05) 55%)" }} />
                <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,3vw,32px)", letterSpacing: 3, color: "white", marginBottom: 8 }}>{cat.name.toUpperCase()}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--neon)", color: "var(--black)", padding: "5px 12px", borderRadius: 100, fontSize: 11, fontWeight: 800 }}>
                    Shop Now <ArrowRight size={11} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products with wishlist */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--neon)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, fontWeight: 800 }}>Fresh Drops</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,44px)", letterSpacing: 2 }}>LATEST TEES 🔥</h2>
            </div>
            <Link to="/shop" className="btn btn-secondary" style={{ fontSize: 13 }}>View All <ArrowRight size={13} /></Link>
          </div>
          {loading ? (
            <div className="flex-center" style={{ height: 200 }}><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--gray3)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Products Coming Soon!</div>
              <div style={{ fontSize: 14 }}>Admin is adding fire drops. Stay tuned.</div>
            </div>
          ) : (
            <div className="grid-4">
              {products.map(p => (
                <ProductCard key={p.id} product={p}
                  onClick={() => navigate(`/product/${p.id}`)}
                  wishlisted={isWishlisted(p.id)}
                  onWishlist={e => { e.stopPropagation(); toggle(p.id); }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom banner */}
      <section style={{ background: "var(--neon)", padding: "80px 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(0,0,0,0.04) 50px, rgba(0,0,0,0.04) 100px)" }} />
        <div className="container" style={{ position: "relative" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,6vw,76px)", color: "var(--black)", letterSpacing: 3, marginBottom: 12, lineHeight: 0.95 }}>NO BORING FITS ALLOWED</h2>
          <p style={{ color: "rgba(0,0,0,0.55)", fontSize: 17, marginBottom: 32 }}>Join 10,000+ GenZ who drip different</p>
          <Link to="/register" className="btn" style={{ background: "var(--black)", color: "var(--neon)", padding: "15px 36px", fontSize: 15, borderRadius: 12 }}>
            Join the Movement ⚡
          </Link>
        </div>
      </section>
    </div>
  );
}



export function ProductCard({ product, onClick, wishlisted, onWishlist }) {
  const discount = product.mrp && product.mrp > product.price
    ? Math.round((1 - product.price / product.mrp) * 100) : null;
  return (
    <div className="product-card" onClick={onClick} style={{ position: "relative" }}>
      <div style={{ overflow: "hidden", position: "relative" }}>
        <img src={product.images?.[0] || "/tshirt1.jpg"} alt={product.name} onError={e => e.target.src="/tshirt1.jpg"} />
        {/* Discount badge top-left */}
        {discount && (
          <div style={{ position: "absolute", top: 10, left: 10, background: "#4ade80", color: "#000", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
            {discount}% OFF
          </div>
        )}
        {/* Product badge top-left (below discount) */}
        {product.badge && !discount && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <span className={`badge badge-${product.badge === "NEW" ? "neon" : product.badge === "HOT" ? "pink" : "purple"}`}>{product.badge}</span>
          </div>
        )}
        {product.badge && discount && (
          <div style={{ position: "absolute", top: 34, left: 10 }}>
            <span className={`badge badge-${product.badge === "NEW" ? "neon" : product.badge === "HOT" ? "pink" : "purple"}`}>{product.badge}</span>
          </div>
        )}
        {/* Wishlist heart top-right */}
        {onWishlist !== undefined && (
          <button onClick={onWishlist} style={{ position: "absolute", top: 10, right: 10, background: wishlisted ? "var(--neon2)" : "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", zIndex: 2 }}>
            <Heart size={14} fill={wishlisted ? "white" : "none"} color="white" />
          </button>
        )}
      </div>
      <div className="product-card-body">
        <div style={{ fontSize: 11, color: "var(--gray3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{product.category}</div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, lineHeight: 1.3 }}>{product.name}</div>
        {/* Price row: actual price + strikethrough MRP */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--neon)", lineHeight: 1 }}>₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span style={{ fontSize: 13, color: "var(--gray3)", textDecoration: "line-through" }}>₹{product.mrp}</span>
            )}
            {discount && (
              <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 800, background: "rgba(74,222,128,0.12)", padding: "1px 6px", borderRadius: 4 }}>{discount}% off</span>
            )}
          </div>
          {discount && (
            <div style={{ fontSize: 11, color: "#4ade80", marginTop: 2 }}>You save ₹{product.mrp - product.price}</div>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--gray3)" }}>🚚 Delivery in 5–7 days</div>
      </div>
    </div>
  );
}
