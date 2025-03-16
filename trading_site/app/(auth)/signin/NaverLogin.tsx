/// 네이버 로그인 
"use client"

import { signIn } from "next-auth/react"

const NaverLogin = () => {
    const handleNaverLogin = async (e: React.MouseEvent) => {
        e.preventDefault()
        await signIn("naver", { callbackUrl: "/" })
    }
    return <>
        <button
            onClick={handleNaverLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#03C75A] rounded-lg p-3 text-white hover:bg-[#03C75A]/90 transition-all duration-200 shadow-sm hover:scale-[1.01] active:scale-[0.99]"
        >
            <div className="w-6 h-6">
                <svg className="w-6 h-6" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 5.32v9.36h4l4-5.17v5.17h4V5.32h-4l-4 5.17V5.32H4z" fill="#ffffff" />
                </svg>
            </div>
            <span className="font-medium">네이버 로그인</span>
        </button>
    </>


}

export default NaverLogin;

