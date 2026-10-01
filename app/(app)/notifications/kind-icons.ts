import {
  BadgeCheck,
  Bell,
  CalendarX,
  ImageIcon,
  Lock,
  MessageCircle,
  ShieldAlert,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  gig_confirmed: MessageCircle,
  gig_locked: Lock,
  gig_cancelled: CalendarX,
  removed: UserMinus,
  removed_by_vote: UserMinus,
  verification_approved: BadgeCheck,
  verification_rejected: BadgeCheck,
  photo_approved: ImageIcon,
  photo_rejected: ImageIcon,
  friend_request: UserPlus,
  friend_accepted: UserPlus,
  friend_invite: UserPlus,
  moderation_action: ShieldAlert,
  admin_priority_report: ShieldAlert,
};

export function iconForKind(kind: string): LucideIcon {
  return ICONS[kind] ?? Bell;
}
