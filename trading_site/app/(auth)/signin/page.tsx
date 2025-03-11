"use client"

import type React from "react"

import { signIn } from "next-auth/react"

export default function LoginPage() {
  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault()
    const result = await signIn("google", { callbackUrl: "/" })
    if (result?.error) {
      console.error(result.error)
    }
  }

  const handleKakaoLogin = async (e: React.MouseEvent) => {
    e.preventDefault()
    const result = await signIn("kakao", { callbackUrl: "/" })
    if (result?.error) {
      console.error(result.error)
    }
  }

  const handleNaverLogin = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await signIn("naver", { callbackUrl: "/" })
    } catch (error) {
      console.error("네이버 로그인 실패:", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-6 text-center">
            <h1 className="text-2xl font-bold text-white">로그인</h1>
            <p className="text-primary-foreground/80 mt-2">계정에 로그인하여 서비스를 이용하세요</p>
          </div>

          {/* Social Login Section */}
          <div className="p-8">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">소셜 계정으로 간편하게 로그인하세요</p>
            </div>

            <div className="space-y-4">
              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg p-3 text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="w-6 h-6 relative">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                    />
                    <path
                      fill="#4A90E2"
                      d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1818182,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                    />
                  </svg>
                </div>
                <span className="font-medium">Google 로그인</span>
              </button>

              {/* Kakao Login Button */}
              <button
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
              </button>

              {/* Naver Login Button */}
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
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                로그인시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">© 2025 Trading. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

