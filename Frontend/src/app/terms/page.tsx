import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>To be completed before launch. It should state clearly that:</p>
      <ul>
        <li>MindCare offers supportive wellbeing tools and is not a medical or emergency service;</li>
        <li>the AI companion does not diagnose or treat any condition;</li>
        <li>anyone in immediate danger should contact local emergency services or a trusted person.</li>
      </ul>
    </LegalPage>
  );
}
