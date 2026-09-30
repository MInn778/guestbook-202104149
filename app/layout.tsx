import type { Metadata } from "next";
import { Gaegu, Gowun_Dodum } from "next/font/google";
import "./globals.css";

// Korean glyphs aren't a preloadable subset; the fonts still load via unicode-range.
const hand = Gaegu({ variable: "--font-gaegu", weight: ["400", "700"], subsets: ["latin"], preload: false });
const body = Gowun_Dodum({ variable: "--font-gowun", weight: "400", subsets: ["latin"], preload: false });

export const metadata: Metadata = {
  title: "미니 방명록",
  description: "개발자: 김민혁-202104149",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${hand.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
