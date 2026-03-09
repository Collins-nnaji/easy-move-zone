-- EasyMoveZone Property Finder seed data (safe upserts)

INSERT INTO property_faqs (id, question, answer)
VALUES
  ('faq_1', 'How do you verify listings and agents?', 'We verify agent identity, listing ownership details, and recent availability checks before properties are labeled verified.'),
  ('faq_2', 'Can I complete my search before arriving in Nigeria?', 'Yes. We support virtual tours, remote shortlist management, and documentation prep before your arrival date.'),
  ('faq_3', 'Do you support both rentals and purchases?', 'Yes. EasyMoveZone supports rental search, purchase search, and commercial property options for relocating teams.'),
  ('faq_4', 'What happens after I shortlist properties?', 'We coordinate viewings, help validate terms, and guide legal/payment steps through move-in completion.'),
  ('faq_5', 'Can you help with school-focused family moves?', 'Yes. We map neighborhood options against school access, commute needs, and safety preferences for family relocations.'),
  ('faq_6', 'How fast can I secure a move-in ready property?', 'Timelines vary by city and inventory, but many verified move-ready options can be secured in 1-3 weeks.')
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer;

INSERT INTO resource_guides (id, title, summary, category, read_minutes, href)
VALUES
  ('guide_1', 'Lagos Relocation Starter Checklist', 'A practical checklist covering budget, target areas, and key documentation before your move.', 'Relocation', 6, '/contact'),
  ('guide_2', 'How to Avoid Rental Fraud in Nigeria', 'Common fraud patterns and the verification steps every mover should follow.', 'Legal', 8, '/contact'),
  ('guide_3', 'Choosing Between Ikoyi, VI, and Lekki', 'Compare commute patterns, pricing, and lifestyle fit across Lagos prime areas.', 'Neighbourhood', 7, '/intelligence'),
  ('guide_4', 'Diaspora Move Budget Planning', 'How to structure housing budget, setup costs, and contingency for return moves.', 'Budgeting', 5, '/services')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  category = EXCLUDED.category,
  read_minutes = EXCLUDED.read_minutes,
  href = EXCLUDED.href;
