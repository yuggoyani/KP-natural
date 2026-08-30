export type PaymentStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "SUBMITTED"
  | "PAYMENT_SUBMITTED"
  | "SUBMITTED_FOR_REVIEW"
  | "PAYMENT_VERIFICATION"
  | "VERIFIED"
  | "PAYMENT_VERIFIED"
  | "REJECTED"
  | "FAILED";

export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "PAYMENT_VERIFICATION"
  | "PAYMENT_VERIFIED"
  | "PROCESSING"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderRecord {
  id?: string;
  order_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  mobile_number: string;
  email: string;
  address_line_1: string;
  address_line_2?: string | null;
  state: string;
  district_or_city: string;
  village_or_area: string;
  pin_code: string;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  payment_method?: string | null;
  utr_number?: string | null;
  payment_screenshot_url?: string | null;
  payment_submitted_at?: string | null;
  payment_review_requested_at?: string | null;
  payment_verified_at?: string | null;
  payment_verified_by?: string | null;
  payment_rejection_reason?: string | null;
  payment_rejected_at?: string | null;
  payment_rejected_by?: string | null;
  dispatched_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItemRecord {
  id?: string;
  order_id: string;
  product_name: string;
  product_type: string;
  package_size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  free_cocopeat_quantity: number;
  created_at?: string;
}

export interface CreateOrderRequest {
  customerDetails: {
    firstName: string;
    middleName?: string;
    lastName: string;
    mobileNumber: string;
    email: string;
  };
  deliveryAddress: {
    addressLine1: string;
    addressLine2?: string;
    state: "Gujarat";
    districtOrCity: string;
    villageOrArea: string;
    pinCode: string;
  };
  cartItems: {
    packId: string;
    quantity: number;
  }[];
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  order?: OrderRecord;
  items?: OrderItemRecord[];
  error?: string;
  isDemoMode?: boolean;
}

export interface SubmitPaymentRequest {
  orderId: string;
  utrNumber: string;
  paymentMethod?: string;
  screenshotBase64?: string;
  screenshotFileName?: string;
}

export interface SubmitPaymentResponse {
  success: boolean;
  orderId?: string;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  utrNumber?: string;
  submittedAt?: string;
  error?: string;
  isDemoMode?: boolean;
}

export interface AdminVerifyPaymentRequest {
  adminEmail: string;
  adminNotes?: string;
}

export interface AdminRejectPaymentRequest {
  adminEmail: string;
  rejectionReason: string;
  adminNotes?: string;
}

export interface AdminUpdateOrderStatusRequest {
  adminEmail: string;
  orderStatus: OrderStatus;
  cancellationReason?: string;
  adminNotes?: string;
}

export interface AdminOrderStats {
  totalOrders: number;
  pendingPayment: number;
  paymentSubmitted: number;
  paymentVerified: number;
  processing: number;
  dispatched: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}
