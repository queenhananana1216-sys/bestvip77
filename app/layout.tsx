import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_KR, Noto_Sans_TC } from "next/font/google";
import { SessionActivityPing } from "@/components/auth/SessionActivityPing";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const noto = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-tc",
  display: "swap",
});

const notoKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-kr",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "bestvip77",
  description: "Advertising portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`${noto.variable} ${notoKr.variable} ${dmSans.variable}`}>
      <body
        className="font-sans antialiased"
        style={{
          fontFamily: "var(--font-noto-tc), var(--font-noto-kr), var(--font-dm), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <SessionActivityPing />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
