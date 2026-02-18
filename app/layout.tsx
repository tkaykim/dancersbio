import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import LayoutSwitcher from "@/components/layout/LayoutSwitcher";
import PushNotificationProvider from "@/components/push/PushNotificationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <AuthProvider>
          <PushNotificationProvider>
            <LayoutSwitcher>{children}</LayoutSwitcher>
          </PushNotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

