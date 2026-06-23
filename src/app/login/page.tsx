import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
export const metadata: Metadata = { title: "Masuk" };
export default function LoginPage() { return <AuthForm mode="login" />; }
