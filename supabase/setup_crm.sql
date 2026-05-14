-- Migration: Create order_reviews table for CRM NPS System

CREATE TABLE IF NOT EXISTS public.order_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  customer_phone text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.order_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anon users can insert a review (the tracking page is public)
CREATE POLICY "Anyone can insert a review" ON public.order_reviews
  FOR INSERT
  WITH CHECK (true);

-- Store owners can view reviews for their store
CREATE POLICY "Store owners can view their reviews" ON public.order_reviews
  FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

-- Only superadmins could theoretically delete, but let's allow store owners to manage if they want, or just select.
-- Let's stick to SELECT and INSERT for now.
