import { brand } from "@/lib/brand";
import type { LegalSection } from "./index";

const N = brand.name;

export const terms: { intro: string; sections: LegalSection[] } = {
  intro: `These Terms are an agreement between you and ${N} ("we", "us"). They cover your use of the ${N} website and installable app (the "Service"). By creating an account you agree to them. Please also read our Privacy Policy and Safety page They're part of how the Service works.`,
  sections: [
    {
      id: "eligibility",
      title: "1. Who can use Tremigos",
      body: [
        [
          "You must be at least 18 years old. We refuse sign-ups under 18 and remove accounts we believe belong to minors.",
          "One account per person. Your account is personal, so don't share it or sell it.",
          "The name, date of birth and gender you give us must be true. Hosts rely on them to set who can join their gigs.",
          "Your profile photo must be a recent, clear photo of you and only you.",
          "You can't use the Service if we've previously banned you, or if you're legally barred from doing so.",
        ],
      ],
    },
    {
      id: "what",
      title: "2. What Tremigos is (and isn't)",
      body: [
        `${N} is a tool that helps people find others for group activities ("gigs") in public places. We don't organise, host, supervise, attend, insure or vouch for any gig, venue or person. We are not a party to anything that happens between users, at a venue, or after you leave the Service.`,
        `${N} is not a dating service. Gigs need at least three people, there are no private messages, and using the Service to pursue romantic or sexual contact is against these Terms.`,
      ],
    },
    {
      id: "safety",
      title: "3. Meeting people: your responsibility",
      body: [
        "Meeting people you don't know carries real risk. You're responsible for your own safety and your own decisions. In particular:",
        [
          "Only meet at the public venue listed for the gig, and arrange your own transport.",
          "Tell someone you trust where you're going and who with.",
          "Don't share personal phone numbers, home addresses, financial details or social media handles in chat. Anything you share, and any contact you take off Tremigos, is entirely at your own risk.",
          "Don't open links other users send you. We can't check where they lead, and opening them is at your own risk.",
          "Where a host says they are bringing friends, the group may include people who already know each other. Joining such a gig is at your own risk.",
          "Leave any situation that feels wrong. Leaving through “I didn't feel comfortable” never counts against you.",
        ],
        "In an emergency, contact local emergency services first (in Sri Lanka: Police 119, Suwa Seriya ambulance 1990), then tell us.",
      ],
    },
    {
      id: "verification",
      title: "4. Photo review and verification",
      body: [
        "Profile photos are checked by our team (helped by an automatic face check that runs on your device) before other users can see them. Optional live video verification shows that a real person matched their photo at that moment.",
        "Neither check is a background check, an identity check, or a guarantee of how anyone will behave. A verified badge only means what we say it means on the Safety page.",
      ],
    },
    {
      id: "gigs",
      title: "5. Hosting and joining gigs",
      body: [
        [
          "Hosts must list a real public place, a real time, and honest details, including any costs.",
          "Hosts may limit a gig to an age range and to women or men. Hosts must fit their own audience. These settings must not be used to harass, exclude for a discriminatory reason not offered by the Service, or target any person.",
          "Hosts who say they're bringing people must be truthful about how many. Anyone joining through a host's invite link still needs their own account and must follow these Terms.",
          "Spots are first-come. Nobody is owed a spot.",
          "If you can't make it, leave the gig as early as possible. Repeated no-shows lower your reliability and can restrict your account.",
          "Any money you agree to split (court fees, tickets, food) is between you and the other people. We don't process or guarantee payments between users.",
        ],
      ],
    },
    {
      id: "conduct",
      title: "6. Rules of conduct",
      body: [
        "You agree not to:",
        [
          "harass, threaten, bully, stalk, intimidate or abuse anyone, on or off the Service;",
          "make unwanted romantic or sexual advances, or pressure anyone into one-on-one meetings;",
          "pressure anyone to share contact details or move to another app;",
          "post anything hateful, sexually explicit, violent, defamatory, illegal, or that infringes someone else's rights;",
          "advertise, sell, recruit, solicit money, run promotions or post spam or scam links;",
          "impersonate anyone, use someone else's photo, or misrepresent your age or gender;",
          "use the Service if you're under 18, or bring anyone under 18 to a gig arranged through it;",
          "scrape, copy or harvest data, reverse engineer the Service, interfere with its security, or create accounts by automated means;",
          "use the Service for any unlawful purpose.",
        ],
      ],
    },
    {
      id: "moderation",
      title: "7. Reports, crew votes and moderation",
      body: [
        "You can report anyone at any time; reports go only to our team. Once a gig's group chat is open, its members can vote to remove someone for bad behaviour. If a majority of the other members agree, that person is removed from the gig and our team reviews what happened.",
        "We may, at our discretion and without notice where safety requires it, warn you, limit what you can do, remove content, remove you from a gig, suspend or permanently ban your account. We can also act on behaviour that happens off the Service if it affects the safety of our users. You can appeal any action by emailing us.",
      ],
    },
    {
      id: "content",
      title: "8. Your content",
      body: [
        "You keep ownership of what you post (profile details, photos, gig descriptions, messages). You give us a non-exclusive, worldwide, royalty-free licence to host, store, display and process it only to run and improve the Service and keep it safe. This licence ends when your content is deleted, except where we must keep records for safety or legal reasons.",
        "Group chats are deleted 30 days after a gig ends. Verification recordings are deleted 7 days after review.",
      ],
    },
    {
      id: "termination",
      title: "9. Ending your account",
      body: [
        "You can delete your account at any time from your profile. We may suspend or close accounts that break these Terms or put others at risk. Some records (for example reports and moderation history) are kept after deletion without your name, as described in the Privacy Policy.",
      ],
    },
    {
      id: "disclaimers",
      title: "10. Disclaimers",
      body: [
        "The Service is provided “as is” and “as available”. To the fullest extent permitted by law we make no warranties of any kind, including that the Service will be uninterrupted or error-free, or about the conduct, identity, intentions or suitability of any user, venue or third-party service (such as Google Maps).",
      ],
    },
    {
      id: "liability",
      title: "11. Limitation of liability",
      body: [
        `To the fullest extent permitted by the laws of Sri Lanka, ${N} and its team will not be liable for any indirect, incidental, special or consequential loss, or for any loss or harm arising from your interactions or meetings with other users, from venues, or from content or links shared by users. Where liability can't be excluded, our total liability is limited to LKR 10,000. Nothing in these Terms limits liability that cannot be limited by law, including for death or personal injury caused by our negligence or for fraud.`,
      ],
    },
    {
      id: "indemnity",
      title: "12. Your responsibility to us",
      body: [
        `You agree to compensate ${N} for claims, losses and reasonable costs arising from your breach of these Terms or your misuse of the Service, to the extent permitted by law.`,
      ],
    },
    {
      id: "changes",
      title: "13. Changes",
      body: [
        "We may update these Terms as the Service changes. If a change is significant we'll tell you in the app before it takes effect. Continuing to use the Service after that means you accept the updated Terms.",
      ],
    },
    {
      id: "law",
      title: "14. Governing law",
      body: [
        "These Terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka. The courts of Colombo have jurisdiction over any dispute, without limiting any rights you have as a consumer.",
      ],
    },
    {
      id: "contact",
      title: "15. Contact",
      body: [`Questions about these Terms: ${brand.supportEmail}. Safety concerns: ${brand.safetyEmail}.`],
    },
  ],
};
