import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  // Synchronously initialize cart from localStorage so it's never empty if data exists.
  const [cart, setCart] = useState(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`cart_${currentUser.uid}`);
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // Keep cartLoading to avoid breaking changes in UI files that destructure it
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`cart_${currentUser.uid}`);
      setCart(saved ? JSON.parse(saved) : []);
    } else {
      setCart([]);
    }
  }, [currentUser]);

  // Helper to save and update state
  function updateCartAndSave(nextCart) {
    setCart(nextCart);
    if (currentUser) {
      localStorage.setItem(`cart_${currentUser.uid}`, JSON.stringify(nextCart));
    }
  }

  function addToCart(product, size, qty = 1) {
    const numQty = Number(qty);
    const key = `${product.id}_${size}`;
    const existing = cart.find((i) => i.key === key);
    let next;
    if (existing) {
      next = cart.map((i) => i.key === key ? { ...i, qty: Number(i.qty) + numQty } : i);
    } else {
      next = [...cart, { key, productId: product.id, name: product.name, price: Number(product.price), image: product.images?.[0] || "", size, qty: numQty, category: product.category }];
    }
    updateCartAndSave(next);
  }

  function removeFromCart(key) {
    const next = cart.filter((i) => i.key !== key);
    updateCartAndSave(next);
  }

  function updateQty(key, qty) {
    const numQty = Number(qty);
    if (numQty < 1) {
      removeFromCart(key);
      return;
    }
    const next = cart.map((i) => i.key === key ? { ...i, qty: numQty } : i);
    updateCartAndSave(next);
  }

  function clearCart() {
    updateCartAndSave([]);
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, cartLoading, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}
