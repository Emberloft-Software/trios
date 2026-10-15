import { brand } from "@/lib/brand";

/** Acceptable-use agreement shown once to every account (AcceptableUseGate). */
export const conductCopy = {
  conduct: {
    title: "Before you continue",
    intro: `${brand.name} exists to help people meet in groups for genuine shared activities in public places. By using it you agree to use it only for that purpose.`,
    listTitle: "You agree not to use it to:",
    rules: [
      "arrange, promote or facilitate anything illegal, including the sale or use of drugs or weapons;",
      "solicit sexual services, seek sexual encounters, or send sexual content;",
      "scam, defraud or ask other members for money, banking details, one-time codes or investments;",
      "harass, threaten, intimidate, stalk or discriminate against anyone;",
      "impersonate someone, misrepresent your age or identity, or create more than one account;",
      "collect other members' personal information or move them to private channels for any of the above.",
    ],
    monitoring:
      "To keep members safe, group chat messages are automatically screened for abusive, sexual, threatening and fraudulent content. Flagged messages are reviewed by our moderators, who may remove messages, remove people from gigs, or restrict or close accounts.",
    reporting: "Breaches may be reported to the relevant authorities where the law requires or where someone's safety is at risk.",
    termsLink: "Read the full Terms of Use",
    agree: "I understand and agree to use the app responsibly",
    continue: "Agree and continue",
    failed: "That didn't save. Try again.",
  },
} as const;
