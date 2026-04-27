import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import LayoutSwitcher from "@/components/layout/LayoutSwitcher";
import { ToastProvider } from "@/components/push/ToastContext";
import PushNotificationProvider from "@/components/push/PushNotificationProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const inter = Inter({
  variable: "--font-cue-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Mono is retained only for tabular numerals (prices, D-day) — not for labels.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-cue-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Dancers.bio - Professional Dancer Portfolio",
  description: "Connect with professional dancers and choreographers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[var(--cue-bg)] text-[var(--cue-ink)]`}
      >
        <AuthProvider>
          <ToastProvider>
            <PushNotificationProvider>
              <LayoutSwitcher>{children}</LayoutSwitcher>
            <Analytics />
            </PushNotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
