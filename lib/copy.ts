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

  auth: {
    signInTitle: "Welcome back",
    signUpTitle: "Make an account",
    name: "Your name",
    namePlaceholder: "First name is fine",
    username: "Username",
    usernamePlaceholder: "e.g. chanka",
    usernameHint: "Letters, numbers and underscores. This is how you'll be @-known.",
    email: "Email",
    password: "Password",
    passwordHint: "At least 8 characters.",
    signInCta: "Sign in",
    signUpCta: "Create account",
    working: "One sec…",
    toggleToSignUp: "New here? Make an account",
    toggleToSignIn: "Already have an account? Sign in",
    confirmEmail: "Almost there — check your email to confirm, then sign in.",
    errors: {
      username_taken: "That username's taken. Try another.",
      username_format: "Usernames are 3–20 characters: letters, numbers, underscores.",
      bad_credentials: "That email or password isn't right.",
      email_in_use: "There's already an account with that email. Sign in instead.",
      weak_password: "Use at least 8 characters.",
      generic: "That didn't work. Try again in a moment.",
    } as Record<string, string>,
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
    mustAgree: "Tick the box to say you get what Trio's for.",
    needTime: "Pick a date and time first.",
    needVenue: "Pick a venue from the search.",
    perkTitle: "Perk for your crew",
    redeem: "Redeem",
    redeemed: "Redeemed",
  },

  // Create-gig flow (docs/03)
  newGig: {
    heading: "Post a gig",
    pickActivity: "Pick an activity",
    title: "Title",
    titlePlaceholder: "Sunday doubles at Havelock",
    when: "When",
    length: "Length (min)",
    where: "Where",
    costNote: "Cost note (optional)",
    costPlaceholder: "Court fee ~LKR 800 split",
    notes: "Notes (optional)",
    notesPlaceholder: "Bring your own racket if you have one.",
    howMany: "How many people",
    howManyHint: "You take slot one. Minimum three, max twelve.",
    submit: "Post the gig",
    submitting: "Posting…",
  },

  // Lobby section headers + join copy
  lobby: {
    whenWhere: "When & where",
    crew: "Crew",
    join: "See who else is in",
    joinHint: "Slots are first-come. Join and you'll see who else is in.",
    leaving: "Leaving?",
    somethingCameUp: "Something came up",
    didntFeelComfortable: "I didn't feel comfortable",
    leaveHint: "The second door never costs you anything, at any time. It quietly flags this to us.",
    neverMind: "Never mind",
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
    title: "Friends",
    yourFriends: "Your friends",
    incoming: "Wants to add you",
    outgoing: "You asked",
    outgoingHint: "Waiting to hear back. You'll know if they add you — and only then.",
    add: "Add",
    added: "Request sent",
    accept: "Add back",
    unfriend: "Unfriend",
    invite: "Invite a friend",
    inviteSent: "Invited",
    summaryTitle: "You did this together",
    summaryHint: "Had a good time with someone? Add them. You can only add people you actually met here.",
    // docs/09 — put this on the friends page so support doesn't answer it 50x
    whyNoDms: {
      heading: "Why can't I message my friends directly?",
      body: "Because every conversation here happens with at least three people in it, and that's on purpose. Private message threads are how a friendship app quietly turns into a dating app, and how people end up in one-on-one conversations they didn't sign up for.",
      body2: "Adding someone as a friend means their gigs show up in your feed and you can pull them into yours. If you want to talk to them, post a plan and go do something. That's sort of the entire idea.",
      body3: "If you two want to swap numbers at the gig, that's between you.",
    },
    fromFriends: "From your friends",
  },

  // Trust & safety surfaces (docs/06)
  trust: {
    report: {
      title: "Report someone",
      intro: "This goes to Trio only. It's never shown to the person you're reporting, and never to the rest of the crew.",
      pickPerson: "Who is this about?",
      category: "What happened?",
      details: "Tell us a bit more",
      detailsPlaceholder: "What happened, and when.",
      submit: "Send report",
      sent: "Thanks. A person at Trio will look into it.",
      categories: {
        harassment: "Harassment",
        sexual_advance: "Someone came onto me",
        pressured_private_meeting: "Pushed to meet one-on-one",
        venue_changed_to_private: "Tried to move it somewhere private",
        no_show: "Didn't show up",
        impersonation: "Not who their photo says",
        underage: "Seems under 18",
        spam_or_promo: "Selling or promoting something",
        threat_or_violence: "Threat or violence",
        other: "Something else",
      } as Record<string, string>,
    },
    block: {
      action: "Block",
      confirmTitle: "Block this person?",
      confirmBody: "You won't see each other's gigs again, and neither of you can join a gig the other is in. They won't be told. You can undo this later.",
      confirm: "Block them",
      cancel: "Never mind",
      done: "Done. You won't cross paths here again.",
    },
    remove: {
      action: "Remove",
      title: "Remove someone from your gig",
      intro: "Removals are logged and reviewed. Use this for a real problem, not because you'd rather someone else joined.",
      category: "Why?",
      reason: "Add a short reason (the crew member sees the category, not your words)",
      reasonPlaceholder: "At least ten characters.",
      submit: "Remove from gig",
      categories: {
        no_show_pattern: "Keeps not showing up",
        abusive_in_chat: "Abusive in chat",
        pushing_for_one_on_one: "Pushing to meet one-on-one",
        misrepresented_themselves: "Not who they said they were",
        safety_concern: "Safety concern",
        other: "Something else",
      } as Record<string, string>,
    },
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
    capacity_too_low: "A gig needs at least three slots.",
    starts_too_soon: "Give people time to see it — pick a start at least 3 hours from now.",
    starts_too_far: "That's too far out. Keep it within the next 60 days.",
    profile_missing: "Your profile isn't set up yet. Reload and try again.",
    posting_restricted: "You can't host gigs right now. Check your email.",
    reason_too_short: "Add a bit more — at least ten characters.",
    already_removed_from_gig: "You've already removed someone from this gig.",
    removal_limit_reached: "You've hit the removal limit for this month. If there's a real problem, email us.",
    cannot_report_self: "You can't report yourself.",
    details_required: "Add a short description.",
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

  spot: {
    title: "Trio crew perk",
    intro: "A Trio crew here? Enter their gig code to log the visit.",
    codeLabel: "Gig code",
    submit: "Log the visit",
    done: "Logged. Thanks — that helps us prove we're sending you people.",
    errors: {
      venue_not_found: "We couldn't find this venue.",
      gig_not_found: "No crew found for that code here. Check it and try again.",
      already_redeemed: "This one's already been logged.",
      generic: "That didn't work. Try again.",
    } as Record<string, string>,
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
