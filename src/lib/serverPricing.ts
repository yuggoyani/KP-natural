import { VermicompostPack } from "@/types/product";

export interface ServerProductPack extends VermicompostPack {
  productName: string;
  productType: string;
}

/**
 * Authoritative Server-Side Product Catalog
 * The client browser is NEVER trusted to dictate pricing or free bonuses.
 */
export const SERVER_PRODUCT_CATALOG: Record<string, ServerProductPack> = {
  "vermicompost-1kg": {
    id: "vermicompost-1kg",
    name: "1 KG Pack",
    productName: "KP Natural Vermicompost Fertiliser",
    productType: "VERMICOMPOST",
    weightKg: 1,
    price: 140,
    freeCocopeatKg: 0,
    freeDelivery: false,
    badge: "Standard Pack",
  },
  "vermicompost-5kg": {
    id: "vermicompost-5kg",
    name: "5 KG Pack",
    productName: "KP Natural Vermicompost Fertiliser",
    productType: "VERMICOMPOST",
    weightKg: 5,
    price: 649,
    freeCocopeatKg: 1,
    freeDelivery: true,
    badge: "+ 1 KG Cocopeat FREE",
  },
  "vermicompost-10kg": {
    id: "vermicompost-10kg",
    name: "10 KG Pack",
    productName: "KP Natural Vermicompost Fertiliser",
    productType: "VERMICOMPOST",
    weightKg: 10,
    price: 1199,
    freeCocopeatKg: 2,
    freeDelivery: true,
    badge: "+ 2 KG Cocopeat FREE",
    isPopular: true,
  },
  "vermicompost-30kg": {
    id: "vermicompost-30kg",
    name: "30 KG Pack",
    productName: "KP Natural Vermicompost Fertiliser",
    productType: "VERMICOMPOST",
    weightKg: 30,
    price: 2199,
    freeCocopeatKg: 6,
    freeDelivery: true,
    badge: "+ 6 KG Cocopeat FREE",
  },
};

/**
 * Single Source of Truth for frontend pack offerings
 */
export const PRODUCT_PACKS: VermicompostPack[] = [
  SERVER_PRODUCT_CATALOG["vermicompost-1kg"],
  SERVER_PRODUCT_CATALOG["vermicompost-5kg"],
  SERVER_PRODUCT_CATALOG["vermicompost-10kg"],
  SERVER_PRODUCT_CATALOG["vermicompost-30kg"],
];

export interface CalculatedOrderPricing {
  items: {
    packId: string;
    productName: string;
    productType: string;
    packageSize: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    freeCocopeatQuantity: number;
  }[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  totalFreeCocopeat: number;
  totalWeightKg: number;
}

/**
 * Server-side calculation of order pricing from validated product catalog
 */
export function calculateServerOrderPricing(
  cartItems: { packId: string; quantity: number }[]
): CalculatedOrderPricing {
  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  let subtotal = 0;
  let totalFreeCocopeat = 0;
  let totalWeightKg = 0;

  const calculatedItems = cartItems.map((item) => {
    const pack = SERVER_PRODUCT_CATALOG[item.packId];
    if (!pack) {
      throw new Error(`Invalid product pack ID: ${item.packId}`);
    }

    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const lineTotal = pack.price * qty;
    const itemFreeCocopeat = pack.freeCocopeatKg * qty;
    const itemWeight = pack.weightKg * qty;

    subtotal += lineTotal;
    totalFreeCocopeat += itemFreeCocopeat;
    totalWeightKg += itemWeight;

    return {
      packId: pack.id,
      productName: pack.productName,
      productType: pack.productType,
      packageSize: `${pack.weightKg} KG`,
      quantity: qty,
      unitPrice: pack.price,
      lineTotal,
      freeCocopeatQuantity: itemFreeCocopeat,
    };
  });

  // Delivery Charge Rule: ₹60 only for 1 KG package orders; free delivery for 5 KG, 10 KG, and 30 KG orders
  const hasOnlyOneKg = calculatedItems.every((item) => item.packId === "vermicompost-1kg");
  const deliveryCharge = hasOnlyOneKg ? 60 : 0;
  const totalAmount = subtotal + deliveryCharge;

  return {
    items: calculatedItems,
    subtotal,
    deliveryCharge,
    totalAmount,
    totalFreeCocopeat,
    totalWeightKg,
  };
}
