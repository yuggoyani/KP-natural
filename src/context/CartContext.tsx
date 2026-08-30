"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { VermicompostPack, CartItem } from "@/types/product";

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  totalFreeCocopeat: number;
  totalWeightKg: number;
  isHydrated: boolean;
  addToCart: (pack: VermicompostPack, quantity: number) => void;
  updateQuantity: (packId: string, delta: number) => void;
  setExactQuantity: (packId: string, quantity: number) => void;
  removeItem: (packId: string) => void;
  clearCart: () => void;
  lastAdded: { pack: VermicompostPack; quantity: number } | null;
  clearLastAdded: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastAdded, setLastAdded] = useState<{
    pack: VermicompostPack;
    quantity: number;
  } | null>(null);

  // Hydrate cart from localStorage on mount safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kp_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore localstorage read error
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("kp_cart", JSON.stringify(items));
    } catch {
      // Ignore localstorage write error
    }
  }, [items, isHydrated]);

  const addToCart = (pack: VermicompostPack, quantity: number) => {
    if (quantity <= 0) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.packId === pack.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          packId: pack.id,
          packName: pack.name,
          weightKg: pack.weightKg,
          price: pack.price,
          freeCocopeatKg: pack.freeCocopeatKg,
          freeDelivery: pack.freeDelivery,
          quantity,
          addedAt: Date.now(),
        };
        return [...prev, newItem];
      }
    });

    setLastAdded({ pack, quantity });
  };

  const updateQuantity = (packId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.packId === packId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const setExactQuantity = (packId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(packId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.packId === packId ? { ...item, quantity } : item))
    );
  };

  const removeItem = (packId: string) => {
    setItems((prev) => prev.filter((item) => item.packId !== packId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const clearLastAdded = () => {
    setLastAdded(null);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalFreeCocopeat = items.reduce(
    (acc, item) => acc + item.freeCocopeatKg * item.quantity,
    0
  );
  const totalWeightKg = items.reduce(
    (acc, item) => acc + item.weightKg * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        totalFreeCocopeat,
        totalWeightKg,
        isHydrated,
        addToCart,
        updateQuantity,
        setExactQuantity,
        removeItem,
        clearCart,
        lastAdded,
        clearLastAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
