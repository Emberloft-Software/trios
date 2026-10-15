-- ═════════════════════════════════════════════════════════════════════════════
-- 0027: starter list for chat moderation (see 0026). Lowercase letters and
-- single spaces only; mod_normalize() handles case, character swaps and
-- stretched letters, and simple endings (s/es/ing/er/ed) match automatically.
-- Severity: 1 = rude, 2 = sexual / drugs / scams, 3 = slurs and threats.
-- Matches are only flagged for a person to review, never auto-blocked, so a
-- false positive costs a moderator a few seconds. Extend with plain inserts:
--   insert into moderation_terms values ('newterm', 'profanity', 1);
-- ═════════════════════════════════════════════════════════════════════════════

insert into moderation_terms (term, category, severity) values
  -- English profanity / abuse
  ('fuck', 'profanity', 1), ('fck', 'profanity', 1), ('fuk', 'profanity', 1), ('motherfucker', 'profanity', 1),
  ('shit', 'profanity', 1), ('bullshit', 'profanity', 1), ('bitch', 'profanity', 1), ('bastard', 'profanity', 1),
  ('asshole', 'profanity', 1), ('dickhead', 'profanity', 1), ('prick', 'profanity', 1), ('cunt', 'profanity', 1),
  ('whore', 'profanity', 1), ('slut', 'profanity', 1), ('wanker', 'profanity', 1), ('twat', 'profanity', 1),
  ('stfu', 'profanity', 1), ('gtfo', 'profanity', 1), ('piss off', 'profanity', 1), ('shut up bitch', 'profanity', 1),
  -- Sinhala and Tamil (romanised) abuse
  ('huththa', 'profanity', 1), ('hutta', 'profanity', 1), ('huththo', 'profanity', 1), ('huththi', 'profanity', 1),
  ('pakaya', 'profanity', 1), ('pako', 'profanity', 1), ('kariya', 'profanity', 1), ('kariyo', 'profanity', 1),
  ('ponnaya', 'profanity', 1), ('ponna', 'profanity', 1), ('wesi', 'profanity', 1), ('wesige', 'profanity', 1),
  ('hukanna', 'profanity', 1), ('hukapan', 'profanity', 1), ('pukaya', 'profanity', 1), ('ammata hukanna', 'profanity', 1),
  ('thoge ammata', 'profanity', 1), ('punda', 'profanity', 1), ('pundai', 'profanity', 1), ('thevidiya', 'profanity', 1),
  ('oombu', 'profanity', 1), ('sunni', 'profanity', 1),
  -- slurs
  ('nigger', 'slur', 3), ('nigga', 'slur', 3), ('faggot', 'slur', 3), ('fag', 'slur', 3), ('retard', 'slur', 3),
  ('tranny', 'slur', 3), ('chink', 'slur', 3), ('paki', 'slur', 3), ('kike', 'slur', 3), ('coon', 'slur', 3),
  ('demala', 'slur', 3), ('thambiya', 'slur', 3), ('paraya', 'slur', 2),
  -- threats and self-harm baiting
  ('kill you', 'threat', 3), ('kill yourself', 'threat', 3), ('kys', 'threat', 3), ('rape', 'threat', 3),
  ('beat you up', 'threat', 3), ('stab you', 'threat', 3), ('find where you live', 'threat', 3),
  ('i know where you live', 'threat', 3), ('marala danawa', 'threat', 3), ('maranawa', 'threat', 3),
  -- sexual solicitation (the app is explicitly not for this)
  ('send nudes', 'sexual', 2), ('nudes', 'sexual', 2), ('dick pic', 'sexual', 2), ('horny', 'sexual', 2),
  ('hookup', 'sexual', 2), ('hook up tonight', 'sexual', 2), ('blowjob', 'sexual', 2), ('onlyfans', 'sexual', 2),
  ('sugar daddy', 'sexual', 2), ('sugar baby', 'sexual', 2), ('escort', 'sexual', 2), ('porn', 'sexual', 2),
  ('happy ending', 'sexual', 2), ('one night stand', 'sexual', 2),
  -- drugs
  ('cocaine', 'drugs', 2), ('heroin', 'drugs', 2), ('kudu', 'drugs', 2), ('ganja', 'drugs', 2), ('weed', 'drugs', 2),
  ('mdma', 'drugs', 2), ('ecstasy', 'drugs', 2), ('meth', 'drugs', 2), ('lsd', 'drugs', 2), ('magic mushrooms', 'drugs', 2),
  ('kush', 'drugs', 2), ('molly', 'drugs', 2),
  -- scams and money requests
  ('send money', 'scam', 2), ('bank details', 'scam', 2), ('otp', 'scam', 2), ('gift card', 'scam', 2),
  ('crypto', 'scam', 2), ('bitcoin', 'scam', 2), ('usdt', 'scam', 2), ('forex', 'scam', 2), ('binary options', 'scam', 2),
  ('investment opportunity', 'scam', 2), ('double your money', 'scam', 2), ('easy money', 'scam', 2),
  ('ez cash', 'scam', 2), ('western union', 'scam', 2)
on conflict (term) do update set category = excluded.category, severity = excluded.severity;
