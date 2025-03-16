"use client"
import { signIn } from "next-auth/react"

const KaKaoLogin = () => {
    const handleKakaoLogin = async (e: React.MouseEvent) => {
        e.preventDefault()
        const result = await signIn("kakao", { callbackUrl: "/" })
        if (result?.error) {
            console.error(result.error)
        }
    }
    return <> <button
        onClick={handleKakaoLogin}
        className="w-full flex items-center justify-center gap-3 bg-[#FEE500] rounded-lg p-3 text-gray-800 hover:bg-[#FEE500]/90 transition-all duration-200 shadow-sm hover:scale-[1.01] active:scale-[0.99]"
    >
        <div className="w-6 h-6">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                    fill="#000000"
                    d="M12 3C6.477 3 2 6.463 2 10.714c0 2.623 1.754 4.922 4.412 6.195-.193.66-.633 2.143-.729 2.475-.115.402.24.787.633.572.263-.138 2.639-1.796 3.694-2.524.947.15 1.938.228 2.99.228 5.523 0 10-3.463 10-7.714S17.523 3 12 3z"
                />
            </svg>
        </div>
        <span className="font-medium">카카오 로그인</span>
    </button></>

}
export default KaKaoLogin