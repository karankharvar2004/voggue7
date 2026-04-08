import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dataManager } from "../dataManager";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";

// Hook to load shipping settings
function useShippingSettings() {
  const [shippingCharge, setShippingCharge] = useState(99);
  const [freeAbove, setFreeAbove] = useState(999);
  useEffect(() => {
    (async () => {
      try {
        const d = await dataManager.getSettings("site");
        if (d) {
          setShippingCharge(d.shippingCharge ?? 99);
          setFreeAbove(d.freeShippingAbove ?? 999);
        }
      } catch (e) { }
    })();
  }, []);
  return { shippingCharge, freeAbove };
}

// ---- CART PAGE ----
export function Cart() {
  const { cart, cartLoading, removeFromCart, updateQty, total } = useCart();
  const { shippingCharge, freeAbove } = useShippingSettings();
  const navigate = useNavigate();
  const shipping = total >= freeAbove ? 0 : shippingCharge;
  const finalTotal = total + shipping;

  if (cartLoading) return (
    <div className="flex-center" style={{ minHeight: "70vh" }}>
      <div className="spinner" />
    </div>
  );

  if (cart.length === 0) return (
    <div className="flex-center" style={{ flexDirection: "column", minHeight: "70vh", gap: 16 }}>
      <div style={{ fontSize: 64 }}>🛍️</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1 }}>CART IS EMPTY</h2>
      <p style={{ color: "var(--gray3)" }}>Go get some drip first!</p>
      <Link to="/shop" className="btn btn-primary">Shop Now <ArrowRight size={14} /></Link>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: 2, marginBottom: 32 }}>YOUR CART</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }} className="cart-grid">

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {cart.map(item => (
            <div key={item.key} className="card" style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <img
                src={item.image || "/tshirt1.jpg"}
                alt={item.name}
                style={{ width: 88, height: 108, borderRadius: 10, objectFit: "cover", flexShrink: 0, background: "var(--gray2)" }}
                onError={e => e.target.src = "/tshirt1.jpg"}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 15 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "var(--gray3)", marginBottom: 10 }}>Size: {item.size} · {item.category}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--gray2)", borderRadius: 8, padding: "4px 8px" }}>
                    <button onClick={() => updateQty(item.key, item.qty - 1)} style={{ background: "none", border: "none", color: "var(--white)", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ minWidth: 24, textAlign: "center", fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.key, item.qty + 1)} style={{ background: "none", border: "none", color: "var(--white)", cursor: "pointer", padding: 2, display: "flex" }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--neon)" }}>₹{item.price * item.qty}</span>
                  {item.price > 0 && item.qty > 1 && (
                    <span style={{ fontSize: 12, color: "var(--gray3)" }}>₹{item.price} each</span>
                  )}
                </div>
              </div>
              <button onClick={() => removeFromCart(item.key)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: 8, flexShrink: 0 }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card" style={{ position: "sticky", top: 80 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Order Summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--gray3)" }}>
              <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
              <span>₹{total}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "var(--gray3)" }}>Shipping</span>
              <span style={{ color: shipping === 0 ? "#4ade80" : "var(--white)", fontWeight: 600 }}>
                {shipping === 0 ? "FREE 🎉" : `₹${shipping}`}
              </span>
            </div>
            {shipping > 0 && (
              <div style={{ fontSize: 12, color: "var(--neon)", background: "rgba(212,255,0,0.07)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(212,255,0,0.15)" }}>
                Add ₹{freeAbove - total} more for FREE shipping!
              </div>
            )}
          </div>
          <div className="divider" />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
            <span>Total</span>
            <span style={{ color: "var(--neon)" }}>₹{finalTotal}</span>
          </div>
          <button onClick={() => navigate("/checkout")} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15 }}>
            Checkout <ArrowRight size={16} />
          </button>
          <Link to="/shop" style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: 13, color: "var(--gray3)" }}>
            Continue Shopping
          </Link>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .cart-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

// ---- CHECKOUT PAGE ----
export function Checkout() {
  const { cart, cartLoading, total, clearCart } = useCart();
  const { currentUser, userProfile } = useAuth();
  const { shippingCharge, freeAbove } = useShippingSettings();
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState("cod");
  const [upiId, setUpiId] = useState("");
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: userProfile?.name || "",
    phone: userProfile?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [merchantUpi, setMerchantUpi] = useState("7265065054@ybl");
  const shipping = total >= freeAbove ? 0 : shippingCharge;
  const finalTotal = total + shipping;
  const upiDeepLink = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent("Voggue7")}&am=${finalTotal}&cu=INR`;

  useEffect(() => {
    (async () => {
      try {
        const d = await dataManager.getSettings("payment");
        if (d && d.upiId) setMerchantUpi(d.upiId);
      } catch (e) { }
    })();
  }, []);

  const setAddr = (k) => (e) => setAddress(prev => ({ ...prev, [k]: e.target.value }));

  async function placeOrder() {
    if (currentUser?.uid) {
      const lastOrderTime = localStorage.getItem(`voggue7_last_order_${currentUser.uid}`);
      if (lastOrderTime && Date.now() - parseInt(lastOrderTime) < 60000) {
        toast.error("Please wait a minute before placing another order!");
        return;
      }
    }

    const { name, phone, address: addr, city, state, pincode } = address;
    if (!name || !phone || !addr || !city || !state || !pincode) {
      toast.error("Fill in your complete address!");
      return;
    }
    if (payMethod === "online") {
      if (!upiId.trim()) { toast.error("Enter your UPI ID!"); return; }
      if (!utr.trim()) { toast.error("Enter UTR / Transaction number!"); return; }
    }
    setLoading(true);
    try {
      await dataManager.addOrder({
        userId: currentUser.uid,
        userName: userProfile?.name || name,
        userEmail: currentUser.email,
        userPhone: phone,
        items: cart,
        total: finalTotal,
        subtotal: total,
        shipping,
        shippingAddress: address,
        paymentMethod: payMethod,
        paymentStatus: payMethod === "cod" ? "cod" : "pending_verification",
        upiId: payMethod === "online" ? upiId : null,
        utrNumber: payMethod === "online" ? utr : null,
        status: "pending",
        deliveredAt: null,
        isReturnRequested: false,
        estimatedDelivery: null,
        trackingId: null,
      });

      if (currentUser?.uid) {
        localStorage.setItem(`voggue7_last_order_${currentUser.uid}`, Date.now().toString());
      }

      clearCart();
      toast.success("Order placed! 🎉");
      navigate("/orders");
    } catch (e) {
      toast.error("Failed to place order. Try again!");
      console.error(e);
    }
    setLoading(false);
  }

  if (cartLoading) return (
    <div className="flex-center" style={{ minHeight: "70vh" }}>
      <div className="spinner" />
    </div>
  );
  if (cart.length === 0) { navigate("/cart"); return null; }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: 2, marginBottom: 32 }}>CHECKOUT</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }} className="checkout-grid">

        <div>
          {/* Delivery Address */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: 16 }}>📍 Delivery Address</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["name", "Full Name *", "text", false],
                ["phone", "Phone Number *", "tel", false],
                ["address", "Full Address *", "text", true],
                ["city", "City *", "text", false],
                ["state", "State *", "text", false],
                ["pincode", "Pincode *", "text", false],
              ].map(([k, p, t, full]) => (
                <div key={k} style={{ gridColumn: full ? "1/-1" : "auto" }}>
                  <label className="label">{p}</label>
                  <input type={t} value={address[k]} onChange={setAddr(k)} placeholder={p} className="input" />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 16 }}>💳 Payment Method</h3>
            <div style={{ background: "var(--gray2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, fontSize: 13, color: "var(--gray3)", lineHeight: 1.5 }}>
              "Our approach to commerce is intentional and transparent✨. By eliminating third-party processors🚫, we protect your financial data🔒 and keep your experience truly personal🤝, Because the Voggue7 Gang deserves privacy, not compromise💎"
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              {[["cod", "Cash on Delivery 🚚"], ["online", "UPI / Online 📱"]].map(([v, l]) => (
                <button key={v} onClick={() => setPayMethod(v)}
                  style={{
                    flex: 1, padding: "14px 16px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14,
                    background: payMethod === v ? "rgba(212,255,0,0.1)" : "var(--gray2)",
                    border: `1.5px solid ${payMethod === v ? "var(--neon)" : "#333"}`,
                    color: payMethod === v ? "var(--neon)" : "var(--white)",
                    transition: "all 0.2s",
                  }}>
                  {l}
                </button>
              ))}
            </div>

            {payMethod === "online" && (
              <div style={{ background: "rgba(212,255,0,0.04)", border: "1px solid rgba(212,255,0,0.15)", borderRadius: 12, padding: 18 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--neon)", marginBottom: 12, letterSpacing: 1 }}>SCAN TO PAY</div>
                  <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "2px solid rgba(212,255,0,0.3)" }}>
                    <QRCodeSVG value={upiDeepLink} size={160} level="M" />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray3)", marginTop: 12, textAlign: "center" }}>
                    Scan with any UPI app to pay <strong style={{ color: "var(--neon)", fontSize: 14 }}>₹{finalTotal}</strong>
                  </div>
                </div>

                <div style={{ textAlign: "center", fontSize: 11, color: "var(--gray3)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  OR PAY TO UPI ID
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "var(--gray3)", marginBottom: 6, fontWeight: 600 }}>UPI ID:</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gray2)", padding: "10px 14px", borderRadius: 10 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--neon)", flex: 1, letterSpacing: 0.5 }}>{merchantUpi}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(merchantUpi); toast.success("UPI ID copied!"); }}
                      style={{ background: "none", border: "none", color: "var(--gray3)", cursor: "pointer", display: "flex" }}>
                      <Copy size={15} />
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray3)", marginTop: 6 }}>
                    Amount to pay: <strong style={{ color: "var(--neon)", fontSize: 14 }}>₹{finalTotal}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Your UPI ID (used for payment)</label>
                  <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@bank" className="input" />
                </div>
                <div className="form-group">
                  <label className="label">UTR / Transaction Number *</label>
                  <input type="text" value={utr} onChange={e => setUtr(e.target.value)} placeholder="12-digit UTR number from your UPI app" className="input" />
                </div>
                <div style={{ fontSize: 12, color: "var(--orange)", background: "rgba(255,107,53,0.08)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,107,53,0.2)" }}>
                  ⚠️ Admin will verify your UTR number. Order confirmed after verification (usually within 1 hour).
                </div>
              </div>
            )}

            {payMethod === "cod" && (
              <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "var(--gray3)" }}>
                ✅ Pay ₹{finalTotal} in cash when your order arrives. No advance payment needed!
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card" style={{ position: "sticky", top: 80 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Order Summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {cart.map(item => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--gray3)", flex: 1, marginRight: 8 }}>{item.name} × {item.qty} ({item.size})</span>
                <span style={{ flexShrink: 0 }}>₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "var(--gray3)" }}>Subtotal</span>
              <span>₹{total}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "var(--gray3)" }}>Shipping</span>
              <span style={{ color: shipping === 0 ? "#4ade80" : "var(--white)" }}>
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18, borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
              <span>Total</span>
              <span style={{ color: "var(--neon)" }}>₹{finalTotal}</span>
            </div>
          </div>
          <button onClick={placeOrder} disabled={loading} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15 }}>
            {loading ? "Placing Order..." : `Place Order ₹${finalTotal} 🎉`}
          </button>
          <div style={{ fontSize: 11, color: "var(--gray3)", textAlign: "center", marginTop: 10 }}>
            🔒 Secure checkout · Your data is safe
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .checkout-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
