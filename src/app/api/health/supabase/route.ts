import { NextResponse } from "next/server";
import { getServerSupabaseClient, isSupabaseConfigured, getSupabaseDiagnostics } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const diagnostics = getSupabaseDiagnostics();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      connected: false,
      status: "ENV_MISSING",
      message: "Supabase environment variables are missing or unconfigured.",
      diagnostics,
      instructions: [
        "In Vercel Project Settings -> Environment Variables, add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "Redeploy your project after setting environment variables",
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
      diagnostics,
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
        diagnostics,
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
        diagnostics,
      });
    }

    return NextResponse.json({
      connected: true,
      status: "READY",
      message: "Successfully connected to Supabase database with orders and order_items tables verified.",
      tables: ["orders", "order_items"],
      diagnostics,
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      status: "CONNECTION_ERROR",
      message: err.message || "Unknown error connecting to Supabase",
      diagnostics,
    });
  }
}
