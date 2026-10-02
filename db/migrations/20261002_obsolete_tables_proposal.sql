-- Pending explicit approval: do not include in db:setup.
-- Back up these tables and verify external consumers before execution.
-- RESTRICT prevents removal of dependent objects outside this list.
BEGIN;
DROP TABLE IF EXISTS
  public.car_listings,
  public.dispute_events,
  public.driver_compliance_docs,
  public.driver_native_push_tokens,
  public.driver_profiles,
  public.driver_push_subscriptions,
  public.driver_shift_sessions,
  public.driver_shifts,
  public.driver_wallet_transactions,
  public.driver_wallets,
  public.fleet_operator_profiles,
  public.freight_quotes,
  public.marketplace_commissions,
  public.marketplace_notifications,
  public.marketplace_offers,
  public.marketplace_payments,
  public.marketplace_ratings,
  public.mobility_featured_jobs,
  public.public_shipment_events,
  public.public_shipments,
  public.relocation_requests,
  public.shift_disputes,
  public.shift_evidence,
  public.shift_location_pings,
  public.shift_milestones
RESTRICT;
COMMIT;
