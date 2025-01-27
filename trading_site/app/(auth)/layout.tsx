import React from "react"

export const metadata = {
  title: 'Login',
  description: '웹사이트 설명',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  );
}