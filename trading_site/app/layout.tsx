import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Providers from "./providers"; // ✅ 클라이언트 컴포넌트
import Header from "../components/header";
import "./globals.css";



export const metadata: Metadata = {
  title: "TradeSignal",
  description: "Real-time trading alerts and automated signals for smarter investment decisions",
  icons: {
    icon: "./test.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(); // ✅ 서버 컴포넌트

  return (
    <html lang="en">
      <body>
        <Providers session={session}>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
