-- ── Tenant portal (2026-10) ────────────────────────────────────────────
-- A tenant signs in with the email on their management_tenancies row and
-- sees their home, rent schedule and shared documents. What they raise —
-- a repair, a question, "I have paid", notice to leave — is a
-- tenant_requests row, worked by the desk in Admin → Tenants. The owner of
-- the property sees repairs (never the tenant's contact details).
CREATE TABLE IF NOT EXISTS tenant_requests (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(24) UNIQUE NOT NULL,
  tenancy_id INT NOT NULL REFERENCES management_tenancies(id) ON DELETE CASCADE,
  request_id INT NOT NULL REFERENCES management_requests(id) ON DELETE CASCADE,
  tenant_email VARCHAR(255) NOT NULL,
  category VARCHAR(20) NOT NULL DEFAULT 'repair'
    CHECK (category IN ('repair','payment','question','notice')),
  title VARCHAR(255) NOT NULL,
  details TEXT,
  urgency VARCHAR(10) NOT NULL DEFAULT 'normal'
    CHECK (urgency IN ('low','normal','urgent')),
  location VARCHAR(120),
  access_notes VARCHAR(500),
  amount NUMERIC(15,2),
  paid_on DATE,
  payment_ref VARCHAR(120),
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(16) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','in_progress','scheduled','resolved','closed')),
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenant_requests_tenancy ON tenant_requests(tenancy_id);
CREATE INDEX IF NOT EXISTS idx_tenant_requests_status ON tenant_requests(status);
CREATE INDEX IF NOT EXISTS idx_management_tenancies_email ON management_tenancies(LOWER(tenant_email));

-- Documents stay owner-only unless the desk shares one with the tenant
-- (a tenancy agreement, an inventory, a gas certificate).
ALTER TABLE management_documents ADD COLUMN IF NOT EXISTS share_with_tenant BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE management_documents ADD COLUMN IF NOT EXISTS tenancy_id INT REFERENCES management_tenancies(id) ON DELETE SET NULL;
