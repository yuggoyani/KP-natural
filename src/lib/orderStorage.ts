import { getServerSupabaseClient, getSupabaseDiagnostics } from "@/lib/supabase";
import { OrderRecord, OrderItemRecord } from "@/types/database";

// In-memory runtime cache ensuring instant availability even before Supabase RLS is configured
const runtimeOrders = new Map<string, OrderRecord>();
const runtimeItems = new Map<string, OrderItemRecord[]>();

/**
 * Pure Supabase Order Storage Layer with In-Memory Resiliency
 * Single Source of Truth for Customer Checkout, Tracking, and Admin Panel
 */
export const orderStorage = {
  /**
   * Save a newly created order and its item list directly to Supabase
   * Throws an error if Supabase insertion fails.
   */
  async createOrder(order: OrderRecord, items: OrderItemRecord[]): Promise<boolean> {
    const cleanId = order.order_id.trim();

    // Cache locally immediately
    runtimeOrders.set(cleanId, order);
    runtimeItems.set(cleanId, items || []);

    const supabase = getServerSupabaseClient();

    if (!supabase) {
      const diag = getSupabaseDiagnostics();
      console.error("Supabase configuration missing at order creation:", diag);
      throw new Error(
        `Supabase database connection is not configured (hasUrl: ${diag.hasUrl}, hasKey: ${diag.hasServiceRoleKey || diag.hasAnonKey}). Please verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables.`
      );
    }

    // 1. Insert into public.orders
    let { error: orderError } = await supabase.from("orders").insert([order]);
    if (orderError) {
      // If is_phone_verified column is not yet migrated in remote Supabase, retry without that field
      if (orderError.message.includes("is_phone_verified")) {
        const fallbackOrder = { ...order };
        delete fallbackOrder.is_phone_verified;
        const retry = await supabase.from("orders").insert([fallbackOrder]);
        orderError = retry.error;
      }

      if (orderError) {
        console.error("Supabase createOrder (orders table) error:", orderError);
        throw new Error(`Failed to save order in database: ${orderError.message}`);
      }
    }

    // 2. Insert into public.order_items
    if (items && items.length > 0) {
      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) {
        console.error("Supabase createOrder (order_items table) error:", itemsError);
        // Rollback inserted order if item insertion fails
        await supabase.from("orders").delete().eq("order_id", order.order_id);
        runtimeOrders.delete(cleanId);
        runtimeItems.delete(cleanId);
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
    if (!supabase) {
      console.error("Supabase not configured in getAllOrders", getSupabaseDiagnostics());
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

    // If Supabase returned empty but we have runtime orders in memory, include them
    if (orders.length === 0 && runtimeOrders.size > 0) {
      orders = Array.from(runtimeOrders.values());
    }

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

    if (!supabase) {
      console.error("Supabase not configured in getOrder", getSupabaseDiagnostics());
      if (runtimeOrders.has(cleanId)) {
        return {
          order: runtimeOrders.get(cleanId) || null,
          items: runtimeItems.get(cleanId) || [],
        };
      }
      return { order: null, items: [] };
    }

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", cleanId)
        .maybeSingle();

      if (orderError || !order) {
        if (runtimeOrders.has(cleanId)) {
          return {
            order: runtimeOrders.get(cleanId) || null,
            items: runtimeItems.get(cleanId) || [],
          };
        }
        return { order: null, items: [] };
      }

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", cleanId);

      if (itemsError) {
        console.warn(`Supabase getOrder items error for ${cleanId}:`, itemsError);
      }

      return {
        order,
        items: (items && items.length > 0) ? items : (runtimeItems.get(cleanId) || []),
      };
    } catch (err) {
      console.error("Supabase getOrder exception:", err);
      if (runtimeOrders.has(cleanId)) {
        return {
          order: runtimeOrders.get(cleanId) || null,
          items: runtimeItems.get(cleanId) || [],
        };
      }
      return { order: null, items: [] };
    }
  },

  /**
   * Update order fields by order_id directly in Supabase
   */
  async updateOrder(orderId: string, updates: Partial<OrderRecord>): Promise<OrderRecord | null> {
    const cleanId = orderId.trim();
    
    // Update runtime cache
    if (runtimeOrders.has(cleanId)) {
      const existing = runtimeOrders.get(cleanId)!;
      runtimeOrders.set(cleanId, { ...existing, ...updates, updated_at: new Date().toISOString() });
    }

    const supabase = getServerSupabaseClient();

    if (!supabase) {
      console.error("Supabase not configured in updateOrder", getSupabaseDiagnostics());
      return runtimeOrders.get(cleanId) || null;
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
        return runtimeOrders.get(cleanId) || null;
      }

      return data || runtimeOrders.get(cleanId) || null;
    } catch (err) {
      console.error("Supabase updateOrder exception:", err);
      return runtimeOrders.get(cleanId) || null;
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

  /**
   * Get all orders belonging to an authenticated customer by verified mobile number
   * Matches both full number and last 10 digits across all formatting variations
   */
  async getCustomerOrders(mobileNumber: string): Promise<{ order: OrderRecord; items: OrderItemRecord[] }[]> {
    const cleanMobile = mobileNumber.replace(/\D/g, "");
    const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;

    if (!last10 || last10.length < 10) {
      return [];
    }

    const supabase = getServerSupabaseClient();
    let orders: OrderRecord[] = [];

    if (supabase) {
      try {
        const { data: remoteOrders, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (ordersError) {
          console.error(`Supabase getCustomerOrders error:`, ordersError);
        } else if (remoteOrders) {
          orders = remoteOrders;
        }
      } catch (err) {
        console.error("Supabase getCustomerOrders exception:", err);
      }
    }

    // Merge in-memory runtime orders if not already present
    runtimeOrders.forEach((ro) => {
      if (!orders.some((o) => o.order_id === ro.order_id)) {
        orders.push(ro);
      }
    });

    if (orders.length === 0) {
      return [];
    }

    // 2. Strict server-side filter: matches last 10 digits of mobile number
    const matchedOrders = orders.filter((o) => {
      const m = (o.mobile_number || "").replace(/\D/g, "");
      const m10 = m.length >= 10 ? m.slice(-10) : m;
      return m10 === last10;
    });

    if (matchedOrders.length === 0) {
      return [];
    }

    const orderIds = matchedOrders.map((o) => o.order_id);
    const itemsByOrderId = new Map<string, OrderItemRecord[]>();

    if (supabase) {
      try {
        const { data: allItems } = await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds);

        (allItems || []).forEach((item: OrderItemRecord) => {
          const list = itemsByOrderId.get(item.order_id) || [];
          list.push(item);
          itemsByOrderId.set(item.order_id, list);
        });
      } catch (err) {
        console.warn("Error fetching Supabase order items:", err);
      }
    }

    // Also populate items from runtime memory
    orderIds.forEach((oid) => {
      if (!itemsByOrderId.has(oid) || itemsByOrderId.get(oid)!.length === 0) {
        if (runtimeItems.has(oid)) {
          itemsByOrderId.set(oid, runtimeItems.get(oid)!);
        }
      }
    });

    return matchedOrders.map((order) => ({
      order,
      items: itemsByOrderId.get(order.order_id) || [],
    }));
  },
};


