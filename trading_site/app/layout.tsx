

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/header";

import { getServerSession } from "next-auth";
import Providers from "./providers";


export const metadata: Metadata = {
  title: "TradeSignal",
  description: "Real-time trading alerts and automated signals for smarter investment decisions",
  icons: {
    icon: './test.png',
  }
};
export default async function RootLayout({children,}: {children: React.ReactNode;}) {
  const session = await getServerSession();
  
  return (
    <html lang="en">
      <body>
        
        <Providers session={session}>
          <Header></Header>
        
          {children}
        </Providers>
      </body>
    </html>
  );
}
