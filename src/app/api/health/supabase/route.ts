import { NextResponse } from "next/server";
import { getServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const envStatus = {
    hasUrl: Boolean(supabaseUrl && !supabaseUrl.includes("your-project")),
    hasAnonKey: Boolean(supabaseAnonKey && !supabaseAnonKey.includes("your-supabase-anon-key")),
    hasServiceRoleKey: Boolean(supabaseServiceRoleKey && !supabaseServiceRoleKey.includes("your-supabase-service-role-key")),
  };

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      connected: false,
      status: "ENV_MISSING",
      message: "Supabase environment variables are not configured in .env.local",
      envStatus,
      instructions: [
        "Create .env.local in project root",
        "Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY",
        "Execute supabase/schema.sql in Supabase SQL Editor",
      ],
    });
  }

  const supabaseClient = getServerSupabaseClient();
  if (!supabaseClient) {
    return NextResponse.json({
      connected: false,
      status: "CLIENT_INIT_FAILED",
      message: "Failed to initialize Supabase client",
      envStatus,
    });
  }

  try {
    // Ping orders table
    const { data: ordersData, error: ordersError } = await supabaseClient
      .from("orders")
      .select("id")
      .limit(1);

    if (ordersError) {
      return NextResponse.json({
        connected: false,
        status: "TABLES_MISSING_OR_RLS_BLOCKED",
        message: ordersError.message,
        hint: "Please run supabase/schema.sql in your Supabase project SQL Editor.",
        envStatus,
      });
    }

    // Ping order_items table
    const { error: itemsError } = await supabaseClient
      .from("order_items")
      .select("id")
      .limit(1);

    if (itemsError) {
      return NextResponse.json({
        connected: false,
        status: "ORDER_ITEMS_TABLE_MISSING",
        message: itemsError.message,
        hint: "Please run supabase/schema.sql in your Supabase project SQL Editor.",
        envStatus,
      });
    }

    return NextResponse.json({
      connected: true,
      status: "READY",
      message: "Successfully connected to Supabase database with orders and order_items tables verified.",
      tables: ["orders", "order_items"],
      envStatus,
    });
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      status: "CONNECTION_FAILED",
      message: error.message || "Network error contacting Supabase",
      envStatus,
    });
  }
}
