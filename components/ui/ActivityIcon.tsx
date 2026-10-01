import {
  Activity,
  Bike,
  BookOpen,
  Brain,
  Bus,
  Camera,
  CircleDot,
  Clapperboard,
  Coffee,
  Croissant,
  Dices,
  Dumbbell,
  Feather,
  Footprints,
  Gamepad2,
  Goal,
  Guitar,
  Laptop,
  Languages,
  Mic,
  Mountain,
  Music,
  NotebookPen,
  Palette,
  Palmtree,
  PersonStanding,
  Sparkles,
  Target,
  Trees,
  Trophy,
  Utensils,
  Volleyball,
  Waves,
  Coffee as Chill,
  type LucideIcon,
} from "lucide-react";

/** One icon per activity slug (the activities table's emoji column is no longer shown). */
const BY_SLUG: Record<string, LucideIcon> = {
  futsal: Goal,
  football: Goal,
  badminton: Feather,
  cricket: Target,
  padel: CircleDot,
  pickleball: CircleDot,
  tennis: CircleDot,
  basketball: Trophy,
  volleyball: Volleyball,
  "table-tennis": CircleDot,
  swimming: Waves,
  running: Footprints,
  cycling: Bike,
  gym: Dumbbell,
  yoga: PersonStanding,
  surfing: Waves,
  coffee: Coffee,
  brunch: Croissant,
  dinner: Utensils,
  "street-food": Utensils,
  "board-games": Dices,
  "video-games": Gamepad2,
  karaoke: Mic,
  movie: Clapperboard,
  "live-music": Music,
  "quiz-night": Brain,
  hike: Mountain,
  beach: Palmtree,
  "park-walk": Trees,
  "photo-walk": Camera,
  "day-trip": Bus,
  "study-group": NotebookPen,
  "language-exchange": Languages,
  "book-club": BookOpen,
  "jam-session": Guitar,
  "co-working": Laptop,
  "art-class": Palette,
};

/** Category filter icons on Discover. */
export const CATEGORY_ICON: Record<string, LucideIcon> = {
  "": Sparkles,
  Sports: Trophy,
  Chill: Chill,
  Outdoors: Mountain,
  Making: Palette,
};

export function activityIcon(slug: string | null | undefined): LucideIcon {
  return (slug && BY_SLUG[slug]) || Activity;
}

export function ActivityIcon({ slug, className = "h-4 w-4" }: { slug: string | null | undefined; className?: string }) {
  const Icon = activityIcon(slug);
  return <Icon aria-hidden className={className} />;
}
