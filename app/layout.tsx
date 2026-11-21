import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/navigation/PwaRegister";

export const metadata: Metadata = {
  title: "WonderDays Christmas Game Club",
  description: "Enter the magic of Christmas. Games for kids and families.",
  applicationName: "WonderDays Christmas Game Club",
  appleWebApp: { capable: true, title: "WonderDays", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#174B3C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body>{children}<PwaRegister /></body>
    </html>
  );
}
