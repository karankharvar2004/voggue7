import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dataManager } from "../dataManager";
import { useWishlist } from "./Home";
import { ProductCard } from "./Home";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const { wishlist, toggle, isWishlisted } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (wishlist.length === 0) { setLoading(false); return; }
      try {
        const prods = await dataManager.getProducts();
        const filtered = prods.filter(p => wishlist.includes(p.id));
        setProducts(filtered);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [wishlist.length]);

  if (wishlist.length === 0) return (
    <div className="flex-center" style={{ flexDirection: "column", minHeight: "70vh", gap: 16 }}>
      <Heart size={64} color="var(--neon2)" />
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32 }}>WISHLIST IS EMPTY</h2>
      <p style={{ color: "var(--gray3)" }}>Save products you love for later!</p>
      <Link to="/shop" className="btn btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: 2, marginBottom: 8 }}>MY WISHLIST ❤️</h1>
      <p style={{ color: "var(--gray3)", marginBottom: 32 }}>{wishlist.length} saved items</p>
      {loading ? (
        <div className="flex-center" style={{ height: 200 }}><div className="spinner" /></div>
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
  );
}
