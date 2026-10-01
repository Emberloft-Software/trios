import { LegalPage } from "@/components/marketing/LegalPage";
import { LEGAL_UPDATED, privacy } from "@/lib/legal";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated={LEGAL_UPDATED} intro={privacy.intro} sections={privacy.sections} />;
}
