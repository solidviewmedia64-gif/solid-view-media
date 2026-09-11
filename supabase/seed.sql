-- Solid View Media live service catalog (test-mode Stripe Price IDs).
-- Swap the stripe_price_id values for live-mode IDs before going to
-- production Stripe keys.

delete from public.services;

insert into public.services (name, description, price_cents, stripe_price_id, billing_type, active)
values
  (
    '4D Room Staging',
    'AI-enhanced room staging that shows a property''s true potential — before-and-after reels ready to share with buyers.',
    35000,
    'price_1TrNWN0213tMRUdMtGjS0rYA',
    'one_time',
    true
  ),
  (
    'Cinematic Capture & Video Stills',
    'Professional cinematic video and still captures of your listing, edited into a polished, share-ready package.',
    50000,
    'price_1UELIe0213tMRUdMK6oqPJ6W',
    'one_time',
    true
  ),
  (
    'Neighborhood Walking Tours',
    'A guided walking-tour reel that showcases the neighborhood, streets, and nearby amenities around the listing.',
    65000,
    'price_1UELMM0213tMRUdM9vu0U2lH',
    'one_time',
    true
  ),
  (
    'Solid View Master Bundle',
    'Our complete package — room staging, cinematic capture, and a neighborhood walking tour in one bundle.',
    150000,
    'price_1UELPT0213tMRUdMr1oliOHN',
    'one_time',
    true
  ),
  (
    'High-Volume Brokerage Membership',
    'Unlimited property submissions every month under one recurring charge — built for high-volume brokerages.',
    250000,
    'price_1UELSt0213tMRUdMx95lS6Px',
    'subscription',
    true
  );
