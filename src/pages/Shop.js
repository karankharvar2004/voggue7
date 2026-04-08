import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { dataManager } from "../dataManager";
import { ProductCard } from "./Home";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("cat") || "All");
  const [activeSubcategory, setActiveSubcategory] = useState(searchParams.get("subcat") || "");
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [data, cats] = await Promise.all([
          dataManager.getProducts(),
          dataManager.getCategories()
        ]);
        setProducts(data);
        setFiltered(data);
        setCategories(cats);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const cat = searchParams.get("cat") || "All";
    const subcat = searchParams.get("subcat") || "";
    setActiveCategory(cat);
    setActiveSubcategory(subcat);
  }, [searchParams]);

  useEffect(() => {
    let result = [...products];
    if (activeCategory !== "All") {
      result = result.filter(p => 
        p.category === activeCategory || 
        (activeCategory === "Men" && p.category === "Mens") || 
        (activeCategory === "Women" && p.category === "Womens")
      );
    }
    if (activeSubcategory) result = result.filter(p => p.subcategory === activeSubcategory);
    if (search) result = result.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()));
    
    // Deduplicate by name and ignore duplicate entries matching identical descriptions/images
    // This solves the issue where an admin adds "Hottie" to Men and "Hottie" to Women as separate DB items
    if (activeCategory === "All" || search) {
      const unique = [];
      const seen = new Set();
      for (const p of result) {
        const n = (p.name || "").toLowerCase().trim();
        if (!seen.has(n)) {
          seen.add(n);
          unique.push(p);
        }
      }
      result = unique;
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sortBy === "price_low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "newest") result.sort((a, b) => (new Date(b.createdAt) - new Date(a.createdAt)));
    setFiltered(result);
  }, [products, activeCategory, activeSubcategory, search, sortBy, priceRange]);

  
  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: 2, marginBottom: 4 }}>ALL DROPS 🔥</h1>
        <p style={{ color: "var(--gray3)" }}>{filtered.length} styles available</p>
      </div>

      {/* Search + Sort */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tees..." className="input" style={{ paddingLeft: 40 }} />
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray3)" }} />
          {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--gray3)", cursor: "pointer" }}><X size={14} /></button>}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input" style={{ width: "auto", minWidth: 160 }}>
          <option value="newest">Newest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: activeCategory !== "All" && categories.find(c => c.name === activeCategory)?.subcategories?.length > 0 ? 16 : 32, flexWrap: "wrap" }}>
        <button onClick={() => { setActiveCategory("All"); setSearchParams({}); }} className={`tag ${activeCategory === "All" ? "active" : ""}`}>All</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => { setActiveCategory(cat.name); setSearchParams({ cat: cat.name }); }}
            className={`tag ${activeCategory === cat.name ? "active" : ""}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Subcategory tabs */}
      {(() => {
        if (activeCategory === "All") return null;
        const cat = categories.find(c => c.name === activeCategory);
        if (!cat || !cat.subcategories || cat.subcategories.length === 0) return null;
        return (
          <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap", padding: "12px 16px", background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid var(--border)" }}>
             <button onClick={() => setSearchParams({ cat: activeCategory })} className={`tag ${!activeSubcategory ? "active" : ""}`} style={{ fontSize: 13, padding: "5px 12px" }}>All {activeCategory}</button>
             {cat.subcategories.map(sub => (
               <button key={sub.id} onClick={() => setSearchParams({ cat: activeCategory, subcat: sub.name })} className={`tag ${activeSubcategory === sub.name ? "active" : ""}`} style={{ fontSize: 13, padding: "5px 12px" }}>
                 {sub.name}
               </button>
             ))}
          </div>
        )
      })()}

      {loading ? (
        <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--gray3)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😅</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No products found</div>
          <button onClick={() => { setSearch(""); setActiveCategory("All"); setSearchParams({}); }} className="btn btn-secondary" style={{ marginTop: 12 }}>Clear Filters</button>
        </div>
      ) : (
        <div className="grid-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} onClick={() => navigate(`/product/${p.id}`)} />)}
        </div>
      )}
    </div>
  );
}
