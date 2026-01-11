import type { Metadata } from "next";
import { Anton } from "next/font/google";
import "./globals.css";
import { textsTR } from "@/lib/texts.tr";

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: textsTR.meta.title,
  description: textsTR.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${anton.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
