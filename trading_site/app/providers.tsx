"use client";

import { SessionProvider } from "next-auth/react";
import { getServerSession, Session } from "next-auth";
import { BrowserRouter } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  session: Session | null;
}

export default  function Providers({ children, session }: Props) {
  
  return <BrowserRouter><SessionProvider session={session}>{children}</SessionProvider></BrowserRouter>;
}
