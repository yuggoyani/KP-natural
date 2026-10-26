export type ProductCategory = "VERMICOMPOST" | "COCOPEAT";

export interface VermicompostPack {
  id: string;
  name: string;
  category?: ProductCategory;
  productName?: string;
  productType?: string;
  weightKg: number;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  freeCocopeatKg: number;
  freeDelivery: boolean;
  badge?: string;
  isPopular?: boolean;
  image?: string;
  description?: string;
}

export type ProductPack = VermicompostPack;

export interface CartItem {
  packId: string;
  packName: string;
  category?: ProductCategory;
  weightKg: number;
  price: number;
  originalPrice?: number;
  freeCocopeatKg: number;
  freeDelivery: boolean;
  quantity: number;
  addedAt: number;
  image?: string;
}
