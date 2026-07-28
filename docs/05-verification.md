# 05 — Verification

## What we're building and what we're not

**Not building:** automated anti-spoof liveness detection. Real liveness (depth analysis, texture analysis, injection-attack detection) needs a specialist SDK — FaceTec, iProov, AWS Rekognition Face Liveness. Out of scope and out of budget for a proof of concept.

**Not building:** ID or NIC verification. Deliberate — the legal position on collecting national ID data is unsettled and we're not taking that on.

**Building:** *challenge–response liveness capture with human review.* The browser records a short video of the user performing randomly assigned actions that they could not have prepared in advance. An admin watches it next to the profile photo and decides. This is the honest scope: it defeats "stole a photo off Instagram", it does not defeat a determined attacker with a virtual camera. That trade is acceptable at this stage and should be stated plainly rather than oversold.

## What Verified actually means

Say this in the UI, exactly this: **a real person recorded themselves live, and a human at Trio checked that it's the same face as their photo.** Nothing about identity, name, age, or criminal history. Over-claiming here is worse than not verifying at all.

Verification is optional. Unverified users can join gigs. Verified users get a badge and, later, access to gigs where the host has ticked "verified crew only". Don't build that filter in v1 — it will strangle liquidity before there's anyone to filter.

## The challenge

Generated server-side, stored on the request row, expires in 10 minutes.

```ts
type Challenge = {
  code: string;                    // 4 digits, shown on screen during recording
  actions: LivenessAction[];       // 2, drawn randomly, ordered
  issuedAt: string;
  expiresAt: string;
};

type LivenessAction =
  | 'turn_head_left' | 'turn_head_right' | 'look_up'
  | 'smile' | 'blink_twice'
  | 'show_fingers_2' | 'show_fingers_3' | 'show_fingers_5'
  | 'touch_left_ear' | 'touch_right_ear';
```

Randomness is the whole security model. Two random actions from ten, plus a 4-digit code the user reads aloud and holds in frame, means a pre-recorded video won't pass. Keep the action list long enough that repeats are rare and short enough that every action is unambiguous on camera.

Rate limit: 3 attempts per user per 24h, enforced server-side. A rejected request must wait 1 hour before a retry.

## Capture (client)

Route: `/me/verify`. Client component, obviously.

1. **Explain first.** Before requesting camera access: what's recorded, who sees it, how long it's kept, that it's deleted after review. Requesting a camera permission cold is hostile.
2. `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640 }, audio: true })`. Audio is on because the user reads the code aloud.
3. Show the live preview at the full width of a card, with the 4-digit code rendered **large and in-frame beside the preview** so the user can read it.
4. Countdown 3 → 2 → 1, then `MediaRecorder` starts. Total 12 seconds: 4s per action prompt, 4s for reading the code. Prompts change on a timer with a mono countdown ring.
5. Stop, show playback, offer **Retake** or **Send for review**.
6. On send: upload the blob to `verification/{user_id}/{request_id}.{ext}` via the authenticated client, then call a server action that writes `media_path` and sets status `pending`.

### Browser gotchas — handle these, they are the actual work

- **HTTPS is required** for `getUserMedia`. Works on `localhost` for dev.
- **Safari does not produce WebM.** Feature-detect the mime type instead of hardcoding:

```ts
const CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/mp4',
];
const mimeType = CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t));
```

  Store the resolved type in `media_mime` so the admin player knows what it's playing.
- **iOS Safari** needs `playsInline` and `muted` on the preview `<video>` or it will try to go fullscreen.
- **Permission denied** is a normal outcome, not an error state. Explain how to re-enable it in browser settings and offer the fallback.
- **Fallback path** — if `MediaRecorder` is unsupported: capture three stills to `<canvas>` at randomly timed prompts and upload as images. Weaker, but better than locking someone out. Mark `media_mime` accordingly so the reviewer knows they're getting the weaker artefact.
- **Cap the upload.** Reject blobs over 20MB client-side; 12s at 640px will be well under.

## Review (admin)

Queue at `/admin/verifications`, oldest first. Each item shows:

- The recording, played from a **60-second signed URL** minted by a server route. Never a public URL, never a long-lived one.
- The user's current profile photo beside it.
- The challenge that was issued — the reviewer needs to know which actions to expect and which code should be spoken. **This is the actual check:** does the person in the video perform the assigned actions and say the assigned code?
- Account age, gig count, existing reports.

Actions: **Approve** · **Reject** (requires selecting a reason) · **Ask for a retake**.

Reject reasons: `face_not_clear`, `actions_not_performed`, `code_not_read`, `photo_mismatch`, `suspected_recording`, `other`. Reason goes to the user in plain language — a rejection with no explanation is the fastest way to lose someone who did nothing wrong.

On approve: `profiles.verification_status = 'verified'`, `verified_at = now()`, email the user.

## Media handling — the part that matters legally

Face recordings are sensitive personal data even without an ID document attached. Treat them accordingly.

- Bucket `verification` is **private**. No client read policy at all. No listing.
- Users can write only to their own prefix. Enforced by storage policy on `(storage.foldername(name))[1] = auth.uid()::text`.
- Admin access only via server-minted signed URLs, max 60s TTL.
- **Auto-purge.** The `purge-verification-media` job deletes the object 7 days after review and stamps `media_purged_at`. What persists is the verdict, the reviewer, the reason, and the timestamp — never the biometric artefact.
- Unreviewed requests older than 30 days are auto-rejected and purged.
- The user can request deletion of their recording at any time; if it's still pending, that cancels the request.
- State the retention period in the privacy copy and in the pre-capture explainer. Same number in both places.

## Honest limitations — put these in the docs, not just the code

Write these down for the human, because the temptation to oversell verification is strong:

1. A virtual camera feeding a prepared video can defeat this. Randomised challenges make it costly, not impossible.
2. Human review is inconsistent at volume. At scale this needs a real vendor.
3. Verified ≠ safe. It means "same face as the photo". Every other safety mechanism still has to do its job.
