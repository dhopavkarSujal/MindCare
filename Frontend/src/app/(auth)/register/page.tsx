import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a MindCare account for your personal wellbeing space.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <RegisterForm />
    </AuthShell>
  );
}
