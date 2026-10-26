import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/features/password-pages";
export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };
export default function ForgotPasswordRoute() { return <ForgotPasswordForm />; }
