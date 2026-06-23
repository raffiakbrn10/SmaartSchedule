import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SmartSchedule", template: "%s | SmartSchedule" },
  description: "Kelola tugas, deadline, Google Calendar, dan pengingat Telegram dalam satu tempat.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="id" suppressHydrationWarning><body><AuthProvider>{children}</AuthProvider></body></html>;
}
