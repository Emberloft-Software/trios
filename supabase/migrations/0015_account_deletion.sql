-- ═════════════════════════════════════════════════════════════════════════════
-- Tremigos — 0006 account deletion.
-- People can delete their account (privacy policy). Audit/trust rows survive
-- with the person's reference nulled, so moderation history isn't lost but
-- nothing blocks the delete.
-- ═════════════════════════════════════════════════════════════════════════════

alter table reports alter column reporter_id drop not null;
alter table reports alter column target_id drop not null;
alter table reports drop constraint reports_reporter_id_fkey,
  add constraint reports_reporter_id_fkey foreign key (reporter_id) references profiles on delete set null;
alter table reports drop constraint reports_target_id_fkey,
  add constraint reports_target_id_fkey foreign key (target_id) references profiles on delete set null;
alter table reports drop constraint reports_handled_by_fkey,
  add constraint reports_handled_by_fkey foreign key (handled_by) references profiles on delete set null;

alter table moderation_actions alter column admin_id drop not null;
alter table moderation_actions drop constraint moderation_actions_admin_id_fkey,
  add constraint moderation_actions_admin_id_fkey foreign key (admin_id) references profiles on delete set null;
alter table moderation_actions drop constraint moderation_actions_target_id_fkey,
  add constraint moderation_actions_target_id_fkey foreign key (target_id) references profiles on delete cascade;

alter table crew_removals alter column target_id drop not null;
alter table crew_removals drop constraint crew_removals_actor_id_fkey,
  add constraint crew_removals_actor_id_fkey foreign key (actor_id) references profiles on delete set null;
alter table crew_removals drop constraint crew_removals_target_id_fkey,
  add constraint crew_removals_target_id_fkey foreign key (target_id) references profiles on delete set null;

alter table admin_audit alter column admin_id drop not null;
alter table admin_audit drop constraint admin_audit_admin_id_fkey,
  add constraint admin_audit_admin_id_fkey foreign key (admin_id) references profiles on delete set null;

alter table verification_requests drop constraint verification_requests_reviewer_id_fkey,
  add constraint verification_requests_reviewer_id_fkey foreign key (reviewer_id) references profiles on delete set null;
