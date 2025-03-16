
import type React from "react"
import NaverLogin from "./NaverLogin"
import KaKaoLogin from "./KaKaoLogin"
import GoogleLogin from "./GoogleLogin"
export default function LoginPage() {
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
              <GoogleLogin></GoogleLogin>
              {/* Kakao Login Button */}
              <KaKaoLogin></KaKaoLogin>
              {/* Naver Login Button */}
              <NaverLogin></NaverLogin>
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

