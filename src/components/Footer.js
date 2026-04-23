import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dataManager } from "../dataManager";

const InstagramLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad)" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7ZM9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12Z" fill="white" />
    <circle cx="17" cy="7" r="1.5" fill="white" />
    <defs>
      <linearGradient id="ig-grad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
  </svg>
);

const WhatsappLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.01 2.01C6.49 2.01 2.01 6.49 2.01 12.01C2.01 13.9 2.54 15.68 3.47 17.18L2 22L6.93 20.57C8.42 21.46 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2.01 12.01 2.01Z" fill="#25D366" />
    <path fillRule="evenodd" clipRule="evenodd" d="M17.47 15.64C17.24 16.31 16.32 16.89 15.54 17.06C14.98 17.18 14.19 17.27 11.45 16.14C8.01 14.73 5.76 11.23 5.58 11.01C5.41 10.78 4.14 9.1 4.14 7.36C4.14 5.62 5.04 4.77 5.39 4.4C5.69 4.08 6.13 3.96 6.55 3.96C6.69 3.96 6.81 3.96 6.91 3.97C7.26 3.99 7.44 4.01 7.67 4.56C7.96 5.26 8.67 6.98 8.76 7.17C8.85 7.36 8.94 7.6 8.82 7.83C8.71 8.07 8.61 8.24 8.44 8.44C8.28 8.64 8.09 8.87 7.94 9.04C7.77 9.22 7.59 9.42 7.85 9.87C8.1 10.31 8.79 11.44 9.82 12.35C11.14 13.52 12.21 13.9 12.69 14.1C13.06 14.25 13.5 14.22 13.75 13.95C14.07 13.62 14.47 13.01 14.89 12.39C15.2 11.94 15.61 11.88 16.03 12.04C16.46 12.19 18.73 13.31 19.18 13.54C19.64 13.78 19.95 13.88 20.06 14.09C20.17 14.3 20.17 15.34 19.7 16.01L17.47 15.64Z" fill="white" />
  </svg>
);

const YoutubeLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.582 6.186C21.346 5.304 20.651 4.608 19.771 4.37C18.173 3.945 12 3.945 12 3.945C12 3.945 5.827 3.945 4.229 4.37C3.349 4.608 2.654 5.304 2.418 6.186C1.996 7.784 1.996 11.233 1.996 11.233C1.996 11.233 1.996 14.682 2.418 16.279C2.654 17.161 3.349 17.858 4.229 18.094C5.827 18.522 12 18.522 12 18.522C12 18.522 18.173 18.522 19.771 18.094C20.651 17.858 21.346 17.161 21.582 16.279C22.004 14.682 22.004 11.233 22.004 11.233C22.004 11.233 22.004 7.784 21.582 6.186Z" fill="#FF0000" />
    <path d="M9.999 14.417L15.197 11.233L9.999 8.049V14.417Z" fill="white" />
  </svg>
);

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState({ instagram: "", whatsapp: "", youtube: "" });

  useEffect(() => {
    (async () => {
      try {
        const d = await dataManager.getSettings("site");
        if (d && d.socialLinks) setSocialLinks(d.socialLinks);
      } catch (e) { }
    })();
  }, []);

  const socials = [
    { key: "instagram", Icon: InstagramLogo, label: "Instagram", defaultLink: "https://www.instagram.com/voggue7_india?igsh=MTNrcnRpNHB3aWd0dw%3D%3D" },
    { key: "whatsapp", Icon: WhatsappLogo, label: "WhatsApp", defaultLink: "" },
    // { key: "youtube", Icon: YoutubeLogo, label: "YouTube", defaultLink: "" },
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

      <div className="container page-bottom-spacing" style={{ paddingTop: 52, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px,1fr))", gap: 40, marginBottom: 44 }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <img src="/Logo.png?v=3" alt="Voggue7 Logo" style={{ height: 110, objectFit: "contain", filter: "invert(1)" }} />
            </div>
            <p style={{ color: "var(--gray3)", fontSize: 13, lineHeight: 1.8, marginBottom: 16 }}>
              India's most GenZ streetwear brand. T-shirts that hit harder than your playlist. No cap, no boring fits. 🔥
            </p>
            {/* Social Links */}
            <div style={{ display: "flex", gap: 10 }}>
              {socials.map(({ key, Icon, label, defaultLink }) => {
                const link = socialLinks[key] || defaultLink;
                return link ? (
                  <a key={key} href={link} target="_blank" rel="noopener noreferrer"
                    title={label}
                    style={{ background: "var(--gray2)", border: "1px solid var(--border)", padding: 9, borderRadius: 8, display: "flex", alignItems: "center", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--neon)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; }}>
                    <Icon size={20} />
                  </a>
                ) : (
                  <div key={key} title={label} style={{ background: "var(--gray2)", border: "1px solid var(--border)", padding: 9, borderRadius: 8, display: "flex", alignItems: "center", cursor: "default" }}>
                    <Icon size={20} />
                  </div>
                );
              })}
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
            {[["Contact Us", "/contact"], ["Track My Order", "/orders"], ["Returns & Refunds", "/orders"]].map(([l, p]) => (
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
          <div style={{ fontSize: 12, color: "var(--gray3)" }}>© 2026 Voggue7. All rights reserved. Made with 🔥 in India.</div>
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
