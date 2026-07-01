-- Revert Agro Schema changes
-- Drops Agro-specific tables and columns

DROP TABLE IF EXISTS price_submissions CASCADE;
DROP TABLE IF EXISTS commodity_prices CASCADE;
DROP TABLE IF EXISTS shipment_events CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS transporter_profiles CASCADE;
DROP TABLE IF EXISTS produce_listings CASCADE;

ALTER TABLE user_profiles DROP COLUMN IF EXISTS agro_role;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS whatsapp_enabled;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS base_state;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS base_lga;
