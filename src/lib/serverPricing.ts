export interface ServerProductPack {
  id: string;
  name: string;
  productName: string;
  productType: string;
  weightKg: number;
  price: number;
  freeCocopeatKg: number;
  freeDelivery: boolean;
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
  },
  "vermicompost-5kg": {
    id: "vermicompost-5kg",
    name: "5 KG Pack",
    productName: "KP Natural Vermicompost Fertiliser",
    productType: "VERMICOMPOST",
    weightKg: 5,
    price: 700,
    freeCocopeatKg: 1,
    freeDelivery: true,
  },
  "vermicompost-10kg": {
    id: "vermicompost-10kg",
    name: "10 KG Pack",
    productName: "KP Natural Vermicompost Fertiliser",
    productType: "VERMICOMPOST",
    weightKg: 10,
    price: 1400,
    freeCocopeatKg: 2,
    freeDelivery: true,
  },
  "vermicompost-30kg": {
    id: "vermicompost-30kg",
    name: "30 KG Pack",
    productName: "KP Natural Vermicompost Fertiliser",
    productType: "VERMICOMPOST",
    weightKg: 30,
    price: 4200,
    freeCocopeatKg: 6,
    freeDelivery: true,
  },
};

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

  const deliveryCharge = 0; // Current farm promotion: 100% free delivery across Gujarat
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
