-- Freight quote intake (optional structured table; contact_submissions is the fallback)
CREATE TABLE IF NOT EXISTS freight_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('export', 'import')),
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  mode TEXT NOT NULL,
  cargo_class TEXT,
  weight_kg TEXT,
  volume_cbm TEXT,
  incoterm TEXT,
  cargo_description TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'quoted', 'booked', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_freight_quotes_created ON freight_quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_freight_quotes_status ON freight_quotes(status);

-- Public shipment tracking
CREATE TABLE IF NOT EXISTS public_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('export', 'import')),
  mode TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  cargo_summary TEXT,
  current_status TEXT NOT NULL DEFAULT 'booked',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public_shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  label TEXT NOT NULL,
  location TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_public_shipments_reference ON public_shipments(reference);
CREATE INDEX IF NOT EXISTS idx_public_shipment_events_shipment ON public_shipment_events(shipment_id, occurred_at DESC);

INSERT INTO public_shipments (reference, direction, mode, origin, destination, cargo_summary, current_status)
VALUES
  ('EMZ-NG-1001', 'export', 'sea', 'Lagos, Nigeria', 'Rotterdam, Netherlands', '2×40HC cocoa butter', 'in_transit'),
  ('EMZ-NG-1002', 'import', 'air', 'Guangzhou, China', 'Lagos (LOS), Nigeria', 'Electronics — 180 kg', 'customs_clearance')
ON CONFLICT (reference) DO NOTHING;

INSERT INTO public_shipment_events (shipment_id, status, label, location, occurred_at)
SELECT s.id, e.status, e.label, e.location, e.occurred_at
FROM public_shipments s
JOIN (
  VALUES
    ('EMZ-NG-1001', 'booked', 'Booking confirmed', 'Lagos', now() - interval '12 days'),
    ('EMZ-NG-1001', 'picked_up', 'Cargo collected', 'Apapa, Lagos', now() - interval '10 days'),
    ('EMZ-NG-1001', 'departed_port', 'Vessel departed', 'Tin Can Island', now() - interval '8 days'),
    ('EMZ-NG-1001', 'in_transit', 'At sea', 'Atlantic', now() - interval '3 days'),
    ('EMZ-NG-1002', 'booked', 'Air booking confirmed', 'Guangzhou', now() - interval '5 days'),
    ('EMZ-NG-1002', 'departed', 'Flight departed', 'CAN', now() - interval '2 days'),
    ('EMZ-NG-1002', 'arrived', 'Arrived Lagos', 'MMIA LOS', now() - interval '1 day'),
    ('EMZ-NG-1002', 'customs_clearance', 'Customs clearance in progress', 'Lagos', now() - interval '6 hours')
) AS e(reference, status, label, location, occurred_at) ON e.reference = s.reference
WHERE NOT EXISTS (
  SELECT 1 FROM public_shipment_events pe WHERE pe.shipment_id = s.id
);
