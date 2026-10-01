import { brand } from "@/lib/brand";
import type { LegalSection } from "./index";

const N = brand.name;

export const privacy: { intro: string; sections: LegalSection[] } = {
  intro: `This policy explains what personal data ${N} collects, why, who we share it with, how long we keep it, and the rights you have, including under Sri Lanka's Personal Data Protection Act, No. 9 of 2022 ("PDPA"). ${N} is the controller of your personal data.`,
  sections: [
    {
      id: "collect",
      title: "1. What we collect",
      body: [
        [
          "Account details: name, username, email address, password (stored only as a secure hash by our authentication provider), date of birth and gender.",
          "Profile: your photo, bio, and city. We show other users your first name, age (never your birthday), gender, approved photo and badges.",
          "Photo checks: when you choose a profile photo, a face detector runs on your own device. We store its result (how many faces and how confident) to help our reviewers. The photo itself is reviewed by a person.",
          "Verification video (optional): a short video of your face and voice, the challenge you were given, and basic device information. This is biometric-type data and we treat it as sensitive.",
          "Activity: gigs you host or join, invites, check-ins, reliability outcomes, friend connections and blocks.",
          "Messages: what you write in gig group chats.",
          "Safety records: reports you make or that are made about you, crew votes and their reasons, and any moderation actions.",
          "Technical data: IP address, browser/device type and logs kept by our hosting providers for security; a session cookie that keeps you signed in; and small items in your browser's storage (for example whether you dismissed the install prompt).",
        ],
        "We don't collect your precise location, contacts, or payment card details, and we don't use advertising trackers.",
      ],
    },
    {
      id: "why",
      title: "2. Why we use it (and our legal basis)",
      body: [
        [
          "To provide the Service: create your account, show you gigs whose age range and audience include you, run group chats, handle invites (performance of our contract with you).",
          "To keep people safe: review photos, verify liveness, investigate reports and crew votes, prevent fraud and abuse, enforce our Terms (our legitimate interests and your consent where required).",
          "Verification videos and photo review: only with your consent, which you give by starting the process. You can withdraw it at any time.",
          "To send service messages: gig updates and account notices (performance of contract).",
          "To meet legal obligations and respond to lawful requests from authorities.",
        ],
        "We don't sell your personal data, and we don't use it for advertising.",
      ],
    },
    {
      id: "share",
      title: "3. Who we share it with",
      body: [
        [
          "Other users: only what the app shows: on the discover feed nobody's identity is shown; once you're in a gig, its members see your first name, age, gender, approved photo, badges and chat messages. Hosts' first names are shown on gig previews.",
          "Service providers who process data for us under contract: Supabase (database, authentication, file storage and realtime chat, hosted in the Asia-Pacific (Mumbai) region), our web hosting provider, and Google Maps Platform (venue search and maps; we send it search text, not your identity).",
          "The face-detection software is downloaded from a public code CDN (jsDelivr) but runs entirely on your device; your photos and video are not sent to it.",
          "Authorities: when required by law, or where we believe disclosure is necessary to prevent serious harm.",
          "A successor: if Tremigos is merged or sold, subject to this policy.",
        ],
      ],
    },
    {
      id: "transfers",
      title: "4. International transfers",
      body: [
        "Some of our providers store or process data outside Sri Lanka (for example in India and other countries where their infrastructure is). Where we transfer data abroad we rely on contractual safeguards and providers with recognised security standards, as permitted under the PDPA.",
      ],
    },
    {
      id: "retention",
      title: "5. How long we keep it",
      body: [
        [
          "Verification videos: deleted 7 days after review (unreviewed requests are closed after 30 days). We keep only the outcome, date and reviewer.",
          "Rejected or replaced profile photos: deleted when rejected or replaced.",
          "Group chats: deleted 30 days after the gig ends.",
          "Account and profile: until you delete your account.",
          "Safety and moderation records (reports, removals, crew votes, admin actions): kept after account deletion with your account reference removed, for as long as needed to keep the community safe and meet legal obligations.",
          "Server logs: kept by our providers for a limited period for security.",
        ],
      ],
    },
    {
      id: "rights",
      title: "6. Your rights",
      body: [
        "Under the PDPA you can ask us to:",
        [
          "give you access to and a copy of your personal data;",
          "correct inaccurate data (you can edit most of your profile yourself; contact us to change your date of birth or gender);",
          "delete your data: use “Delete account” on your profile, or email us;",
          "withdraw consent (for example to verification processing) at any time;",
          "object to or restrict certain processing; and",
          "review a decision made about you.",
        ],
        `Email ${brand.privacyEmail}. We'll respond within the time the law requires and may need to confirm your identity. If you're unhappy with our response you can complain to the Data Protection Authority of Sri Lanka.`,
      ],
    },
    {
      id: "security",
      title: "7. Security",
      body: [
        "We use encryption in transit, row-level access rules in our database so people can only read what they're allowed to see, a private storage bucket for verification videos (viewable only by reviewers through links that expire within a minute), and audit logs for every admin action. No system is perfectly secure; if we learn of a breach affecting you we'll tell you and the authorities as required by law.",
      ],
    },
    {
      id: "children",
      title: "8. Children",
      body: ["The Service is only for people aged 18 and over. We don't knowingly collect data from anyone younger and will delete it if we find out."],
    },
    {
      id: "cookies",
      title: "9. Cookies and local storage",
      body: [
        "We only use cookies that are strictly necessary to keep you signed in and secure. The installable app stores some files on your device (a service worker cache) so it loads quickly and can show an offline page. We don't use analytics or advertising cookies.",
      ],
    },
    {
      id: "changes",
      title: "10. Changes to this policy",
      body: ["If we make significant changes we'll let you know in the app before they apply. The date at the top shows when this policy was last updated."],
    },
    {
      id: "contact",
      title: "11. Contact",
      body: [`Privacy questions or requests: ${brand.privacyEmail}. General support: ${brand.supportEmail}.`],
    },
  ],
};
