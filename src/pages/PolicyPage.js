import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { dataManager } from "../dataManager";

export default function PolicyPage() {
  const { type } = useParams();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const defaults = {
    privacy: { title: "Privacy Policy", key: "privacyPolicy", default: "## Privacy Policy\n\nYour privacy matters to us. We collect only necessary information to process your orders.\n\nContact: support@voggue7.com" },
    terms: { title: "Terms of Service", key: "termsOfService", default: "## Terms of Service\n\nBy using Voggue7, you agree to our terms.\n\n7-day return policy. All payments are secure." },
    shipping: { title: "Shipping Policy", key: "shippingPolicy", default: "## Shipping Policy\n\nFree shipping on orders above ₹999.\nDelivery in 5–7 business days Pan India." },
  };

  const info = defaults[type] || defaults.privacy;

  useEffect(() => {
    (async () => {
      try {
        const d = await dataManager.getSettings("site");
        if (d && d[info.key]) {
          setContent(d[info.key]);
        } else {
          setContent(info.default);
        }
      } catch (e) { setContent(info.default); }
      setLoading(false);
    })();
  }, [type, info]);

  // Simple markdown renderer
  function renderMarkdown(text) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i} style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: 1, marginBottom: 16, marginTop: i === 0 ? 0 : 32 }}>{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, marginTop: 24, color: "var(--neon)" }}>{line.slice(4)}</h3>;
      if (line.startsWith("- ")) return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}><span style={{ color: "var(--neon)" }}>•</span><span style={{ color: "var(--gray3)", fontSize: 15, lineHeight: 1.7 }}>{line.slice(2)}</span></div>;
      if (line === "") return <div key={i} style={{ height: 10 }} />;
      return <p key={i} style={{ color: "var(--gray3)", fontSize: 15, lineHeight: 1.8, marginBottom: 8 }}>{line}</p>;
    });
  }

  if (loading) return <div className="flex-center" style={{ height: "60vh" }}><div className="spinner" /></div>;

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 60, maxWidth: 800 }}>
      <div style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 20, padding: "40px 48px" }}>
        {renderMarkdown(content)}
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 40, paddingTop: 20, fontSize: 13, color: "var(--gray3)" }}>
          Last updated by Voggue7 Admin · For queries: <a href="mailto:support@voggue7.com" style={{ color: "var(--neon)" }}>support@voggue7.com</a>
        </div>
      </div>
    </div>
  );
}
