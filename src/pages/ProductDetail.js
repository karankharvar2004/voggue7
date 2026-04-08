import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dataManager } from "../dataManager";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "./Home";
import { ArrowLeft, Heart, ShoppingBag, Star, Package, RotateCcw, Shield, Truck, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const prods = await dataManager.getProducts();
        const p = prods.find(x => x.id === id);
        if (p) setProduct(p);
        else navigate("/shop");

        const revData = await dataManager.getReviews(id);
        revData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setReviews(revData);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [id]);

  function handleAddToCart() {
    if (!currentUser) { toast.error("Login first!"); navigate("/login"); return; }
    if (isAdmin) { toast.error("Admin can't shop 😄"); return; }
    if (!selectedSize) { toast.error("Pick a size first!"); return; }
    addToCart(product, selectedSize, quantity);
    toast.success("Added to cart! 🛍️");
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!currentUser) { toast.error("Login to review!"); return; }
    if (!reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      const newRev = {
        productId: id,
        userId: currentUser.uid,
        userName: currentUser.displayName || userProfile?.name || "Voggue Fan",
        rating,
        text: reviewText.trim(),
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      };
      const res = await dataManager.addReview(newRev);
      setReviews(prev => [res, ...prev]);
      setReviewText(""); setRating(5);
      toast.success("Review posted! 🌟");
    } catch (e) { toast.error("Failed to post review"); }
    setSubmittingReview(false);
  }

  if (loading) return <div className="flex-center" style={{ height: "60vh" }}><div className="spinner" /></div>;
  if (!product) return null;

  const images = product.images?.length ? product.images : ["/tshirt1.jpg"];
  const sizes = product.sizes?.length ? product.sizes : ["XS", "S", "M", "L", "XL", "XXL"];
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const wishlisted = isWishlisted(product.id);
  const discount = product.mrp && product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : null;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "var(--gray3)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 32 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 52, alignItems: "start" }} className="product-detail-grid">
        {/* Images */}
        <div>
          <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 12, aspectRatio: "4/5", position: "relative", background: "var(--gray)" }}>
            <img src={images[activeImg]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = "/tshirt1.jpg"} />
            {/* Wishlist on image */}
            <button onClick={() => toggle(product.id)}
              style={{ position: "absolute", top: 14, right: 14, background: wishlisted ? "var(--neon2)" : "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", border: "none", borderRadius: "50%", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
              <Heart size={18} fill={wishlisted ? "white" : "none"} color="white" />
            </button>
            {discount && (
              <div style={{ position: "absolute", top: 14, left: 14, background: "#4ade80", color: "#000", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
                {discount}% OFF
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)}
                  style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", border: `2px solid ${activeImg === i ? "var(--neon)" : "transparent"}`, cursor: "pointer", background: "var(--gray)" }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <span className="badge badge-gray">{product.category}</span>
            {product.badge && <span className={`badge badge-${product.badge === "NEW" ? "neon" : "pink"}`}>{product.badge}</span>}
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,5vw,48px)", letterSpacing: 1, marginBottom: 10, lineHeight: 1 }}>{product.name}</h1>

          {/* Rating */}
          {avgRating && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: i <= Math.round(avgRating) ? "#ffd700" : "#333", fontSize: 16 }}>★</span>)}</div>
              <span style={{ fontSize: 14, color: "var(--gray3)" }}>{avgRating} ({reviews.length} reviews)</span>
            </div>
          )}

          {/* Price - WITH MRP strikethrough and discount */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 42, color: "var(--neon)", lineHeight: 1 }}>₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span style={{ fontSize: 22, color: "var(--gray3)", textDecoration: "line-through" }}>₹{product.mrp}</span>
            )}
            {discount && (
              <span style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)", padding: "4px 12px", borderRadius: 8, fontSize: 14, fontWeight: 800 }}>
                {discount}% OFF
              </span>
            )}
          </div>
          {product.mrp && product.mrp > product.price && (
            <div style={{ fontSize: 13, color: "#4ade80", marginBottom: 16 }}>
              You save ₹{product.mrp - product.price}!
            </div>
          )}

          {product.description && (
            <p style={{ color: "var(--gray3)", lineHeight: 1.8, marginBottom: 20, fontSize: 14 }}>{product.description}</p>
          )}

          {/* Size */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "var(--gray3)", textTransform: "uppercase", letterSpacing: 1 }}>
              Select Size {selectedSize && <span style={{ color: "var(--neon)" }}>— {selectedSize}</span>}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {sizes.map(size => (
                <button key={size} onClick={() => setSelectedSize(size)}
                  style={{ padding: "9px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, background: selectedSize === size ? "var(--neon)" : "var(--gray2)", color: selectedSize === size ? "var(--black)" : "var(--white)", border: `1.5px solid ${selectedSize === size ? "var(--neon)" : "#333"}`, transition: "all 0.2s" }}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "var(--gray3)", textTransform: "uppercase", letterSpacing: 1 }}>
              Quantity
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gray2)", borderRadius: 10, padding: "6px 12px", border: "1.5px solid #333" }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: "none", border: "none", color: "var(--white)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                <Minus size={16} />
              </button>
              <span style={{ minWidth: 32, textAlign: "center", fontWeight: 700, fontSize: 16 }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ background: "none", border: "none", color: "var(--white)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button onClick={handleAddToCart} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: 16, fontSize: 16, marginBottom: 10 }}>
            <ShoppingBag size={18} /> Add to Cart
          </button>

          {/* Wishlist button */}
          <button onClick={() => toggle(product.id)} className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", padding: 13, fontSize: 14, marginBottom: 20, borderColor: wishlisted ? "var(--neon2)" : "", color: wishlisted ? "var(--neon2)" : "" }}>
            <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
            {wishlisted ? "Saved to Wishlist ❤️" : "Save to Wishlist"}
          </button>

          {/* Feature pills */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["📦", "Free shipping ₹999+"], ["↩️", "7-day returns"], ["🔒", "Secure payments"], ["🚚", "3–7 day delivery"]].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--gray3)", background: "var(--gray2)", padding: "9px 12px", borderRadius: 8 }}>
                <span>{icon}</span> {text}
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, color: "var(--gray3)", marginTop: 12, background: "rgba(212,255,0,0.05)", border: "1px solid rgba(212,255,0,0.15)", borderRadius: 8, padding: "8px 12px" }}>
            🚚 Estimated delivery: <strong style={{ color: "var(--neon)" }}>3–7 business days</strong>
          </div>
        </div>
      </div>

      {/* Reviews - visible to ALL users */}
      <div style={{ marginTop: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 1 }}>REVIEWS</h2>
          <span style={{ background: "var(--gray2)", padding: "4px 12px", borderRadius: 8, fontSize: 14, fontWeight: 700 }}>{reviews.length}</span>
          {avgRating && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, padding: "6px 12px" }}>
              <span style={{ color: "#ffd700", fontSize: 18 }}>★</span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{avgRating}</span>
            </div>
          )}
        </div>

        {/* Write review - only logged in non-admin users */}
        {currentUser && !isAdmin ? (
          <form onSubmit={submitReview} className="card" style={{ marginBottom: 28 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Write a Review ✍️</h3>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} type="button" onClick={() => setRating(i)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 28, color: i <= rating ? "#ffd700" : "#333", transition: "transform 0.1s" }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.2)"}
                  onMouseLeave={e => e.target.style.transform = ""}>★</button>
              ))}
            </div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} className="input" placeholder="Share your honest thoughts about this product..." rows={3} style={{ resize: "vertical", marginBottom: 12 }} />
            <button type="submit" className="btn btn-primary" disabled={submittingReview}>
              {submittingReview ? "Posting..." : "Post Review 🌟"}
            </button>
          </form>
        ) : !currentUser ? (
          <div className="card" style={{ marginBottom: 28, textAlign: "center", padding: "24px" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Login to write a review</div>
            <button onClick={() => navigate("/login")} className="btn btn-primary">Login to Review</button>
          </div>
        ) : null}

        {/* All reviews - visible to everyone */}
        {reviews.length === 0 ? (
          <div style={{ color: "var(--gray3)", textAlign: "center", padding: "40px 0", background: "var(--gray)", borderRadius: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⭐</div>
            <div style={{ fontWeight: 600 }}>No reviews yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Be the first to review this product!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviews.map(r => (
              <div key={r.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.userName}</div>
                    <div style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: i <= r.rating ? "#ffd700" : "#333", fontSize: 15 }}>★</span>)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray3)" }}>
                    {r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                  </div>
                </div>
                <p style={{ color: "var(--gray3)", fontSize: 14, lineHeight: 1.6 }}>{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@media (max-width: 768px) { .product-detail-grid { grid-template-columns: 1fr !important; gap: 28px !important; } }`}</style>
    </div>
  );
}
