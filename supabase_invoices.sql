-- =============================================
-- INVOICES TABLE — Run in Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    plan_name VARCHAR(100) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    amount NUMERIC NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- values: 'pending', 'approved', 'declined'
    provider_id TEXT,                      -- stores encoded payment details (MOMO_TX:... or CRYPTO_TX:...)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Users can view their own invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own invoices (when they submit a payment)
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
CREATE POLICY "Users can insert own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Any authenticated user can update invoices (needed for admin approval)
-- NOTE: Restrict this further once you have a proper admin role system.
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON public.invoices;
CREATE POLICY "Authenticated users can update invoices"
  ON public.invoices FOR UPDATE
  USING (auth.role() = 'authenticated');
