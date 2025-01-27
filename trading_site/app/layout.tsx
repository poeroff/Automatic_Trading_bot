

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./header";




export const metadata: Metadata = {
  title: "TradeSignal",
  description: "Real-time trading alerts and automated signals for smarter investment decisions",
  icons: {
    icon: './test.png',
  }
};

export default function RootLayout({children,}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <Header></Header>
        {children}
      </body>
    </html>
  );
}
