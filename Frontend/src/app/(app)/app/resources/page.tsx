import type { Metadata } from "next";
import { AppResourcesPage } from "@/components/features/resources-pages";

export const metadata: Metadata = {
  title: "Wellbeing library",
  description: "Browse wellbeing resources available through MindCare.",
};

export default function AppResourcesRoute() {
  return <AppResourcesPage />;
}
