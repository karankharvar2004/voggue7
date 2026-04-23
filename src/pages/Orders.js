import React, { useState, useEffect } from "react";
import { dataManager } from "../dataManager";
import { useAuth } from "../contexts/AuthContext";
import { RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"];
const STATUS_ICONS = { pending: "🛒", confirmed: "✅", shipped: "🚚", delivered: "📦" };
const STATUS_LABELS_STEP = { pending: "Placed", confirmed: "Confirmed", shipped: "Shipped", delivered: "Delivered" };

function getStatusColor(status) {
  const map = { pending:"#fbbf24", confirmed:"#60a5fa", shipped:"#a78bfa", delivered:"#4ade80", cancelled:"#f87171", return_requested:"#fb923c", returned:"#9ca3af" };
  return map[status] || "#888";
}

function getStatusLabel(status) {
  const map = { pending:"⏳ Order Placed", confirmed:"✅ Confirmed", shipped:"🚚 Shipped", delivered:"📦 Delivered", cancelled:"❌ Cancelled", return_requested:"↩️ Return Requested", returned:"✔️ Returned" };
  return map[status] || status;
}

// Return reason modal - no alerts!
function ReturnModal({ order, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [custom, setCustom] = useState("");
  const reasons = ["Wrong size received", "Product damaged/defective", "Wrong product delivered", "Quality not as expected", "Changed my mind", "Other"];

  function submit() {
    const finalReason = reason === "Other" ? custom : reason;
    if (!finalReason.trim()) { toast.error("Please select or enter a return reason!"); return; }
    onSubmit(finalReason);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontWeight:700, fontSize:18 }}>↩️ Request Return</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--gray3)", cursor:"pointer", fontSize:20 }}>×</button>
        </div>
        <div style={{ background:"rgba(251,146,60,0.08)", border:"1px solid rgba(251,146,60,0.25)", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13 }}>
          ⚠️ Returns are only accepted within <strong style={{color:"#fb923c"}}>7 days of delivery</strong>. Items must be unworn with original tags.
        </div>
        <div style={{ marginBottom:14 }}>
          <label className="label" style={{marginBottom:8}}>Select Return Reason *</label>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {reasons.map(r => (
              <button key={r} onClick={() => setReason(r)}
                style={{ padding:"10px 14px", borderRadius:10, cursor:"pointer", textAlign:"left", fontWeight:500, fontSize:14,
                  background: reason===r ? "rgba(212,255,0,0.1)" : "var(--gray2)",
                  border: `1.5px solid ${reason===r ? "var(--neon)" : "#333"}`,
                  color: reason===r ? "var(--neon)" : "var(--white)", transition:"all 0.2s" }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        {reason === "Other" && (
          <div className="form-group">
            <label className="label">Describe your reason *</label>
            <textarea value={custom} onChange={e => setCustom(e.target.value)} className="input" rows={3} placeholder="Please describe the issue..." />
          </div>
        )}
        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          <button onClick={submit} className="btn btn-primary" style={{ flex:1, justifyContent:"center" }}>Submit Return Request</button>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Cancel reason modal
function CancelModal({ order, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [custom, setCustom] = useState("");
  const reasons = ["Ordered by mistake", "Found a better price elsewhere", "Change of mind", "Delivery taking too long", "Other"];

  function submit() {
    const finalReason = reason === "Other" ? custom : reason;
    if (!finalReason.trim()) { toast.error("Please select or enter a cancellation reason!"); return; }
    onSubmit(finalReason);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontWeight:700, fontSize:18 }}>❌ Cancel Order</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--gray3)", cursor:"pointer", fontSize:20 }}>×</button>
        </div>
        <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13 }}>
          ⚠️ Are you sure you want to cancel? If you paid online, your refund will be processed within 5–7 business days.
        </div>
        <div style={{ marginBottom:14 }}>
          <label className="label" style={{marginBottom:8}}>Select Cancellation Reason *</label>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {reasons.map(r => (
              <button key={r} onClick={() => setReason(r)}
                style={{ padding:"10px 14px", borderRadius:10, cursor:"pointer", textAlign:"left", fontWeight:500, fontSize:14,
                  background: reason===r ? "rgba(248,113,113,0.1)" : "var(--gray2)",
                  border: `1.5px solid ${reason===r ? "#f87171" : "#333"}`,
                  color: reason===r ? "#f87171" : "var(--white)", transition:"all 0.2s" }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        {reason === "Other" && (
          <div className="form-group">
            <label className="label">Describe your reason *</label>
            <textarea value={custom} onChange={e => setCustom(e.target.value)} className="input" rows={3} placeholder="Please describe the reason..." />
          </div>
        )}
        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          <button onClick={submit} className="btn btn-danger" style={{ flex:1, justifyContent:"center" }}>Confirm Cancellation</button>
          <button onClick={onClose} className="btn btn-secondary">Keep Order</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [returnModal, setReturnModal] = useState(null); // order object
  const [cancelModal, setCancelModal] = useState(null); // order object

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const data = await dataManager.getOrders(currentUser.uid);
        data.sort((a, b) => {
          const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime() || 0;
          const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime() || 0;
          return tB - tA;
        });
        setOrders(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    })();
  }, [currentUser]);

  async function submitReturn(order, reason) {
    try {
      const updates = {
        status: "return_requested",
        returnReason: reason,
        returnRequestedAt: { seconds: Math.floor(Date.now()/1000) },
        updatedAt: new Date().toISOString(),
      };
      await dataManager.updateOrder(order.id, updates);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updates } : o));
      setReturnModal(null);
      toast.success("Return requested! Admin will review within 2–3 days. 📦");
    } catch (e) { toast.error("Failed to request return. Try again."); }
  }

  function canReturn(order) {
    if (order.status !== "delivered") return false;
    if (["return_requested","returned"].includes(order.status)) return false;
    const d = order.deliveredAt?.seconds ? new Date(order.deliveredAt.seconds*1000) : null;
    if (!d) return true;
    return (new Date()-d)/(1000*60*60*24) <= 7;
  }

  function canCancel(order) {
    return ["pending", "confirmed"].includes(order.status);
  }

  async function submitCancel(order, reason) {
    try {
      const updates = {
        status: "cancelled",
        cancelReason: reason,
        cancelledAt: { seconds: Math.floor(Date.now()/1000) },
        updatedAt: new Date().toISOString(),
      };
      await dataManager.updateOrder(order.id, updates);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updates } : o));
      setCancelModal(null);
      toast.success("Order cancelled successfully. ❌");
    } catch (e) { toast.error("Failed to cancel order. Try again."); }
  }

  function daysLeft(order) {
    const d = order.deliveredAt?.seconds ? new Date(order.deliveredAt.seconds*1000) : null;
    if (!d) return 7;
    return Math.max(0, Math.ceil(7-((new Date()-d)/(1000*60*60*24))));
  }

  if (loading) return <div className="flex-center" style={{height:"60vh",flexDirection:"column",gap:16}}><div className="spinner"/><div style={{color:"var(--gray3)",fontSize:14}}>Loading your orders...</div></div>;

  if (orders.length === 0) return (
    <div className="flex-center" style={{flexDirection:"column",minHeight:"70vh",gap:16}}>
      <div style={{fontSize:64}}>📦</div>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:32}}>NO ORDERS YET</h2>
      <p style={{color:"var(--gray3)"}}>Time to shop! Go get some drip.</p>
      <Link to="/shop" className="btn btn-primary">Shop Now</Link>
    </div>
  );

  return (
    <div className="container" style={{paddingTop:40,paddingBottom:60}}>
      {returnModal && <ReturnModal order={returnModal} onClose={() => setReturnModal(null)} onSubmit={(reason) => submitReturn(returnModal, reason)} />}
      {cancelModal && <CancelModal order={cancelModal} onClose={() => setCancelModal(null)} onSubmit={(reason) => submitCancel(cancelModal, reason)} />}

      <h1 style={{fontFamily:"var(--font-display)",fontSize:48,letterSpacing:2,marginBottom:8}}>MY ORDERS</h1>
      <p style={{color:"var(--gray3)",marginBottom:32}}>{orders.length} order{orders.length!==1?"s":""} total</p>

      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        {orders.map(order => {
          const stepIdx = STATUS_STEPS.indexOf(order.status);
          const isExpanded = expanded === order.id;
          const colour = getStatusColor(order.status);
          return (
            <div key={order.id} className="card" style={{padding:0,overflow:"hidden",border:`1px solid ${colour}30`}}>
              <div style={{height:4,background:colour}}/>
              <div style={{padding:"18px 20px"}}>
                {/* Top row */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:14}}>
                  <div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--gray3)",marginBottom:3}}>ORDER #{order.id.slice(0,8).toUpperCase()}</div>
                    <div style={{fontSize:13,color:"var(--gray3)"}}>{order.createdAt?.seconds ? new Date(order.createdAt.seconds*1000).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : ""}</div>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={{background:`${colour}18`,color:colour,border:`1.5px solid ${colour}50`,padding:"5px 12px",borderRadius:100,fontSize:12,fontWeight:800}}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className={`badge badge-${order.paymentMethod==="cod"?"gray":order.paymentStatus==="verified"?"green":"orange"}`}>
                      {order.paymentMethod==="cod"?"💵 COD":order.paymentStatus==="verified"?"✅ Paid":"⏳ Payment Pending"}
                    </span>
                  </div>
                </div>

                {/* Items preview + total */}
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14}}>
                  <div style={{display:"flex",gap:4}}>
                    {order.items?.slice(0,4).map((item,i) => (
                      <img key={i} src={item.image||"/tshirt1.jpg"} alt="" style={{width:48,height:58,borderRadius:8,objectFit:"cover",border:"1px solid var(--border)"}} onError={e=>e.target.src="/tshirt1.jpg"}/>
                    ))}
                    {order.items?.length>4 && <div style={{width:48,height:58,borderRadius:8,background:"var(--gray2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"var(--gray3)",fontWeight:700}}>+{order.items.length-4}</div>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:"var(--gray3)"}}>{order.items?.length} item{order.items?.length!==1?"s":""}</div>
                    <div style={{fontFamily:"var(--font-display)",fontSize:22,color:"var(--neon)",lineHeight:1.2}}>₹{order.total}</div>
                  </div>
                  {order.estimatedDelivery && !["delivered","cancelled","returned"].includes(order.status) && (
                    <div style={{background:"rgba(212,255,0,0.08)",border:"1px solid rgba(212,255,0,0.25)",borderRadius:10,padding:"8px 14px",textAlign:"center",flexShrink:0}}>
                      <div style={{fontSize:10,color:"var(--gray3)",fontWeight:600,textTransform:"uppercase",letterSpacing:0.5}}>Est. Delivery</div>
                      <div style={{color:"var(--neon)",fontWeight:800,fontSize:13,marginTop:2}}>{order.estimatedDelivery}</div>
                    </div>
                  )}
                </div>

                {/* Tracking bar */}
                {!["cancelled","return_requested","returned"].includes(order.status) && (
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11,color:"var(--gray3)",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Order Tracking</div>
                    <div style={{display:"flex",alignItems:"flex-start"}}>
                      {STATUS_STEPS.map((step,i) => {
                        const done = i<=stepIdx; const active = i===stepIdx;
                        return (
                          <React.Fragment key={step}>
                            <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:64}}>
                              <div style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:done?16:13,background:done?colour:"var(--gray2)",border:active?`3px solid ${colour}`:done?`2px solid ${colour}`:"2px solid #333",boxShadow:active?`0 0 12px ${colour}60`:"none",transition:"all 0.4s",color:done?"var(--black)":"#555",fontWeight:800,flexShrink:0}}>
                                {done ? STATUS_ICONS[step] : <span style={{fontSize:11}}>{i+1}</span>}
                              </div>
                              <div style={{fontSize:10,marginTop:5,color:done?colour:"var(--gray3)",fontWeight:done?800:400,textAlign:"center",whiteSpace:"nowrap"}}>{STATUS_LABELS_STEP[step]}</div>
                            </div>
                            {i<STATUS_STEPS.length-1 && <div style={{flex:1,height:3,borderRadius:2,background:i<stepIdx?colour:"var(--gray2)",margin:"16px 4px 0",transition:"background 0.5s"}}/>}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status messages */}
                {order.status==="cancelled" && <div style={{background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:13}}>❌ <strong style={{color:"#f87171"}}>Order Cancelled</strong> {order.cancelReason && ` — Reason: ${order.cancelReason}`} <br/><span style={{marginTop: 4, display: "inline-block", color: "var(--gray3)"}}>If paid online, refund in 5–7 days.</span></div>}
                {order.status==="return_requested" && (
                  <div style={{background:"rgba(251,146,60,0.06)",border:"1px solid rgba(251,146,60,0.3)",borderRadius:12,padding:"14px 16px",marginBottom:12}}>
                    <div style={{fontSize:14,fontWeight:800,color:"#fb923c",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                      ↩️ Return Requested
                      <span style={{fontSize:11,background:"rgba(251,146,60,0.15)",padding:"2px 8px",borderRadius:100,fontWeight:600}}>Under Review</span>
                    </div>
                    {order.returnReason && (
                      <div style={{background:"var(--gray2)",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:13}}>
                        <div style={{fontSize:10,color:"var(--gray3)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>Return Reason</div>
                        <div style={{fontWeight:600}}>{order.returnReason}</div>
                      </div>
                    )}
                    {order.returnPickupDate ? (
                      <div style={{background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.25)",borderRadius:10,padding:"12px 14px"}}>
                        <div style={{fontSize:12,color:"#4ade80",fontWeight:800,marginBottom:8}}>✅ Pickup Scheduled by Admin</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                          <div style={{background:"var(--gray2)",borderRadius:8,padding:"8px 12px"}}>
                            <div style={{fontSize:10,color:"var(--gray3)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>Pickup Date</div>
                            <div style={{fontSize:14,fontWeight:700,color:"var(--neon)"}}>📅 {order.returnPickupDate}</div>
                          </div>
                          {order.returnPickupInfo && (
                            <div style={{background:"var(--gray2)",borderRadius:8,padding:"8px 12px"}}>
                              <div style={{fontSize:10,color:"var(--gray3)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>Pickup Agent / Info</div>
                              <div style={{fontSize:13,fontWeight:600}}>🚚 {order.returnPickupInfo}</div>
                            </div>
                          )}
                        </div>
                        {order.adminReturnNote && (
                          <div style={{marginTop:10,background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.2)",borderRadius:8,padding:"8px 12px",fontSize:13}}>
                            <div style={{fontSize:10,color:"var(--orange)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>📌 Note from Voggue7</div>
                            <div style={{color:"var(--white)"}}>{order.adminReturnNote}</div>
                          </div>
                        )}
                        <div style={{fontSize:11,color:"var(--gray3)",marginTop:8}}>Please keep your product packed and ready on the pickup date. Our agent will collect it from your delivery address.</div>
                      </div>
                    ) : (
                      <div style={{fontSize:12,color:"var(--gray3)",padding:"8px 12px",background:"var(--gray2)",borderRadius:8}}>
                        ⏳ Admin is reviewing your return request. Pickup details will appear here within 1–2 days.
                      </div>
                    )}
                  </div>
                )}
                {order.status==="returned" && (
                  <div style={{background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:12,padding:"14px 16px",marginBottom:12}}>
                    <div style={{fontSize:14,fontWeight:800,color:"#4ade80",marginBottom:10}}>✔️ Return Completed — Thank You!</div>
                    {order.returnReason && (
                      <div style={{fontSize:13,color:"var(--gray3)",marginBottom:8}}>Reason: <strong style={{color:"var(--white)"}}>{order.returnReason}</strong></div>
                    )}
                    {order.returnPickupDate && (
                      <div style={{fontSize:13,color:"var(--gray3)",marginBottom:6}}>📅 Pickup was scheduled: <strong style={{color:"var(--neon)"}}>{order.returnPickupDate}</strong></div>
                    )}
                    {order.returnPickupInfo && (
                      <div style={{fontSize:13,color:"var(--gray3)",marginBottom:8}}>🚚 Picked up by: <strong style={{color:"var(--white)"}}>{order.returnPickupInfo}</strong></div>
                    )}
                    <div style={{background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:8,padding:"10px 14px",fontSize:13}}>
                      💰 <strong style={{color:"#4ade80"}}>Refund Processing</strong>
                      <div style={{color:"var(--gray3)",marginTop:4,fontSize:12}}>Your refund will be credited within 5–7 business days to your original payment method. For COD orders, refund will be via UPI/bank transfer.</div>
                    </div>
                  </div>
                )}

                {/* Tracking ID */}
                {order.trackingId && <div style={{background:"rgba(212,255,0,0.06)",border:"1px solid rgba(212,255,0,0.2)",borderRadius:8,padding:"8px 14px",marginBottom:12,fontSize:13,display:"flex",alignItems:"center",gap:10}}>
                  <span>🚚</span><span style={{color:"var(--gray3)"}}>Tracking ID:</span><span style={{fontFamily:"var(--font-mono)",color:"var(--neon)",fontWeight:700}}>{order.trackingId}</span>
                </div>}

                {/* Delivered + return */}
                {order.status==="delivered" && (
                  <div style={{background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"#4ade80",marginBottom:2}}>📦 Delivered!</div>
                        {canReturn(order) ? (
                          <div style={{fontSize:12,color:"var(--gray3)"}}>Return window: <strong style={{color:"#4ade80"}}>{daysLeft(order)} day{daysLeft(order)!==1?"s":""} left</strong></div>
                        ) : (
                          <div style={{fontSize:12,color:"#f87171"}}>Return window expired</div>
                        )}
                      </div>
                      {canReturn(order) && (
                        <button onClick={() => setReturnModal(order)} className="btn btn-secondary" style={{padding:"7px 14px",fontSize:12}}>
                          <RotateCcw size={12}/> Request Return
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:10,borderTop:"1px solid var(--border)", justifyContent: "space-between"}}>
                  <button onClick={() => setExpanded(isExpanded?null:order.id)} style={{background:"none",border:"none",color:"var(--gray3)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:4}}>
                    {isExpanded?<ChevronUp size={14}/>:<ChevronDown size={14}/>} {isExpanded?"Hide Details":"View Full Details"}
                  </button>
                  {canCancel(order) && (
                    <button onClick={() => setCancelModal(order)} className="btn btn-ghost" style={{padding:"6px 14px",fontSize:12, color: "#f87171", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8}}>
                      ✖ Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div style={{background:"rgba(0,0,0,0.25)",borderTop:"1px solid var(--border)",padding:"16px 20px"}}>
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:11,color:"var(--gray3)",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Items Ordered</div>
                    {order.items?.map(item => (
                      <div key={item.key} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,background:"var(--gray2)",borderRadius:10,padding:"10px 12px"}}>
                        <img src={item.image||"/tshirt1.jpg"} alt={item.name} style={{width:52,height:62,borderRadius:8,objectFit:"cover",flexShrink:0}} onError={e=>e.target.src="/tshirt1.jpg"}/>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:14}}>{item.name}</div>
                          <div style={{fontSize:12,color:"var(--gray3)"}}>Size: {item.size} · Qty: {item.qty}</div>
                        </div>
                        <div style={{fontFamily:"var(--font-display)",fontSize:18,color:"var(--neon)"}}>₹{item.price*item.qty}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                    <div style={{background:"var(--gray2)",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:11,color:"var(--gray3)",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Delivery Address</div>
                      <div style={{fontSize:13,lineHeight:1.8}}>
                        <div style={{fontWeight:700}}>{order.shippingAddress?.name}</div>
                        <div style={{color:"var(--gray3)"}}>{order.shippingAddress?.address}</div>
                        <div style={{color:"var(--gray3)"}}>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</div>
                        <div style={{color:"var(--gray3)"}}>📱 {order.shippingAddress?.phone}</div>
                      </div>
                    </div>
                    <div style={{background:"var(--gray2)",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:11,color:"var(--gray3)",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Payment Summary</div>
                      <div style={{fontSize:13}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"var(--gray3)"}}>Subtotal</span><span>₹{order.subtotal||order.total}</span></div>
                        {order.coupon && <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,color:"var(--neon)"}}><span>Coupon ({order.coupon})</span><span>-₹{order.discountAmount}</span></div>}
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"var(--gray3)"}}>Shipping</span><span style={{color:order.shipping===0?"#4ade80":"var(--white)"}}>{order.shipping===0?"FREE":`₹${order.shipping}`}</span></div>
                        <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,borderTop:"1px solid var(--border)",paddingTop:6}}><span>Total</span><span style={{color:"var(--neon)"}}>₹{order.total}</span></div>
                        <div style={{marginTop:8,fontSize:12,color:"var(--gray3)"}}>Method: <strong style={{color:"var(--white)"}}>{order.paymentMethod==="cod"?"Cash on Delivery":"UPI/Online"}</strong></div>
                        {order.paymentMethod==="online" && <div style={{fontSize:12,color:"var(--gray3)",marginTop:2}}>UTR: <span style={{fontFamily:"var(--font-mono)",color:"var(--neon)"}}>{order.utrNumber}</span></div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
