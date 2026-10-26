import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy notice" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy notice">
      <p>To be completed before launch. It should explain, in plain language:</p>
      <ul>
        <li>which data MindCare stores (account details, mood check-ins, conversations) and why;</li>
        <li>who can access it, and how long it is kept;</li>
        <li>how students can export or delete their data;</li>
        <li>how conversation text is processed by the AI service.</li>
      </ul>
    </LegalPage>
  );
}
