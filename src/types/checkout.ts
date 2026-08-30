import { CartItem } from "./product";

export interface CustomerDetails {
  firstName: string;
  middleName?: string;
  lastName: string;
  mobileNumber: string;
  email: string;
}

export interface DeliveryAddress {
  addressLine1: string;
  addressLine2?: string;
  state: "Gujarat";
  districtOrCity: string;
  villageOrArea: string;
  pinCode: string;
}

export interface CheckoutData {
  customerDetails: CustomerDetails;
  deliveryAddress: DeliveryAddress;
  cartItems: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  totalFreeCocopeat: number;
  createdAt: number;
}

export interface GujaratLocationOption {
  district: string;
  areas: {
    name: string;
    pinCode: string;
  }[];
}
