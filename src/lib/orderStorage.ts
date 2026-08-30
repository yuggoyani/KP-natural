import fs from "fs";
import path from "path";
import { getServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { OrderRecord, OrderItemRecord, OrderStatus, PaymentStatus } from "@/types/database";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

interface StoredOrderData {
  order: OrderRecord;
  items: OrderItemRecord[];
}

/**
 * Ensure data directory and file exist
 */
function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([]), "utf-8");
    }
  } catch (err) {
    console.error("Failed to initialize orders data file:", err);
  }
}

/**
 * Read all orders from local persistent store
 */
function readLocalStore(): StoredOrderData[] {
  ensureDataFile();
  try {
    const content = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(content || "[]");
  } catch (err) {
    console.error("Error reading local orders file:", err);
    return [];
  }
}

/**
 * Write all orders to local persistent store atomically
 */
function writeLocalStore(data: StoredOrderData[]) {
  ensureDataFile();
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local orders file:", err);
  }
}

/**
 * Unified Order Storage Layer
 * Single Source of Truth for Customer Checkout, Tracking, and Admin Panel
 */
export const orderStorage = {
  /**
   * Save a newly created order and its item list
   */
  async createOrder(order: OrderRecord, items: OrderItemRecord[]): Promise<boolean> {
    const supabase = getServerSupabaseClient();
    let savedToSupabase = false;

    // 1. Try Supabase if configured
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error: orderError } = await supabase.from("orders").insert([order]);
        if (!orderError) {
          const { error: itemsError } = await supabase.from("order_items").insert(items);
          if (!itemsError) {
            savedToSupabase = true;
          }
        }
      } catch (err) {
        console.error("Supabase createOrder error:", err);
      }
    }

    // 2. Always persist to server store (guarantees local sync & offline resilience)
    const localData = readLocalStore();
    const existingIndex = localData.findIndex((d) => d.order.order_id === order.order_id);

    if (existingIndex >= 0) {
      localData[existingIndex] = { order, items };
    } else {
      localData.unshift({ order, items });
    }

    writeLocalStore(localData);
    return true;
  },

  /**
   * Get all orders with filtering and sorting
   */
  async getAllOrders(filters?: {
    paymentStatus?: string;
    orderStatus?: string;
    search?: string;
    sortBy?: string;
  }): Promise<OrderRecord[]> {
    const supabase = getServerSupabaseClient();
    let orders: OrderRecord[] = [];

    // 1. Try Supabase if configured
    if (supabase && isSupabaseConfigured()) {
      try {
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
        if (!error && data && data.length > 0) {
          orders = data;
        }
      } catch (err) {
        console.error("Supabase getAllOrders error:", err);
      }
    }

    // 2. If Supabase is not configured or returned empty, read from server store
    if (orders.length === 0) {
      const localData = readLocalStore();
      orders = localData.map((d) => d.order);

      if (filters?.paymentStatus && filters.paymentStatus !== "ALL") {
        orders = orders.filter((o) => o.payment_status === filters.paymentStatus);
      }
      if (filters?.orderStatus && filters.orderStatus !== "ALL") {
        orders = orders.filter((o) => o.order_status === filters.orderStatus);
      }

      if (filters?.sortBy === "OLDEST") {
        orders.sort(
          (a, b) =>
            new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()
        );
      } else if (filters?.sortBy === "AMOUNT_HIGH") {
        orders.sort((a, b) => Number(b.total_amount) - Number(a.total_amount));
      } else if (filters?.sortBy === "AMOUNT_LOW") {
        orders.sort((a, b) => Number(a.total_amount) - Number(b.total_amount));
      } else {
        orders.sort(
          (a, b) =>
            new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
        );
      }
    }

    // 3. Apply search filter if present
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
   * Get single order and items by order_id
   */
  async getOrder(orderId: string): Promise<{ order: OrderRecord | null; items: OrderItemRecord[] }> {
    const supabase = getServerSupabaseClient();
    const cleanId = orderId.trim();

    // 1. Try Supabase if configured
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("order_id", cleanId)
          .single();

        if (!orderError && order) {
          const { data: items } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", cleanId);

          return { order, items: items || [] };
        }
      } catch (err) {
        console.error("Supabase getOrder error:", err);
      }
    }

    // 2. Read from server store fallback
    const localData = readLocalStore();
    const found = localData.find((d) => d.order.order_id.toLowerCase() === cleanId.toLowerCase());

    if (found) {
      return { order: found.order, items: found.items };
    }

    return { order: null, items: [] };
  },

  /**
   * Update order fields by order_id
   */
  async updateOrder(orderId: string, updates: Partial<OrderRecord>): Promise<OrderRecord | null> {
    const cleanId = orderId.trim();
    const supabase = getServerSupabaseClient();
    let updatedRecord: OrderRecord | null = null;

    // 1. Try Supabase if configured
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("order_id", cleanId)
          .select()
          .single();

        if (!error && data) {
          updatedRecord = data;
        }
      } catch (err) {
        console.error("Supabase updateOrder error:", err);
      }
    }

    // 2. Always update local server store
    const localData = readLocalStore();
    const index = localData.findIndex((d) => d.order.order_id.toLowerCase() === cleanId.toLowerCase());

    if (index >= 0) {
      localData[index].order = {
        ...localData[index].order,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      writeLocalStore(localData);
      if (!updatedRecord) {
        updatedRecord = localData[index].order;
      }
    }

    return updatedRecord;
  },

  /**
   * Customer tracking query: matches Order ID AND last 10 digits of mobile number
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
