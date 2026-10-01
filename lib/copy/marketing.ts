import { brand } from "@/lib/brand";

const N = brand.name;

export const marketingCopy = {
  landing: {
    eyebrow: "Now in Colombo",
    heroTitle: "Plans need people.",
    heroAccent: "Find your crew.",
    heroSub:
      "Short a few players for futsal? Want company for a hike, a quiz night or coffee? Post it, people nearby claim the spots, and you meet up — in groups of three or more, always somewhere public.",
    ctaPrimary: "Get started — it's free",
    ctaSecondary: "How it works",
    howTitle: "How it works",
    howItWorks: [
      { title: "Post a plan", body: "Pick the activity, time and a public spot. Choose who it's for — an age range, women-only, men-only, or everyone." },
      { title: "Spots fill up", body: "People nearby claim the open spots, first-come. Bringing friends? Hold seats for them and share an invite link." },
      { title: "Meet your crew", body: "Once enough people are in, it's on. Faces reveal, the group chat opens, and you sort out the rest." },
    ],
    featuresTitle: "Built for meeting people safely",
    features: [
      { title: "Groups only", body: "Three-person minimum and no private DMs. It's for crews, not dates." },
      { title: "Real faces", body: "Profile photos are reviewed by our team, and optional live video verification puts a badge on real people." },
      { title: "Your audience", body: "Hosts set the age range and audience. Gigs outside yours never show up." },
      { title: "Crew has a say", body: "If someone's out of line, the group can vote them out — and our team follows up." },
      { title: "Bring your friends", body: "Hold seats for people you know and share a private invite link to the group chat." },
      { title: "Install it", body: "Add Tremigos to your home screen and it runs like a native app." },
    ],
    activitiesTitle: "Whatever you're into",
    safetyTitle: "Safety, without the theatre",
    safetyBody:
      "We verify faces, not backgrounds — and we say so. Meet in public, keep chat on Tremigos, and leave whenever you want. The “I didn't feel comfortable” exit never counts against you.",
    safetyCta: "Read our safety approach",
    finalTitle: "Your next plan is three people away.",
    finalSub: "Free to join. 18+. Colombo first, the rest of Sri Lanka soon.",
  },
  about: {
    title: `About ${N}`,
    body: [
      `${N} is for doing things with people. Post a plan — futsal, a film, board games, a hike, coffee — and others claim the open spots. Three minimum. You meet in real life.`,
      "The activity comes first, not friendship in the abstract. You want to play on Saturday and you need a few more people. Friendship is the side effect.",
      "It's deliberately not a dating app, and it's built that way: groups of three or more, no hand-picking who joins, and no private messages.",
    ],
  },
  safety: {
    title: "Safety, honestly",
    intro: "Here's exactly what we do and don't do. A safety page that oversells is worse than none.",
    weCheckTitle: "What we check",
    weCheck: [
      "Profile photos are reviewed by a person before anyone sees them.",
      "Optional live video verification: a real person, matching their photo.",
      "Every gig is three or more people, at a public place.",
      "Reports are read by a person, and crew votes are reviewed.",
    ],
    weDontTitle: "What we don't do",
    weDont: [
      "Background or criminal checks.",
      "ID or NIC verification.",
      "Guarantee how anyone will behave.",
    ],
    tipsTitle: "When you meet",
    meetingTips: [
      "Meet at the venue and sort your own transport.",
      "Tell someone where you're going and who with.",
      "Keep chat on Tremigos — don't hand out your number or follow outside links.",
      "If a host is bringing friends, the group may know each other. Factor that in.",
      "If it feels off, leave. Use “I didn't feel comfortable” — it never counts against you.",
    ],
    rulesTitle: "Community rules",
    rules: [
      "18+ only. No exceptions.",
      "Show up, or leave the gig early so someone else can take the spot.",
      "Groups of three or more, in public. Don't push anyone toward one-on-one.",
      "Don't hit on the crew. That's not what this is.",
      "Your photo has to be you.",
      "No selling, recruiting, or spam links.",
      "No pressuring anyone for phone numbers or socials.",
    ],
    emergency: "In an emergency in Sri Lanka call 119 (Police) or 1990 (Suwa Seriya ambulance).",
  },
} as const;
