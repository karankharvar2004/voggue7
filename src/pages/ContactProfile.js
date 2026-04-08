import React, { useState, useEffect } from "react";
import { dataManager } from "../dataManager";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle } from "lucide-react";

// ---- CONTACT PAGE ----
export function Contact() {
  const { currentUser, userProfile } = useAuth();
  const [form, setForm] = useState({
    name: userProfile?.name || "",
    email: currentUser?.email || "",
    phone: userProfile?.phone || "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [showTickets, setShowTickets] = useState(false);

  const set = k => e => setForm(prev => ({ ...prev, [k]: e.target.value }));

  // Load user's own tickets to see admin replies
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const data = await dataManager.getSupportTickets(currentUser.uid);
        setMyTickets(data);
      } catch (e) { console.error(e); }
    })();
  }, [currentUser, sent]);

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill all fields!"); return;
    }
    setLoading(true);
    try {
      await dataManager.addSupportTicket({
        ...form,
        userId: currentUser?.uid || null,
        userEmail: form.email,
        userName: form.name,
        userPhone: form.phone,
        status: "open",
        adminReply: null,
      });
      setSent(true);
      toast.success("Message sent! We'll reply within 24 hours 📩");
      setForm(prev => ({ ...prev, subject: "", message: "" }));
    } catch (e) { toast.error("Failed to send. Try again!"); }
    setLoading(false);
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,56px)", letterSpacing: 2, marginBottom: 8 }}>CONTACT US</h1>
        <p style={{ color: "var(--gray3)", marginBottom: 40, fontSize: 15 }}>
          Got a question? We got you! Reach out and we'll get back to you within 24 hours.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }} className="contact-grid">

          {/* Form */}
          <form onSubmit={submit} className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: 16 }}>💬 Send a Message</h3>

            {sent && (
              <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle size={18} color="#4ade80" />
                <div>
                  <div style={{ fontWeight: 700, color: "#4ade80", fontSize: 13 }}>Message sent successfully!</div>
                  <div style={{ fontSize: 12, color: "var(--gray3)" }}>We'll reply to your email within 24 hours.</div>
                </div>
              </div>
            )}

            {[
              ["name", "Your Name *", "text"],
              ["email", "Email Address *", "email"],
              ["phone", "Phone Number", "tel"],
              ["subject", "Subject *", "text"],
            ].map(([k, p, t]) => (
              <div key={k} className="form-group">
                <label className="label">{p}</label>
                <input type={t} value={form[k]} onChange={set(k)} placeholder={p} className="input" />
              </div>
            ))}
            <div className="form-group">
              <label className="label">Message *</label>
              <textarea value={form.message} onChange={set("message")} placeholder="Tell us what's up..." className="input" rows={4} style={{ resize: "vertical" }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: 13 }} disabled={loading}>
              <Send size={14} /> {loading ? "Sending..." : "Send Message"}
            </button>

            <div style={{ fontSize: 11, color: "var(--gray3)", marginTop: 10, textAlign: "center" }}>
              📩 Admin reply will be sent to your registered email: <strong style={{ color: "var(--white)" }}>{currentUser?.email || "your email"}</strong>
            </div>
          </form>

          {/* Contact Info */}
          <div>
            <div className="card" style={{ marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>📞 Get in Touch</h3>
              {[
                [<Mail size={16} />, "Email", "karankharvar2004@gmail.com", "mailto:karankharvar2004@gmail.com"],
                [<Phone size={16} />, "Phone / WhatsApp", "+91 72650 65054", "https://wa.me/917265065054"],
                [<MapPin size={16} />, "Location", "Ahmedabad, Gujarat, India 🇮🇳", null],
              ].map(([icon, label, value, link]) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                  <div style={{ background: "rgba(212,255,0,0.1)", padding: "9px 10px", borderRadius: 10, color: "var(--neon)", flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                    {link ? (
                      <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--neon)", textDecoration: "underline" }}>{value}</a>
                    ) : (
                      <div style={{ fontSize: 13, color: "var(--gray3)" }}>{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Clock size={16} color="var(--neon)" />
                <div style={{ fontWeight: 700, fontSize: 14 }}>Support Hours</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--gray3)", lineHeight: 1.7 }}>
                Mon–Sat: 10 AM – 7 PM IST<br />
                Sunday: 11 AM – 4 PM IST<br />
                <span style={{ color: "var(--neon)", fontSize: 12 }}>⚡ WhatsApp replies fastest!</span>
              </div>
            </div>

            <div className="card" style={{ background: "rgba(212,255,0,0.04)", border: "1px solid rgba(212,255,0,0.15)" }}>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>↩️ Return Policy</div>
              <p style={{ fontSize: 13, color: "var(--gray3)", lineHeight: 1.7 }}>
                7-day hassle-free returns after delivery. Items must be unworn with original tags. Request from your Orders page.
              </p>
            </div>
          </div>
        </div>

        {/* MY SUPPORT TICKETS — user sees admin replies here */}
        {currentUser && myTickets.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <button
              onClick={() => setShowTickets(!showTickets)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--white)", display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              <MessageSquare size={18} color="var(--neon)" />
              My Support Tickets ({myTickets.length})
              <span style={{ fontSize: 12, color: "var(--gray3)" }}>{showTickets ? "▲ Hide" : "▼ Show"}</span>
            </button>

            {showTickets && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myTickets.map(ticket => (
                  <div key={ticket.id} className="card" style={{ borderLeft: `3px solid ${ticket.status === "resolved" ? "#4ade80" : "var(--neon)"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{ticket.subject}</div>
                        <div style={{ fontSize: 12, color: "var(--gray3)" }}>
                          {ticket.createdAt?.seconds ? new Date(ticket.createdAt.seconds * 1000).toLocaleString("en-IN") : ""}
                        </div>
                      </div>
                      <span className={`badge badge-${ticket.status === "resolved" ? "green" : "orange"}`}>
                        {ticket.status === "resolved" ? "✅ Replied" : "⏳ Pending"}
                      </span>
                    </div>

                    {/* User's message */}
                    <div style={{ background: "var(--gray2)", borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 13 }}>
                      <div style={{ fontSize: 11, color: "var(--gray3)", marginBottom: 4, fontWeight: 600 }}>YOUR MESSAGE:</div>
                      <div style={{ color: "var(--gray3)", lineHeight: 1.6 }}>{ticket.message}</div>
                    </div>

                    {/* Admin reply */}
                    {ticket.adminReply ? (
                      <div style={{ background: "rgba(212,255,0,0.06)", border: "1px solid rgba(212,255,0,0.2)", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, color: "var(--neon)", marginBottom: 4, fontWeight: 700 }}>✅ VOGGUE7 REPLY:</div>
                        <div style={{ fontSize: 13, lineHeight: 1.6 }}>{ticket.adminReply}</div>
                        {ticket.repliedAt?.seconds && (
                          <div style={{ fontSize: 11, color: "var(--gray3)", marginTop: 6 }}>
                            Replied on {new Date(ticket.repliedAt.seconds * 1000).toLocaleString("en-IN")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "var(--gray3)", padding: "8px 0" }}>
                        ⏳ We'll reply within 24 hours. Check back here or your email.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@media (max-width: 640px) { .contact-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

// ---- PROFILE PAGE ----
export function Profile() {
  const { currentUser, userProfile, changePassword } = useAuth();
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!newPass || !confirmPass) return toast.error("Fill both fields!");
    if (newPass !== confirmPass) return toast.error("Passwords don't match!");
    if (newPass.length < 6) return toast.error("Min 6 characters!");
    setLoading(true);
    try {
      await changePassword(newPass);
      toast.success("Password updated! 🔐");
      setNewPass(""); setConfirmPass("");
    } catch (e) {
      if (e.code === "auth/requires-recent-login") toast.error("Please logout and login again first");
      else toast.error("Failed to update password");
    }
    setLoading(false);
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: 2, marginBottom: 32 }}>MY PROFILE</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 840 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 18 }}>👤 Account Info</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[["Full Name", userProfile?.name], ["Email", currentUser?.email], ["Phone", userProfile?.phone], ["Member Since", currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString("en-IN") : "—"]].map(([k, v]) => (
              <div key={k} style={{ background: "var(--gray2)", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "var(--gray3)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{k}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{v || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 18 }}>🔐 Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="label">New Password</label>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" className="input" />
            </div>
            <div className="form-group">
              <label className="label">Confirm Password</label>
              <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repeat new password" className="input" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
