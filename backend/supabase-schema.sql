-- Supabase schema for ShiftAid
-- Paste into Supabase SQL Editor and run once

-- Enable UUID generation (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to recreate with correct column names)
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.ngos CASCADE;

-- ========================
-- NGOs
-- ========================
CREATE TABLE public.ngos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('Education','Healthcare','Environment','Poverty','Disaster Relief','Human Rights','Other')),
  "walletAddress" text NOT NULL UNIQUE,
  "preferredCoin" text NOT NULL DEFAULT 'USDC.polygon',
  website text,
  logo text,
  verified boolean NOT NULL DEFAULT false,
  "totalDonations" numeric NOT NULL DEFAULT 0,
  "donationCount" int NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

-- Helpful NGO indexes
CREATE INDEX IF NOT EXISTS idx_ngos_verified ON public.ngos(verified);
CREATE INDEX IF NOT EXISTS idx_ngos_category ON public.ngos(category);
CREATE INDEX IF NOT EXISTS idx_ngos_wallet ON public.ngos("walletAddress");

-- Optional text search index (requires pg_trgm if you prefer trigram)
-- create extension if not exists pg_trgm;
-- create index if not exists idx_ngos_name_trgm on public.ngos using gin (name gin_trgm_ops);

-- ========================
-- Donations
-- ========================
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "donorAddress" text NOT NULL,
  "ngoId" uuid NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  "sideshiftOrderId" text NOT NULL UNIQUE,
  "depositCoin" text NOT NULL,
  "settleCoin" text NOT NULL,
  "depositAmount" text NOT NULL,
  "settleAmount" text NOT NULL,
  "depositAddress" text NOT NULL,
  "settleAddress" text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending','deposit_received','swapping','completed','failed','expired')) DEFAULT 'pending',
  "depositTxHash" text,
  "settleTxHash" text,
  "onChainTxHash" text,
  quote jsonb,
  metadata jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

-- Helpful donation indexes
CREATE INDEX IF NOT EXISTS idx_donations_donor ON public.donations("donorAddress");
CREATE INDEX IF NOT EXISTS idx_donations_ngo ON public.donations("ngoId");
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created ON public.donations("createdAt" DESC);

-- ========================
-- Notes
-- ========================
-- 1) If you plan to expose these tables via Supabase client on the frontend,
--    enable Row Level Security (RLS) and add policies accordingly.
-- 2) The backend uses the Service Role key and does not require RLS policies.
-- 3) Ensure you set SUPABASE_URL and SUPABASE_SERVICE_ROLE in the backend env.


