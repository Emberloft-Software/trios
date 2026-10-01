import { LegalPage } from "@/components/marketing/LegalPage";
import { LEGAL_UPDATED, terms } from "@/lib/legal";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return <LegalPage title="Terms of Service" updated={LEGAL_UPDATED} intro={terms.intro} sections={terms.sections} />;
}
