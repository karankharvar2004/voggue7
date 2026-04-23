import React, { useState, useEffect } from "react";
import { dataManager } from "../dataManager";
import { Save, Instagram, Twitter, Youtube, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSiteSettings() {
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("shipping");
  const [settings, setSettings] = useState({
    shippingCOD: 99,
    freeAboveCOD: 999,
    shippingUPI: 0,
    freeAboveUPI: 99999,
    socialLinks: { instagram: "", twitter: "", youtube: "" },
    privacyPolicy: "## Privacy Policy\n\nYour privacy matters to us at Voggue7. We collect only necessary information to process your orders. We never sell your data to third parties.\n\n### Data We Collect\n- Name, email, phone for order processing\n- Shipping address for delivery\n- Payment confirmation details\n\n### How We Use It\nOnly to process and deliver your orders.\n\nFor questions, contact us at support@voggue7.com",
    termsOfService: "## Terms of Service\n\nBy using Voggue7, you agree to these terms.\n\n### Orders\n- All orders are subject to product availability\n- Prices may change without notice\n- We reserve the right to cancel any order\n\n### Returns\n- 7-day return policy from delivery date\n- Items must be unworn with original tags\n- Refunds processed within 5-7 business days\n\n### Payments\n- We accept UPI and Cash on Delivery\n- UPI payments verified by admin before dispatch",
    shippingPolicy: "## Shipping Policy\n\n### Delivery Time\n- Standard: 5–7 business days\n- Express: 2–3 business days (coming soon)\n\n### Shipping Charges\n- Free shipping on orders above ₹999\n- ₹99 flat rate for orders below ₹999\n\n### Coverage\nWe deliver Pan India to all major cities and towns.\n\n### Tracking\nTracking ID will be shared once your order is shipped.",
  });

  useEffect(() => {
    (async () => {
      const d = await dataManager.getSettings("site");
      if (d) {
        setSettings(prev => ({ ...prev, ...d }));
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    try {
      await dataManager.saveSettings("site", { ...settings, updatedAt: new Date().toISOString() });
      toast.success("Site settings saved! ✅");
    } catch (e) { toast.error("Failed to save"); }
    setSaving(false);
  }

  const tabs = [
    ["shipping", "💰 Shipping Charges"],
    ["social", "📱 Social Links"],
    ["privacy", "📄 Privacy Policy"],
    ["terms", "📋 Terms of Service"],
    ["shippingpolicy", "🚚 Shipping Policy"],
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1 }}>SITE SETTINGS</h1>
        <button onClick={save} className="btn btn-primary" disabled={saving}>
          <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`tag ${tab === k ? "active" : ""}`} style={{ fontSize: 12 }}>{l}</button>
        ))}
      </div>

      {/* Shipping Charges */}
      {tab === "shipping" && (
        <div className="card" style={{ maxWidth: 500 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>💰 Shipping Charges</h3>
          
          <h4 style={{ fontWeight: 600, marginBottom: 12, color: "var(--neon)" }}>Cash on Delivery (COD)</h4>
          <div className="form-group">
            <label className="label">COD Shipping Fee (₹)</label>
            <input type="number" value={settings.shippingCOD ?? 99} onChange={e => setSettings(prev => ({ ...prev, shippingCOD: Number(e.target.value) }))} className="input" placeholder="99" />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="label">COD Free Shipping Above (₹)</label>
            <input type="number" value={settings.freeAboveCOD ?? 999} onChange={e => setSettings(prev => ({ ...prev, freeAboveCOD: Number(e.target.value) }))} className="input" placeholder="999" />
          </div>

          <h4 style={{ fontWeight: 600, marginBottom: 12, color: "var(--neon)" }}>UPI / Online Payment</h4>
          <div className="form-group">
            <label className="label">UPI Shipping Fee (₹)</label>
            <input type="number" value={settings.shippingUPI ?? 0} onChange={e => setSettings(prev => ({ ...prev, shippingUPI: Number(e.target.value) }))} className="input" placeholder="0" />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="label">UPI Free Shipping Above (₹)</label>
            <input type="number" value={settings.freeAboveUPI ?? 99999} onChange={e => setSettings(prev => ({ ...prev, freeAboveUPI: Number(e.target.value) }))} className="input" placeholder="99999" />
          </div>

          <div style={{ background: "rgba(212,255,0,0.06)", border: "1px solid rgba(212,255,0,0.15)", borderRadius: 10, padding: 14, marginTop: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Preview:</div>
            <div style={{ fontSize: 13, color: "var(--gray3)" }}>
              <strong>COD:</strong> Below ₹{settings.freeAboveCOD ?? 999} → ₹{settings.shippingCOD ?? 99} (Otherwise Free)<br />
              <strong>UPI:</strong> Below ₹{settings.freeAboveUPI ?? 99999} → ₹{settings.shippingUPI ?? 0} (Otherwise Free)
            </div>
          </div>
        </div>
      )}

      {/* Social Links */}
      {tab === "social" && (
        <div className="card" style={{ maxWidth: 500 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>📱 Social Media Links</h3>
          <p style={{ fontSize: 13, color: "var(--gray3)", marginBottom: 20 }}>These links appear in the website footer. Leave blank to hide the icon.</p>
          {[
            ["instagram", "Instagram URL", "https://instagram.com/voggue7", <Instagram size={16} />],
            ["twitter", "Twitter / X URL", "https://twitter.com/voggue7", <Twitter size={16} />],
            ["youtube", "YouTube URL", "https://youtube.com/@voggue7", <Youtube size={16} />],
          ].map(([key, label, placeholder, icon]) => (
            <div key={key} className="form-group">
              <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>{icon} {label}</label>
              <input type="url" value={settings.socialLinks?.[key] || ""} onChange={e => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: e.target.value } }))} placeholder={placeholder} className="input" />
            </div>
          ))}
        </div>
      )}

      {/* Policy pages */}
      {["privacy", "terms", "shippingpolicy"].includes(tab) && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>
            {tab === "privacy" ? "📄 Privacy Policy" : tab === "terms" ? "📋 Terms of Service" : "🚚 Shipping Policy"}
          </h3>
          <p style={{ fontSize: 13, color: "var(--gray3)", marginBottom: 16 }}>Write in plain text or Markdown format. This will be shown on the policy page.</p>
          <textarea
            value={tab === "privacy" ? settings.privacyPolicy : tab === "terms" ? settings.termsOfService : settings.shippingPolicy}
            onChange={e => {
              const key = tab === "privacy" ? "privacyPolicy" : tab === "terms" ? "termsOfService" : "shippingPolicy";
              setSettings(prev => ({ ...prev, [key]: e.target.value }));
            }}
            className="input"
            rows={20}
            style={{ resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.7 }}
          />
        </div>
      )}
    </div>
  );
}
