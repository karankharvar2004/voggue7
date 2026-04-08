import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { dataManager } from "../dataManager";

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState({ instagram: "", twitter: "", youtube: "" });

  useEffect(() => {
    (async () => {
      try {
        const d = await dataManager.getSettings("site");
        if (d && d.socialLinks) setSocialLinks(d.socialLinks);
      } catch (e) {}
    })();
  }, []);

  const socials = [
    { key: "instagram", Icon: Instagram, label: "Instagram" },
    { key: "twitter", Icon: Twitter, label: "Twitter" },
    { key: "youtube", Icon: Youtube, label: "YouTube" },
  ];

  return (
    <footer style={{ background: "var(--gray)", borderTop: "1px solid var(--border)", marginTop: 80 }}>
      {/* Top strip */}
      <div style={{ background: "var(--neon)", padding: "16px 0", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <img src="/BrandIcon.png?v=3" alt="Brand Icon" style={{ height: 56, objectFit: "contain" }} />
        <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,3.5vw,30px)", color: "var(--black)", letterSpacing: 3 }}>
          VOGGUE7 — DRIP DIFFERENT
        </div>
        <img src="/BrandIcon.png?v=3" alt="Brand Icon" style={{ height: 56, objectFit: "contain" }} />
      </div>

      <div className="container" style={{ padding: "52px 24px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px,1fr))", gap: 40, marginBottom: 44 }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <img src="/Logo.png?v=3" alt="Voggue7 Logo" style={{ height: 110, objectFit: "contain", filter: "invert(1)" }} />
            </div>
            <p style={{ color: "var(--gray3)", fontSize: 13, lineHeight: 1.8, marginBottom: 16 }}>
              India's most GenZ streetwear brand. T-shirts that hit harder than your playlist. No cap, no boring fits. 🔥
            </p>
            {/* Social Links — from Firebase */}
            <div style={{ display: "flex", gap: 10 }}>
              {socials.map(({ key, Icon, label }) => (
                socialLinks[key] ? (
                  <a key={key} href={socialLinks[key]} target="_blank" rel="noopener noreferrer"
                    title={label}
                    style={{ background: "var(--gray2)", border: "1px solid var(--border)", padding: 9, borderRadius: 8, display: "flex", alignItems: "center", color: "var(--gray3)", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--neon)"; e.currentTarget.style.color = "var(--neon)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--gray3)"; e.currentTarget.style.transform = ""; }}>
                    <Icon size={15} />
                  </a>
                ) : null
              ))}
              {/* Show placeholders if none set */}
              {!Object.values(socialLinks).some(Boolean) && socials.map(({ Icon, key }) => (
                <div key={key} style={{ background: "var(--gray2)", border: "1px solid var(--border)", padding: 9, borderRadius: 8, display: "flex", alignItems: "center", color: "#444" }}>
                  <Icon size={15} />
                </div>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <div style={{ fontWeight: 800, marginBottom: 14, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>Shop</div>
            {[["All Drops", "/shop"], ["Men", "/shop?cat=Men"], ["Women", "/shop?cat=Women"], ["Unisex", "/shop?cat=Unisex"]].map(([l, p]) => (
              <Link key={l} to={p} style={{ display: "block", color: "var(--gray3)", fontSize: 13, marginBottom: 9, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "var(--neon)"}
                onMouseLeave={e => e.target.style.color = "var(--gray3)"}>{l}</Link>
            ))}
          </div>

          {/* Help */}
          <div>
            <div style={{ fontWeight: 800, marginBottom: 14, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>Help</div>
            {[["Contact Us", "/contact"], ["Track My Order", "/orders"], ["Returns & Refunds", "/orders"], ["Size Guide", "/shop"]].map(([l, p]) => (
              <Link key={l} to={p} style={{ display: "block", color: "var(--gray3)", fontSize: 13, marginBottom: 9, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "var(--neon)"}
                onMouseLeave={e => e.target.style.color = "var(--gray3)"}>{l}</Link>
            ))}
          </div>

          {/* Why us */}
          <div>
            <div style={{ fontWeight: 800, marginBottom: 14, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>Why Voggue7</div>
            {["⚡ New drops weekly", "🚚 Fast Pan-India delivery", "↩️ 7-day easy returns", "🔒 100% secure payments", "🇮🇳 Made in India"].map(t => (
              <div key={t} style={{ color: "var(--gray3)", fontSize: 13, marginBottom: 9 }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 12, color: "var(--gray3)" }}>© 2024 Voggue7. All rights reserved. Made with 🔥 in India.</div>
          <div style={{ display: "flex", gap: 18 }}>
            {[["Privacy Policy", "/policy/privacy"], ["Terms", "/policy/terms"], ["Shipping Policy", "/policy/shipping"]].map(([l, p]) => (
              <Link key={l} to={p} style={{ fontSize: 12, color: "var(--gray3)", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "var(--neon)"}
                onMouseLeave={e => e.target.style.color = "var(--gray3)"}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
