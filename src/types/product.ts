export interface VermicompostPack {
  id: string;
  name: string;
  weightKg: number;
  price: number;
  freeCocopeatKg: number;
  freeDelivery: boolean;
  badge?: string;
  isPopular?: boolean;
}

export interface CartItem {
  packId: string;
  packName: string;
  weightKg: number;
  price: number;
  freeCocopeatKg: number;
  freeDelivery: boolean;
  quantity: number;
  addedAt: number;
}
