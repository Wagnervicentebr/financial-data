import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/design-system/forgot-password-form";

export const metadata: Metadata = {
  title: "Esqueci minha senha — Casca Premium",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
