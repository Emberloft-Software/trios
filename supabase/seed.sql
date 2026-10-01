-- seed.sql — reference data. Runs after migrations on `supabase db reset`.

-- First admin(s): these emails become admins the moment they sign up.
insert into admin_allowlist (email) values
  ('chankaherath2001@gmail.com')
on conflict do nothing;

insert into activities (slug, name, emoji, category, default_capacity, is_sport, sort_order) values
  -- Sports
  ('futsal',            'Futsal',            '⚽', 'Sports',   10, true,  10),
  ('football',          'Football',          '🥅', 'Sports',   12, true,  11),
  ('badminton',         'Badminton',         '🏸', 'Sports',   4,  true,  12),
  ('cricket',           'Cricket',           '🏏', 'Sports',   12, true,  13),
  ('padel',             'Padel',             '🎾', 'Sports',   4,  true,  14),
  ('pickleball',        'Pickleball',        '🥒', 'Sports',   4,  true,  15),
  ('tennis',            'Tennis',            '🎾', 'Sports',   4,  true,  16),
  ('basketball',        'Basketball',        '🏀', 'Sports',   10, true,  17),
  ('volleyball',        'Volleyball',        '🏐', 'Sports',   12, true,  18),
  ('table-tennis',      'Table tennis',      '🏓', 'Sports',   4,  true,  19),
  ('swimming',          'Swimming',          '🏊', 'Sports',   4,  true,  20),
  ('running',           'Running',           '🏃', 'Sports',   6,  true,  21),
  ('cycling',           'Cycling',           '🚴', 'Sports',   6,  true,  22),
  ('gym',               'Gym session',       '🏋️', 'Sports',   3,  true,  23),
  ('yoga',              'Yoga',              '🧘', 'Sports',   6,  true,  24),
  ('surfing',           'Surfing',           '🏄', 'Sports',   4,  true,  25),
  -- Food & chill
  ('coffee',            'Coffee',            '☕', 'Chill',    3,  false, 30),
  ('brunch',            'Brunch',            '🥞', 'Chill',    4,  false, 31),
  ('dinner',            'Dinner',            '🍛', 'Chill',    5,  false, 32),
  ('street-food',       'Street food crawl', '🌮', 'Chill',    5,  false, 33),
  ('board-games',       'Board games',       '🎲', 'Chill',    5,  false, 34),
  ('video-games',       'Video games',       '🎮', 'Chill',    4,  false, 35),
  ('karaoke',           'Karaoke',           '🎤', 'Chill',    6,  false, 36),
  ('movie',             'Movie',             '🎬', 'Chill',    4,  false, 37),
  ('live-music',        'Live music',        '🎶', 'Chill',    5,  false, 38),
  ('quiz-night',        'Quiz night',        '🧠', 'Chill',    5,  false, 39),
  -- Outdoors
  ('hike',              'Hike',              '🥾', 'Outdoors', 6,  false, 50),
  ('beach',             'Beach day',         '🏖️', 'Outdoors', 6,  false, 51),
  ('park-walk',         'Park walk',         '🌳', 'Outdoors', 4,  false, 52),
  ('photo-walk',        'Photo walk',        '📷', 'Outdoors', 4,  false, 53),
  ('day-trip',          'Day trip',          '🚐', 'Outdoors', 6,  false, 54),
  -- Learn & make
  ('study-group',       'Study group',       '📚', 'Making',   4,  false, 60),
  ('language-exchange', 'Language exchange', '🗣️', 'Making',   4,  false, 61),
  ('book-club',         'Book club',         '📖', 'Making',   5,  false, 62),
  ('jam-session',       'Jam session',       '🎸', 'Making',   4,  false, 63),
  ('co-working',        'Co-working',        '💻', 'Making',   4,  false, 64),
  ('art-class',         'Art & craft',       '🎨', 'Making',   5,  false, 65)
on conflict (slug) do nothing;
