-- ==============================================================================
-- KP Natural Dairy Farm - Official Database Schema
-- Production Ready Supabase Database
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(64) UNIQUE NOT NULL,
    
    -- Customer Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    
    -- Gujarat Delivery Destination
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    state VARCHAR(50) NOT NULL DEFAULT 'Gujarat',
    district_or_city VARCHAR(100) NOT NULL,
    village_or_area VARCHAR(150) NOT NULL,
    pin_code VARCHAR(10) NOT NULL,
    
    -- Financial Totals (Calculated Server-side)
    subtotal NUMERIC(12, 2) NOT NULL,
    delivery_charge NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    
    -- Order & Payment Lifecycle Statuses
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    order_status VARCHAR(50) NOT NULL DEFAULT 'AWAITING_PAYMENT',
    
    -- Real UPI Payment Submission Metadata
    payment_method VARCHAR(50) DEFAULT 'UPI',
    utr_number VARCHAR(100),
    payment_screenshot_url TEXT,
    payment_submitted_at TIMESTAMP WITH TIME ZONE,
    payment_review_requested_at TIMESTAMP WITH TIME ZONE,
    
    -- Admin Manual Payment Verification Fields
    payment_verified_at TIMESTAMP WITH TIME ZONE,
    payment_verified_by VARCHAR(255),
    payment_rejection_reason TEXT,
    payment_rejected_at TIMESTAMP WITH TIME ZONE,
    payment_rejected_by VARCHAR(255),
    
    -- Fulfillment Lifecycle Timestamps
    dispatched_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist for existing tables
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'UPI';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utr_number VARCHAR(100);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_review_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_verified_by VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_rejection_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_rejected_by VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 2. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(64) NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
    
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(100) NOT NULL DEFAULT 'VERMICOMPOST',
    package_size VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    
    unit_price NUMERIC(12, 2) NOT NULL,
    line_total NUMERIC(12, 2) NOT NULL,
    free_cocopeat_quantity INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INDEXES FOR HIGH-PERFORMANCE SEARCH & SORTING
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_mobile_number ON public.orders(mobile_number);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_utr_number ON public.orders(utr_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 4. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Service role has full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Service role has full access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public cannot update orders" ON public.orders;
DROP POLICY IF EXISTS "Public cannot delete orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all for server API and public on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all for server API and public on order_items" ON public.order_items;

-- Full CRUD policies for API routes (both service_role and anon/authenticated keys)
CREATE POLICY "Allow all for server API and public on orders"
ON public.orders
FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all for server API and public on order_items"
ON public.order_items
FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);
