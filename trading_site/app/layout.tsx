import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { SessionProvider } from "./providers";
import Header from "../components/header";
import "./globals.css";
import { useEffect } from "react";
import { authOptions } from "./authOptions";
import { useRecoilState } from "recoil";



export const metadata: Metadata = {
  title: "TradeSignal",
  description: "Real-time trading alerts and automated signals for smarter investment decisions",
  icons: {
    icon: "./test.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions); // ✅ 서버 컴포넌트
  // getSessionServer(session?.user.name || "None",session?.user.email || "None",session?.user.author || "None");

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
