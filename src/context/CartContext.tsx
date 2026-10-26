"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ProductPack, CartItem } from "@/types/product";
import { SERVER_PRODUCT_CATALOG, calculateDeliveryCharge, isSuratCity } from "@/lib/serverPricing";

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  deliveryCharge: number;
  finalPayable: number;
  totalFreeCocopeat: number;
  totalWeightKg: number;
  deliveryDistrict: string;
  isSurat: boolean;
  setDeliveryDistrict: (district: string) => void;
  isHydrated: boolean;
  addToCart: (pack: ProductPack, quantity: number) => void;
  updateQuantity: (packId: string, delta: number) => void;
  setExactQuantity: (packId: string, quantity: number) => void;
  removeItem: (packId: string) => void;
  clearCart: () => void;
  lastAdded: { pack: ProductPack; quantity: number } | null;
  clearLastAdded: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryDistrict, setDeliveryDistrictState] = useState<string>("Surat");
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastAdded, setLastAdded] = useState<{
    pack: ProductPack;
    quantity: number;
  } | null>(null);

  // Hydrate cart and destination from localStorage on mount safely and sync with authoritative catalog
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kp_cart");
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        const synced: CartItem[] = [];
        for (const item of parsed) {
          const pack = SERVER_PRODUCT_CATALOG[item.packId];
          if (pack) {
            synced.push({
              packId: item.packId,
              packName: pack.name,
              category: pack.category,
              weightKg: pack.weightKg,
              price: pack.price,
              originalPrice: pack.originalPrice,
              freeCocopeatKg: pack.freeCocopeatKg || 0,
              freeDelivery: pack.freeDelivery,
              image: pack.image,
              quantity: item.quantity,
              addedAt: item.addedAt || Date.now(),
            });
          }
        }
        setItems(synced);
      }

      const savedDistrict = localStorage.getItem("kp_delivery_district");
      if (savedDistrict) {
        setDeliveryDistrictState(savedDistrict);
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

  const setDeliveryDistrict = (district: string) => {
    setDeliveryDistrictState(district);
    try {
      localStorage.setItem("kp_delivery_district", district);
    } catch {
      // Ignore
    }
  };

  const addToCart = (pack: ProductPack, quantity: number) => {
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
          category: pack.category,
          weightKg: pack.weightKg,
          price: pack.price,
          originalPrice: pack.originalPrice,
          freeCocopeatKg: pack.freeCocopeatKg || 0,
          freeDelivery: pack.freeDelivery,
          image: pack.image,
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
    (acc, item) => acc + (item.freeCocopeatKg || 0) * item.quantity,
    0
  );
  const totalWeightKg = items.reduce(
    (acc, item) => acc + item.weightKg * item.quantity,
    0
  );

  // Delivery Calculation:
  // In Surat: FREE DELIVERY (₹0)
  // Outside Surat: ₹45 per 1 KG (totalWeightKg * 45)
  const isSurat = isSuratCity(deliveryDistrict);
  const deliveryCharge = calculateDeliveryCharge(totalWeightKg, deliveryDistrict);
  const finalPayable = totalAmount + deliveryCharge;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        deliveryCharge,
        finalPayable,
        totalFreeCocopeat,
        totalWeightKg,
        deliveryDistrict,
        isSurat,
        setDeliveryDistrict,
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
