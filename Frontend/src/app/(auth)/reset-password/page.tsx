import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/features/password-pages";
export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };
export default function ResetPasswordRoute() { return <ResetPasswordForm />; }
