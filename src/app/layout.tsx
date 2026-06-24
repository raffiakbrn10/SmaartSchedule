import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { MouseGlow } from "@/components/MouseGlow";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SmartSchedule", template: "%s | SmartSchedule" },
  description: "Kelola tugas, deadline, dan Google Calendar dalam satu tempat dengan tampilan modern.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <MouseGlow />
        </AuthProvider>
      </body>
    </html>
  );
}
