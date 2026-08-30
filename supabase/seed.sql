-- Example service catalog. Replace stripe_price_id values with real Stripe
-- Price IDs created in the Stripe Dashboard before going live.

insert into public.services (name, description, price_cents, stripe_price_id, billing_type, active)
values
  (
    'Single Property Reel',
    'One property, one polished vertical reel — from your raw photos to a finished, watermark-free video.',
    35000,
    'price_REPLACE_SINGLE_PROPERTY',
    'one_time',
    true
  ),
  (
    'Listing Launch Package',
    'Three reels for the same property — hero reel, room-by-room walkthrough, and a social teaser cut.',
    75000,
    'price_REPLACE_LAUNCH_PACKAGE',
    'one_time',
    true
  ),
  (
    'Unlimited Monthly Membership',
    'Submit unlimited properties every month under one recurring charge — no per-order payment.',
    99900,
    'price_REPLACE_MONTHLY_MEMBERSHIP',
    'subscription',
    true
  );
