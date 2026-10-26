import { ProductPack } from "@/types/product";

export interface ServerProductPack extends ProductPack {
  productName: string;
  productType: string;
}

/**
 * Authoritative Server-Side Product Catalog
 * The client browser is NEVER trusted to dictate pricing or delivery rules.
 */
export const SERVER_PRODUCT_CATALOG: Record<string, ServerProductPack> = {
  "vermicompost-1kg": {
    id: "vermicompost-1kg",
    name: "1 KG Pack",
    category: "VERMICOMPOST",
    productName: "KP Natural Vermicompost Fertiliser",
    productType: "VERMICOMPOST",
    weightKg: 1,
    originalPrice: 140,
    price: 105, // 25% Off (140 - 35 = 105)
    discountPercent: 25,
    freeCocopeatKg: 0,
    freeDelivery: false,
    badge: "25% OFF",
    image: "/images/vermicompost-label.png",
    description: "Ideal for small home gardens, potted plants, and balcony greens.",
  },
  "vermicompost-5kg": {
    id: "vermicompost-5kg",
    name: "5 KG Pack",
    category: "VERMICOMPOST",
    productName: "KP Natural Vermicompost Fertiliser",
    productType: "VERMICOMPOST",
    weightKg: 5,
    originalPrice: 260,
    price: 200, // ₹200
    freeCocopeatKg: 0,
    freeDelivery: false,
    badge: "Popular Value",
    image: "/images/vermicompost-label.png",
    description: "Great for medium home gardens, flower beds, and kitchen gardens.",
  },
  "vermicompost-10kg": {
    id: "vermicompost-10kg",
    name: "10 KG Pack",
    category: "VERMICOMPOST",
    productName: "KP Natural Vermicompost Fertiliser",
    productType: "VERMICOMPOST",
    weightKg: 10,
    originalPrice: 450,
    price: 350, // ₹350
    freeCocopeatKg: 0,
    freeDelivery: false,
    badge: "Most Popular",
    isPopular: true,
    image: "/images/vermicompost-label.png",
    description: "Complete seasonal nutrition for extensive garden care and landscaping.",
  },
  "vermicompost-30kg": {
    id: "vermicompost-30kg",
    name: "30 KG Pack",
    category: "VERMICOMPOST",
    productName: "KP Natural Vermicompost Fertiliser",
    productType: "VERMICOMPOST",
    weightKg: 30,
    originalPrice: 1200,
    price: 900, // ₹900
    freeCocopeatKg: 0,
    freeDelivery: false,
    badge: "Bulk Farm Pack",
    image: "/images/vermicompost-label.png",
    description: "Heavy-duty farm & agricultural pack for orchards and large plots.",
  },

  // NEW COCOPEAT CATEGORY PRODUCTS
  "cocopeat-1kg": {
    id: "cocopeat-1kg",
    name: "1 KG Pack",
    category: "COCOPEAT",
    productName: "KP Natural Organic Cocopeat",
    productType: "COCOPEAT",
    weightKg: 1,
    originalPrice: 100,
    price: 80, // ₹80 for 1 kg
    freeCocopeatKg: 0,
    freeDelivery: false,
    badge: "100% Organic",
    image: "/images/cocopeat-packaging.jpg",
    description: "Pure washed & buffered organic coco peat for exceptional moisture retention.",
  },
  "cocopeat-5kg": {
    id: "cocopeat-5kg",
    name: "5 KG Pack",
    category: "COCOPEAT",
    productName: "KP Natural Organic Cocopeat",
    productType: "COCOPEAT",
    weightKg: 5,
    originalPrice: 450,
    price: 380, // ₹380 for 5 kg value pack
    freeCocopeatKg: 0,
    freeDelivery: false,
    badge: "Best Value",
    isPopular: true,
    image: "/images/cocopeat-packaging.jpg",
    description: "Economical 5 KG pack for potting soil mixes, root aeration, and plant propagation.",
  },
};

/**
 * Single Source of Truth for Vermicompost packs
 */
export const VERMICOMPOST_PACKS: ProductPack[] = [
  SERVER_PRODUCT_CATALOG["vermicompost-1kg"],
  SERVER_PRODUCT_CATALOG["vermicompost-5kg"],
  SERVER_PRODUCT_CATALOG["vermicompost-10kg"],
  SERVER_PRODUCT_CATALOG["vermicompost-30kg"],
];

/**
 * Single Source of Truth for Cocopeat packs
 */
export const COCOPEAT_PACKS: ProductPack[] = [
  SERVER_PRODUCT_CATALOG["cocopeat-1kg"],
  SERVER_PRODUCT_CATALOG["cocopeat-5kg"],
];

/**
 * Backwards compatibility alias for Vermicompost packs
 */
export const PRODUCT_PACKS: ProductPack[] = VERMICOMPOST_PACKS;

/**
 * Check if the given district or city is Surat
 */
export function isSuratCity(districtOrCity?: string | null): boolean {
  if (!districtOrCity) return true; // Default to Surat if not selected yet
  return districtOrCity.trim().toLowerCase() === "surat";
}

/**
 * Delivery Charge Calculation Rule:
 * - In Surat: FREE DELIVERY (₹0)
 * - Outside Surat: ₹45 per 1 KG (totalWeightKg * 45)
 */
export function calculateDeliveryCharge(
  totalWeightKg: number,
  districtOrCity?: string | null
): number {
  if (totalWeightKg <= 0) return 0;
  if (isSuratCity(districtOrCity)) {
    return 0;
  }
  // ₹45 per 1 kg for destinations outside Surat
  return Math.round(totalWeightKg * 45);
}

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
    weightKg: number;
    image?: string;
  }[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  totalFreeCocopeat: number;
  totalWeightKg: number;
  isSurat: boolean;
}

/**
 * Server-side calculation of order pricing from validated product catalog
 * and customer delivery destination (Surat = Free, Outside Surat = ₹45/kg).
 */
export function calculateServerOrderPricing(
  cartItems: { packId: string; quantity: number }[],
  districtOrCity?: string | null
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
    const itemFreeCocopeat = (pack.freeCocopeatKg || 0) * qty;
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
      weightKg: pack.weightKg,
      image: pack.image,
    };
  });

  // Delivery charge: Surat = ₹0, Outside Surat = ₹45 per 1 KG
  const isSurat = isSuratCity(districtOrCity);
  const deliveryCharge = calculateDeliveryCharge(totalWeightKg, districtOrCity);
  const totalAmount = subtotal + deliveryCharge;

  return {
    items: calculatedItems,
    subtotal,
    deliveryCharge,
    totalAmount,
    totalFreeCocopeat,
    totalWeightKg,
    isSurat,
  };
}
