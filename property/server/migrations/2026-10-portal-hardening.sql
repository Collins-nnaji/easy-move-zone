-- ── Portal hardening (2026-10) ─────────────────────────────────────────
-- Staff activity: every change a staff member makes through the API.
CREATE TABLE IF NOT EXISTS admin_audit (
  id BIGSERIAL PRIMARY KEY,
  actor VARCHAR(255) NOT NULL,
  method VARCHAR(8) NOT NULL,
  path VARCHAR(500) NOT NULL,
  status INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit(created_at DESC);

-- What we told whom. Every notice lands in the recipient's in-app inbox;
-- email and SMS go out too when a provider is configured, and the row says
-- whether they did.
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  audience VARCHAR(10) NOT NULL DEFAULT 'owner'
    CHECK (audience IN ('owner','tenant','staff')),
  kind VARCHAR(40) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  link VARCHAR(500),
  read_at TIMESTAMPTZ,
  email_status VARCHAR(12) NOT NULL DEFAULT 'skipped',
  sms_status VARCHAR(12) NOT NULL DEFAULT 'skipped',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_email, created_at DESC);

-- Online rent payments (Paystack). One row per checkout; the reference makes
-- crediting the rent charge idempotent across the redirect and the webhook.
CREATE TABLE IF NOT EXISTS rent_payments (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(80) UNIQUE NOT NULL,
  charge_id INT NOT NULL REFERENCES management_rent_charges(id) ON DELETE CASCADE,
  tenancy_id INT REFERENCES management_tenancies(id) ON DELETE SET NULL,
  payer_email VARCHAR(255) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  provider VARCHAR(20) NOT NULL DEFAULT 'paystack',
  status VARCHAR(12) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','success','failed','abandoned')),
  paid_at TIMESTAMPTZ,
  credited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rent_payments_charge ON rent_payments(charge_id);

-- Rent reminders are sent once per charge per kind.
ALTER TABLE management_rent_charges ADD COLUMN IF NOT EXISTS reminded_due_at TIMESTAMPTZ;
ALTER TABLE management_rent_charges ADD COLUMN IF NOT EXISTS reminded_overdue_at TIMESTAMPTZ;

-- A single-use link that attaches a tenancy to whoever signs in with it.
-- Only a SHA-256 of the token is stored; a new link revokes the old one.
CREATE TABLE IF NOT EXISTS tenant_invites (
  id SERIAL PRIMARY KEY,
  tenancy_id INT NOT NULL REFERENCES management_tenancies(id) ON DELETE CASCADE,
  token_hash CHAR(64) UNIQUE NOT NULL,
  sent_to VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by VARCHAR(255),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenant_invites_tenancy ON tenant_invites(tenancy_id);

-- The conversation on a tenant request. 'owner' notes are between the owner
-- and the desk: the tenant never sees them.
CREATE TABLE IF NOT EXISTS tenant_request_messages (
  id SERIAL PRIMARY KEY,
  request_id INT NOT NULL REFERENCES tenant_requests(id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('tenant','admin','owner')),
  author VARCHAR(255),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenant_request_messages_req ON tenant_request_messages(request_id);
