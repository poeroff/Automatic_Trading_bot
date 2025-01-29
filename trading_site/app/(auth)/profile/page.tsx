"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/signin");
    }
  }, [session, status, router]); // session과 status가 변경될 때만 실행

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // 리디렉트가 진행 중이므로 아무것도 렌더링하지 않음
  }

  return <div>Profile</div>;
}
