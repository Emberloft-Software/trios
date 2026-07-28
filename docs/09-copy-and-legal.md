# 09 — Copy and legal

All user-facing strings live in `lib/copy.ts`. No inline strings in JSX.

## Voice

Warm, plain, a bit funny, never cute about safety.

- Sentence case. Contractions. Short sentences.
- Say what happens: "Take a slot", not "Submit request".
- The same verb all the way through a flow. If the button says "Take a slot", the toast says "Slot taken", and the state is "You're in".
- Jokes belong in empty states, the landing page, and the platonic clause. **Never** in errors, safety copy, verification, or moderation. A joke in a rejection message is cruelty with a smiley face on it.
- Never Sri-Lanka-cosplay. No "aiyo", no forced local slang. Colombo readers spot it instantly.
- No exclamation marks in system messages. One per page maximum anywhere.

## Key strings

**Product line:** Post a plan. Three people minimum. Go do the thing.

**Empty feed:** "Nothing on yet. Someone has to go first — might as well be you." + Post a gig

**Empty feed, filtered:** "No {activity} gigs coming up. Post one and see who bites."

**Gig confirmed:** "That's three. It's happening."

**Lock notice:** "Crew's final. Address is below. See you there."

**Under-filled cancel:** "This one didn't fill in time, so it's off. Not your fault — there just weren't enough people around. Here's what else is on this week." *(Never imply the host failed.)*

**Someone leaves before lock:** "{Name} dropped out. Slot's open again."

**Verification pending:** "Sent. A human at Trio will watch it — usually within a day."

**Verification approved:** "You're verified. Your badge is on your profile."

**Slot taken by someone else:** "Someone got the last slot a second before you. There are other gigs on."

**Chat before confirmation (1 of 3):** "Chat opens when three people are in. Two more to go."

**Chat before confirmation (2 of 3):** "One more person and this is on. Chat opens then too."

**Chat opens:** "Three of you. Chat's open — sort out who's bringing what."

**Friend request sent:** "Sent. If they add you back, you'll see the gigs they post."

**Friend request received:** "{Name} wants to add you after {activity} on {date}."

**Friend request accepted:** "You and {Name} are friends. Their gigs will show up in your feed."

**Friend invite to a gig:** "{Name} is hosting {activity} on {date} and thought you'd be up for it. Slots are first-come — nothing's being held."

**Friend list empty:** "No friends yet. Go to a gig, have a good time, add people afterwards."

## Errors

Say what happened and what to do. No apologies, no vagueness, no humour.

- "Joining closed two hours before the start. Catch the next one." *(not: "Oops! Something went wrong.")*
- "That address looks residential. Gigs have to be in a public place — pick a cafe, court, park, or venue."
- "You can't join gigs right now. We emailed you why."
- "Camera access is off. Turn it on in your browser settings and reload."
- "You can only add people you've actually been to a gig with." *(`no_shared_attendance`)*
- "You've already asked. Give it some time." *(`recently_asked` — never says they declined.)*
- "You've got a lot of requests out already. Wait for some answers first." *(`too_many_pending`)*
- "That didn't work. Try again later." *(`not_available` — the deliberately vague one. It covers blocks, and it must stay vague.)*

## The face setting — must be exact

When a user toggles `face_visible` off:

> Your face stays off your public profile and the feed. **Your crew will still see it once a gig is confirmed** — you're meeting these people in person, and you need to be able to find each other. That part isn't optional.

## The safety reminder (before every gig locks)

> Meet at the venue. Sort your own transport. Tell someone where you're going — there's a share button below. If it feels off, leave. You won't be penalised for it, ever.

## The platonic clause

Goes on the landing page, in the terms, and as a one-time confirmation on a user's first gig. This is the tone the brief asked for.

**Landing page version:**

> ### This is not a dating app.
>
> We mean it structurally, not just aspirationally. Every gig needs three people minimum, because three people is not a date. Nobody picks who joins — slots go first-come-first-served, so no host gets to quietly assemble their preferred guest list. And you can't message anyone outside a gig.
>
> Come here to play badminton, argue about a film, or find someone to run with at 6am. Come here because doing things alone got old.
>
> Now — if you and three strangers play pickleball every Saturday for a year and one of them turns out to be the love of your life, that's genuinely amazeballs and we'll be delighted for you. Send us a photo. Just don't show up *hunting* for that. People can tell, it wrecks the vibe, and it's the fastest way to get reported.

**First-gig checkbox:**

> I get it — this is for making friends, not dates. Groups of three or more, public places, no hitting on the crew.

## Terms of service — sections to include

Not legal advice; get a Sri Lankan lawyer to review before launch. Structure:

1. **Who can use Trio** — 18+, one account, accurate photo.
2. **What Trio is** — a coordination tool. Trio doesn't organise, supervise, or attend gigs and isn't a party to what happens at one.
3. **What we check and what we don't** — liveness only; no background checks, no ID, no identity guarantee. Word this identically to the safety page.
4. **Your conduct** — the community rules below, incorporated by reference.
5. **Meeting in person** — the user accepts the risk of meeting strangers; the recommended precautions; Trio's liability limited to the extent permitted by Sri Lankan law.
6. **Content** — you own what you post; you grant a licence to display it; lobby chat is deleted 30 days after a gig completes.
7. **Verification media** — what's collected, that it's private, that it's deleted 7 days after review, how to request earlier deletion. Match `05-verification.md` exactly.
8. **Suspension and termination** — the moderation ladder, and the appeal route.
9. **Payments** — only relevant once venue partners are billed. Keep a stub.
10. **Changes, governing law (Sri Lanka), contact.**

Also needed: a privacy notice covering location data, camera access, retention periods, Supabase as processor, and Google Maps as a third party.

## Community rules

Short and enforceable — these map to the report categories in `06-trust-and-safety.md`.

1. **Show up.** If you can't, leave the gig early so someone else can take the slot.
2. **Three or more, in public.** Don't push a group to become a one-on-one, and don't try to move it somewhere private.
3. **Don't hit on your crew.** Not the point. See the clause above.
4. **Be findable.** Your photo has to be you.
5. **No selling.** Not your MLM, not your class, not your startup.
6. **18+.** No exceptions.
7. **Nobody's owed a slot.** First come, first served, including when it doesn't go your way.

## Why there are no DMs — the explainer

Users will ask. Put this on the friends page so support doesn't answer it fifty times:

> ### Why can't I message my friends directly?
>
> Because every conversation here happens with at least three people in it, and that's on purpose. Private message threads are how a friendship app quietly turns into a dating app, and how people end up in one-on-one conversations they didn't sign up for.
>
> Adding someone as a friend means their gigs show up in your feed and you can pull them into yours. If you want to talk to them, post a plan and go do something. That's sort of the entire idea.
>
> If you two want to swap numbers at the gig, that's between you.
