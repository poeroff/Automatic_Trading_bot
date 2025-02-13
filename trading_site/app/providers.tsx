// components/SessionProvider.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSession } from "next-auth/react"; // 클라이언트에서 사용 가능
import { RecoilRoot } from "recoil";
import { Session } from "next-auth";

export interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
  author?: string;
  accessToken?: string;
}

interface SessionContextType {
  session: Session | null;
  updateSession: () => void;
}

// ✅ Context 생성
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// ✅ Provider 컴포넌트
export function SessionProvider({ children, session: initialSession }: { children: ReactNode; session: Session | null }) {
  const [session, setSession] = useState<Session | null>(initialSession);
  // 세션 업데이트 함수
  const updateSession = async () => {
    const newSession = await getSession();
    console.log("new",newSession)
    setSession(newSession as Session);
  };

  return (
    <SessionContext.Provider value={{ session, updateSession }}>
      <RecoilRoot>
      {children}
      </RecoilRoot>
    </SessionContext.Provider>
  );
}

// ✅ 훅: 전역에서 session 사용
export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}
