-- seed.sql — reference data. Runs after migrations on `supabase db reset`.
-- Activity taxonomy from docs/01-product-spec.md. Seeded, not user-created (a
-- long tail of one-off activity types never fills).

insert into activities (slug, name, emoji, category, default_capacity, is_sport, sort_order) values
  -- Sports
  ('badminton',      'Badminton',        '🏸', 'Sports',   4,  true,  10),
  ('pickleball',     'Pickleball',       '🥒', 'Sports',   4,  true,  11),
  ('cricket',        'Cricket',          '🏏', 'Sports',   8,  true,  12),
  ('football',       'Football',         '⚽', 'Sports',   10, true,  13),
  ('tennis',         'Tennis',           '🎾', 'Sports',   4,  true,  14),
  ('swimming',       'Swimming',         '🏊', 'Sports',   4,  true,  15),
  ('running',        'Running',          '🏃', 'Sports',   5,  true,  16),
  ('cycling',        'Cycling',          '🚴', 'Sports',   5,  true,  17),
  ('gym',            'Gym',              '🏋️', 'Sports',   3,  true,  18),
  -- Chill
  ('coffee',         'Coffee',           '☕', 'Chill',    3,  false, 20),
  ('brunch',         'Brunch',           '🥞', 'Chill',    4,  false, 21),
  ('board-games',    'Board games',      '🎲', 'Chill',    5,  false, 22),
  ('video-games',    'Video games',      '🎮', 'Chill',    4,  false, 23),
  ('karaoke',        'Karaoke',          '🎤', 'Chill',    6,  false, 24),
  ('movie',          'Movie',            '🎬', 'Chill',    4,  false, 25),
  -- Outdoors
  ('hike',           'Hike',             '🥾', 'Outdoors', 6,  false, 30),
  ('beach',          'Beach',            '🏖️', 'Outdoors', 6,  false, 31),
  ('park-walk',      'Park walk',        '🌳', 'Outdoors', 4,  false, 32),
  ('photo-walk',     'Photo walk',       '📷', 'Outdoors', 4,  false, 33),
  -- Making
  ('study-group',    'Study group',      '📚', 'Making',   4,  false, 40),
  ('language-exchange','Language exchange','🗣️', 'Making',  4,  false, 41),
  ('book-club',      'Book club',        '📖', 'Making',   5,  false, 42),
  ('jam-session',    'Jam session',      '🎸', 'Making',   4,  false, 43),
  ('co-working',     'Co-working',       '💻', 'Making',   4,  false, 44)
on conflict (slug) do nothing;
