/**
 * Every user-facing string lives here (CLAUDE.md hard rule #8). No inline
 * strings in JSX. The voice is a product feature — edit it in one place.
 * Source: docs/09-copy-and-legal.md. Voice: warm, plain, a bit funny, never
 * cute about safety. Sentence case. No exclamation marks in system messages.
 */
export const copy = {
  productLine: "Post a plan. Three people minimum. Go do the thing.",

  nav: {
    feed: "Feed",
    newGig: "Post a gig",
    me: "You",
    signIn: "Sign in",
    signOut: "Sign out",
  },

  feed: {
    empty: "Nothing on yet. Someone has to go first — might as well be you.",
    emptyCta: "Post a gig",
    emptyFiltered: (activity: string) =>
      `No ${activity} gigs coming up. Post one and see who bites.`,
    title: "What's on",
  },

  gig: {
    confirmed: "That's three. It's happening.",
    lockNotice: "Crew's final. Address is below. See you there.",
    underFilledCancel:
      "This one didn't fill in time, so it's off. Not your fault — there just weren't enough people around. Here's what else is on this week.",
    someoneLeft: (name: string) => `${name} dropped out. Slot's open again.`,
    slotTakenByOther:
      "Someone got the last slot a second before you. There are other gigs on.",
    take: "Take a slot",
    taken: "Slot taken",
    youreIn: "You're in",
    leave: "Leave gig",
    report: "Report someone",
  },

  chat: {
    beforeConfirm1: "Chat opens when three people are in. Two more to go.",
    beforeConfirm2: "One more person and this is on. Chat opens then too.",
    opens: "Three of you. Chat's open — sort out who's bringing what.",
    readOnly: "This gig's done. Chat's read-only now.",
    placeholder: "Message the crew",
  },

  verification: {
    pending: "Sent. A human at Trio will watch it — usually within a day.",
    approved: "You're verified. Your badge is on your profile.",
    // Say exactly this in the UI (docs/05):
    meaning:
      "A real person recorded themselves live, and a human at Trio checked that it's the same face as their photo.",

    title: "Verify you're you",
    // Pre-capture explainer — shown before the camera is requested (docs/05).
    explainer: {
      heading: "Before we turn the camera on",
      points: [
        "We record a short video — about 12 seconds — of you doing two quick actions and reading a number aloud.",
        "Only a person at Trio watches it, to check the face matches your photo.",
        "It's stored privately and deleted 7 days after review. You can ask us to delete it sooner.",
        "It proves you're a real, live person. It doesn't check your name, age, or anything else.",
      ],
      start: "Turn on the camera",
    },
    holdCode: "Read this number aloud and keep it in frame",
    ready: "I'm ready",
    recording: "Recording",
    retake: "Retake",
    send: "Send for review",
    uploading: "Sending…",
    sent: "Sent. A human at Trio will watch it — usually within a day.",
    // Instruction shown for each assigned action
    actionPrompts: {
      turn_head_left: "Turn your head to the left",
      turn_head_right: "Turn your head to the right",
      look_up: "Look up",
      smile: "Smile",
      blink_twice: "Blink twice",
      show_fingers_2: "Hold up two fingers",
      show_fingers_3: "Hold up three fingers",
      show_fingers_5: "Hold up five fingers",
      touch_left_ear: "Touch your left ear",
      touch_right_ear: "Touch your right ear",
    } as Record<string, string>,
    readCodeNow: "Now read the number aloud",
    // Failure/edge copy — plain, no humour (docs/09)
    cooldown: "That last one didn't pass, so there's a short wait before trying again. Check your email for why.",
    rateLimited: "You've had a few goes today. Try again tomorrow.",
    challengeExpired: "That took too long and the code expired. Let's start again.",
    tooLarge: "That recording came out too big. Try again — it should be well under the limit.",
    fallbackNote: "Your browser can't record video here, so we'll take three quick photos at the prompts instead.",
    pendingStatus: "We've got your recording. A human will review it, usually within a day.",
    rejectedStatus: "Your last try didn't pass. You can record a new one.",
    verifyCta: "Get verified",

    rejectReasons: {
      face_not_clear: "We couldn't see your face clearly enough.",
      actions_not_performed: "The actions we asked for weren't done.",
      code_not_read: "The code on screen wasn't read out.",
      photo_mismatch: "This didn't look like the same person as your photo.",
      suspected_recording: "This looked like a pre-recorded video, not live.",
      other: "Something wasn't right with this one.",
    },
  },

  friends: {
    requestSent: "Sent. If they add you back, you'll see the gigs they post.",
    requestReceived: (name: string, activity: string, date: string) =>
      `${name} wants to add you after ${activity} on ${date}.`,
    requestAccepted: (name: string) =>
      `You and ${name} are friends. Their gigs will show up in your feed.`,
    inviteToGig: (name: string, activity: string, date: string) =>
      `${name} is hosting ${activity} on ${date} and thought you'd be up for it. Slots are first-come — nothing's being held.`,
    listEmpty:
      "No friends yet. Go to a gig, have a good time, add people afterwards.",
  },

  // Errors: say what happened and what to do. No apologies, no humour.
  errors: {
    gig_full: "Someone got the last slot a second before you. There are other gigs on.",
    gig_locked: "Joining closed two hours before the start. Catch the next one.",
    gig_not_open: "This gig isn't taking slots right now.",
    gig_not_found: "That gig's gone.",
    already_in_crew: "You're already in this one.",
    account_restricted: "You can't join gigs right now. We emailed you why.",
    not_authenticated: "Sign in first.",
    residential:
      "That address looks residential. Gigs have to be in a public place — pick a cafe, court, park, or venue.",
    camera_off: "Camera access is off. Turn it on in your browser settings and reload.",
    no_shared_attendance: "You can only add people you've actually been to a gig with.",
    recently_asked: "You've already asked. Give it some time.",
    too_many_pending: "You've got a lot of requests out already. Wait for some answers first.",
    not_available: "That didn't work. Try again later.",
    verification_cooldown: "That last one didn't pass, so there's a short wait before trying again. Check your email for why.",
    verification_rate_limited: "You've had a few goes today. Try again tomorrow.",
    challenge_expired: "That took too long and the code expired. Let's start again.",
    already_submitted: "This one's already in for review.",
    generic: "That didn't work. Try again in a moment.",
  } as Record<string, string>,

  // The face setting — must be exact (docs/09)
  faceSetting:
    "Your face stays off your public profile and the feed. Your crew will still see it once a gig is confirmed — you're meeting these people in person, and you need to be able to find each other. That part isn't optional.",

  // Safety reminder before every gig locks (docs/09)
  safetyReminder:
    "Meet at the venue. Sort your own transport. Tell someone where you're going — there's a share button below. If it feels off, leave. You won't be penalised for it, ever.",

  // The platonic clause — landing page version (docs/09)
  platonicClause: {
    heading: "This is not a dating app.",
    body: "We mean it structurally, not just aspirationally. Every gig needs three people minimum, because three people is not a date. Nobody picks who joins — slots go first-come-first-served, so no host gets to quietly assemble their preferred guest list. And you can't message anyone outside a gig.",
    body2:
      "Come here to play badminton, argue about a film, or find someone to run with at 6am. Come here because doing things alone got old.",
    body3:
      "Now — if you and three strangers play pickleball every Saturday for a year and one of them turns out to be the love of your life, that's genuinely amazeballs and we'll be delighted for you. Send us a photo. Just don't show up hunting for that. People can tell, it wrecks the vibe, and it's the fastest way to get reported.",
    firstGigCheckbox:
      "I get it — this is for making friends, not dates. Groups of three or more, public places, no hitting on the crew.",
  },

  safety: {
    title: "Safety, honestly",
    intro:
      "Here's exactly what we do and don't do. A safety page that oversells is worse than none.",
    // docs/06 § What we are not claiming — the app's own voice
    weCheck: [
      "That a face is real and matches a photo, when someone chooses to verify.",
      "That every gig is three or more people, in a public place.",
      "Reports — a human reads them and acts.",
    ],
    weDont: [
      "Background checks.",
      "Identity documents or NIC verification.",
      "Any guarantee of how someone will behave.",
    ],
    verifiedMeans:
      "Verified means a real person recorded themselves live and a human checked it's the same face as their photo. Nothing about their name, age, or history.",
    meetingTips: [
      "Meet at the venue. Sort your own transport.",
      "Tell someone where you're going — every locked gig has a share button.",
      "If it feels off, leave. You won't be penalised for it, ever.",
    ],
    rules: [
      "Show up. If you can't, leave the gig early so someone else can take the slot.",
      "Three or more, in public. Don't push a group to become a one-on-one.",
      "Don't hit on your crew. Not the point.",
      "Be findable. Your photo has to be you.",
      "No selling. Not your MLM, not your class, not your startup.",
      "18+. No exceptions.",
      "Nobody's owed a slot. First come, first served.",
    ],
  },

  about: {
    title: "What this is",
    body: [
      "Trio is for doing things with people in Colombo. You post a plan — badminton, a film, board games, coffee — and other people claim the open slots. Three minimum. You meet in real life.",
      "The wedge is the activity, not friendship in the abstract. You want to play badminton on Saturday and you need three more people. Friendship is the byproduct.",
      "It's deliberately not a dating app, and it's built that way structurally: no picking who joins, no private messages, groups of three or more only.",
    ],
  },

  legal: {
    termsTitle: "Terms of service",
    termsIntro:
      "Plain-language summary below. This isn't legal advice — a Sri Lankan lawyer reviews the full terms before launch.",
    termsSections: [
      ["Who can use Trio", "18+, one account, an accurate photo that's actually you."],
      ["What Trio is", "A coordination tool. Trio doesn't organise, supervise, or attend gigs and isn't a party to what happens at one."],
      ["What we check", "Liveness only — no background checks, no ID, no identity guarantee. Same wording as the safety page."],
      ["Your conduct", "The community rules, incorporated by reference."],
      ["Meeting in person", "You accept the risk of meeting strangers and the recommended precautions. Our liability is limited to the extent Sri Lankan law permits."],
      ["Content", "You own what you post and grant us a licence to display it. Lobby chat is deleted 30 days after a gig completes."],
      ["Verification media", "Private, deleted 7 days after review, and you can request earlier deletion. Same as the verification page."],
      ["Suspension and termination", "The moderation ladder applies, and every action is appealable by email."],
      ["Payments", "Only relevant once venue partners are billed."],
      ["Changes and governing law", "Governed by the laws of Sri Lanka. Contact us any time."],
    ] as [string, string][],
  },

  landing: {
    heroTitle: "Post a plan.\nThree show up.\nGo do the thing.",
    heroSub:
      "Badminton on Tuesday. Board games Friday. Coffee whenever. You post it, strangers claim the slots, you meet in real life.",
    howItWorks: [
      { n: 1, title: "Post a gig", body: "Pick an activity, a time, a public place, and how many people you want. You take slot one." },
      { n: 2, title: "Slots fill up", body: "Others claim the open slots, first-come. Nobody gets to pick who joins — that's the whole point." },
      { n: 3, title: "Go meet them", body: "Once three are in, it's on. Faces reveal, chat opens, you sort out who's bringing what." },
    ],
    noUsersYet:
      "We're brand new, so we won't pretend thousands of people are already here. Right now it's you and whoever you can talk into going first. That's how these things start.",
    signUpCta: "Get started",
  },
} as const;

/** Map a thrown Postgres exception message to friendly copy. */
export function errorCopy(code: string): string {
  return copy.errors[code] ?? copy.errors.generic;
}
