-- ============================================
-- Migration 018: External Store Platform Hooks
-- My Sista — Happy Splurge (Pty) Ltd
-- Commander: Royalle
-- Purpose: Hook foundation for Shopify, Wix,
--          and all major platform integrations
-- Phase 1: DB columns only — no UI yet
-- ============================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS external_store_platform TEXT,
  ADD COLUMN IF NOT EXISTS external_product_id TEXT,
  ADD COLUMN IF NOT EXISTS external_store_id TEXT,
  ADD COLUMN IF NOT EXISTS external_store_url TEXT,
  ADD COLUMN IF NOT EXISTS external_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS business_user_id UUID REFERENCES profiles(id);

COMMENT ON COLUMN products.external_store_platform IS
  'Platform identifier: shopify, wix, takealot, facebook_shop, instagram_shop, etsy, amazon, bidorbuy, gumtree, tiktok_shop, whatsapp_business, native';

COMMENT ON COLUMN products.external_product_id IS
  'Product ID on the external platform';

COMMENT ON COLUMN products.external_store_id IS
  'Store or site identifier on the external platform';

COMMENT ON COLUMN products.external_store_url IS
  'Direct URL to the sellers storefront on external platform';

COMMENT ON COLUMN products.external_synced_at IS
  'Timestamp of last successful sync from external platform';

COMMENT ON COLUMN products.business_user_id IS
  'References the Gold business profile owner in profiles table';
