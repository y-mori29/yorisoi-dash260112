import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareVoice Rec",
  description: "A nursing care recording application",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}