import { getServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { OrderRecord, OrderItemRecord } from "@/types/database";

/**
 * Pure Supabase Order Storage Layer
 * Single Source of Truth for Customer Checkout, Tracking, and Admin Panel
 * (No local filesystem or JSON files)
 */
export const orderStorage = {
  /**
   * Save a newly created order and its item list directly to Supabase
   * Throws an error if Supabase insertion fails.
   */
  async createOrder(order: OrderRecord, items: OrderItemRecord[]): Promise<boolean> {
    const supabase = getServerSupabaseClient();

    if (!supabase || !isSupabaseConfigured()) {
      throw new Error(
        "Supabase is not configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set in environment variables."
      );
    }

    // 1. Insert into public.orders
    const { error: orderError } = await supabase.from("orders").insert([order]);
    if (orderError) {
      console.error("Supabase createOrder (orders table) error:", orderError);
      throw new Error(`Failed to save order in database: ${orderError.message}`);
    }

    // 2. Insert into public.order_items
    if (items && items.length > 0) {
      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) {
        console.error("Supabase createOrder (order_items table) error:", itemsError);
        // Rollback inserted order if item insertion fails
        await supabase.from("orders").delete().eq("order_id", order.order_id);
        throw new Error(`Failed to save order items in database: ${itemsError.message}`);
      }
    }

    return true;
  },

  /**
   * Get all orders with filtering and sorting directly from Supabase
   */
  async getAllOrders(filters?: {
    paymentStatus?: string;
    orderStatus?: string;
    search?: string;
    sortBy?: string;
  }): Promise<OrderRecord[]> {
    const supabase = getServerSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) {
      console.error("Supabase not configured in getAllOrders");
      return [];
    }

    let query = supabase.from("orders").select("*");

    if (filters?.paymentStatus && filters.paymentStatus !== "ALL") {
      query = query.eq("payment_status", filters.paymentStatus);
    }
    if (filters?.orderStatus && filters.orderStatus !== "ALL") {
      query = query.eq("order_status", filters.orderStatus);
    }

    if (filters?.sortBy === "OLDEST") {
      query = query.order("created_at", { ascending: true });
    } else if (filters?.sortBy === "AMOUNT_HIGH") {
      query = query.order("total_amount", { ascending: false });
    } else if (filters?.sortBy === "AMOUNT_LOW") {
      query = query.order("total_amount", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getAllOrders error:", error);
      return [];
    }

    let orders: OrderRecord[] = data || [];

    // Apply search filter if present
    if (filters?.search) {
      const s = filters.search.toLowerCase().trim();
      orders = orders.filter((o) => {
        const orderIdMatch = o.order_id.toLowerCase().includes(s);
        const nameMatch = `${o.first_name} ${o.last_name}`.toLowerCase().includes(s);
        const mobileMatch = (o.mobile_number || "").includes(s);
        const utrMatch = (o.utr_number || "").toLowerCase().includes(s);
        const emailMatch = (o.email || "").toLowerCase().includes(s);
        const districtMatch = (o.district_or_city || "").toLowerCase().includes(s);

        return orderIdMatch || nameMatch || mobileMatch || utrMatch || emailMatch || districtMatch;
      });
    }

    return orders;
  },

  /**
   * Get single order and items by 5-digit order_id directly from Supabase
   */
  async getOrder(orderId: string): Promise<{ order: OrderRecord | null; items: OrderItemRecord[] }> {
    const cleanId = orderId.trim();
    const supabase = getServerSupabaseClient();

    if (!supabase || !isSupabaseConfigured()) {
      console.error("Supabase not configured in getOrder");
      return { order: null, items: [] };
    }

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", cleanId)
        .maybeSingle();

      if (orderError) {
        console.error(`Supabase getOrder(${cleanId}) error:`, orderError);
        return { order: null, items: [] };
      }

      if (!order) {
        return { order: null, items: [] };
      }

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", cleanId);

      if (itemsError) {
        console.error(`Supabase getOrder items error for ${cleanId}:`, itemsError);
      }

      return { order, items: items || [] };
    } catch (err) {
      console.error("Supabase getOrder exception:", err);
      return { order: null, items: [] };
    }
  },

  /**
   * Update order fields by order_id directly in Supabase
   */
  async updateOrder(orderId: string, updates: Partial<OrderRecord>): Promise<OrderRecord | null> {
    const cleanId = orderId.trim();
    const supabase = getServerSupabaseClient();

    if (!supabase || !isSupabaseConfigured()) {
      console.error("Supabase not configured in updateOrder");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("order_id", cleanId)
        .select()
        .maybeSingle();

      if (error) {
        console.error(`Supabase updateOrder(${cleanId}) error:`, error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Supabase updateOrder exception:", err);
      return null;
    }
  },

  /**
   * Customer tracking query: matches Order ID AND last 10 digits of mobile number directly from Supabase
   */
  async trackOrder(
    orderId: string,
    mobileNumber: string
  ): Promise<{ order: OrderRecord | null; items: OrderItemRecord[] }> {
    const cleanId = orderId.trim();
    const cleanMobile = mobileNumber.replace(/\D/g, "");
    const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;

    const { order, items } = await this.getOrder(cleanId);

    if (order) {
      const orderMobile = (order.mobile_number || "").replace(/\D/g, "");
      const orderLast10 = orderMobile.length >= 10 ? orderMobile.slice(-10) : orderMobile;

      if (orderLast10 === last10) {
        return { order, items };
      }
    }

    return { order: null, items: [] };
  },
};
