# KP Natural Dairy Farm — Supabase Database Setup & Verification Guide

This guide walks you through connecting your **KP Natural Dairy Farm** website to a real Supabase project and verifying order persistence.

---

## 1. Environment Variables Configuration

Create a file named `.env.local` in the project root:

```env
# 1. Project URL (Found under Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# 2. Public Anon Key (Found under Project Settings -> API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Privileged Service Role Key (Found under Project Settings -> API)
# IMPORTANT: Never prefix with NEXT_PUBLIC_. Strictly used on the server.
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!WARNING]
> **Security Notice**:
> - `SUPABASE_SERVICE_ROLE_KEY` is strictly used in server-side API routes (`/api/orders/create`) to bypass Row Level Security safely.
> - Never expose the service role key in client components or browser bundles.
> - Ensure `.env.local` is listed in `.gitignore` (already configured).

---

## 2. Database Schema Execution

1. Open your **Supabase Dashboard** $\longrightarrow$ Navigate to the **SQL Editor**.
2. Click **New query**.
3. Copy the entire contents of [`supabase/schema.sql`](file:///Users/yug/KP%20Natural%20Dairy%20Farm/supabase/schema.sql) and paste it into the editor.
4. Click **Run** (or press `Cmd + Enter`).

### What this creates:
- **`orders` table**: Stores customer contact, verified Gujarat delivery destination, financial totals, `payment_status = 'PENDING'`, and `order_status = 'AWAITING_PAYMENT'`.
- **`order_items` table**: Stores itemized product lines (`product_name`, `package_size`, `quantity`, `unit_price`, `line_total`, `free_cocopeat_quantity`).
- **Foreign Key Constraint**: Links `order_items.order_id` $\longrightarrow$ `orders.order_id` with `ON DELETE CASCADE`.
- **Indexes**: Fast lookups by `order_id`, `mobile_number`, `email`, `payment_status`, `order_status`, `created_at`.
- **Row Level Security (RLS)**: Enforces server-controlled order creation while preventing public unauthorized modification of order or payment statuses.

---

## 3. Database Connection Verification

### Automated Connection Health Check:
Open your browser or run:
```bash
curl http://localhost:3000/api/health/supabase
```

- **When Connected**: Returns `{"connected": true, "status": "READY", "tables": ["orders", "order_items"]}`.
- **When Missing Env**: Returns `{"connected": false, "status": "ENV_MISSING", ...}` with exact instructions.

---

## 4. End-to-End Test Checkout Flow

1. Navigate to `http://localhost:3000/`.
2. Select any Vermicompost pack (e.g. 10 KG or 30 KG) $\longrightarrow$ Click **Add to Cart**.
3. Go to `/cart` $\longrightarrow$ Click **Proceed to Checkout**.
4. Fill in customer details and select your Gujarat District, Area, and 6-digit PIN code.
5. Click **Continue to Payment**.
6. The system executes server-side price calculations, generates a unique Order ID (`KP-YYYYMMDD-XXXX`), and writes the records to Supabase.
7. You are redirected to `/payment?orderId=KP-YYYYMMDD-XXXX`.
8. Refreshing `/payment` re-reads the existing pending order without creating duplicates.

---

## 5. SQL Verification Queries

Run the following queries in the Supabase SQL Editor to verify saved records:

### View Recent Orders:
```sql
SELECT 
    order_id, 
    first_name, 
    last_name, 
    mobile_number, 
    district_or_city, 
    pin_code, 
    subtotal, 
    total_amount, 
    payment_status, 
    order_status, 
    created_at 
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 10;
```

### View Order Items:
```sql
SELECT 
    order_id, 
    product_name, 
    package_size, 
    quantity, 
    unit_price, 
    line_total, 
    free_cocopeat_quantity 
FROM public.order_items 
ORDER BY created_at DESC 
LIMIT 20;
```

---

## 6. Safe Test Data Cleanup Script

To remove test orders without affecting real production data:

```sql
DELETE FROM public.orders 
WHERE email LIKE '%@example.com' 
   OR first_name = 'Test' 
   OR order_id LIKE 'KP-%-TEST';
```
*(All linked `order_items` will automatically be deleted via cascading foreign key).*

---

## 7. Status Summary

- **Order Persistence**: Real database creation via `POST /api/orders/create`.
- **Payment & Invoicing**: Prepared for Step 9 (UPI QR, direct payment proof review, manual payment verification workflows).
