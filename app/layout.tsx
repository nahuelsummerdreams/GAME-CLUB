import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WonderDays Christmas Game Club",
  description: "Enter the magic of Christmas. Games for kids and families.",
  applicationName: "WonderDays Christmas Game Club",
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
      <body>{children}</body>
    </html>
  );
}
