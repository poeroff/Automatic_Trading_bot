"use client"; // ✅ 클라이언트 컴포넌트로 강제

import { SessionProvider } from "next-auth/react";
import { RecoilRoot } from "recoil";

interface Props {
  children: React.ReactNode;
  session: any;
}

export default function Providers({ children, session }: Props) {
  return (
    <SessionProvider session={session}>
      <RecoilRoot>{children}</RecoilRoot>
    </SessionProvider>
  );
}
