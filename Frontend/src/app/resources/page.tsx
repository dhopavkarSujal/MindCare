import type { Metadata } from "next";
import { PublicResourcesPage } from "@/components/features/resources-pages";
export const metadata: Metadata = { title: "Wellbeing resources", description: "A small library of wellbeing resources from established health organisations." };
export default function ResourcesRoute() { return <PublicResourcesPage />; }
