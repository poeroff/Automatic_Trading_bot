"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"


export default function SignupPage() {


  const emailRef = useRef<HTMLInputElement>(null);


  const EmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value;
  
    try {
      const result =  signIn('email', {
        email: email,
        redirect: false,
      });
      
    
    } catch (error) {
      console.error("예상치 못한 오류 발생:", error);
    }
  }
  
  

  return (
    <div className="min-h-screen  flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={EmailSubmit}>
           

            <div>
              <Label htmlFor="email">이메일 주소</Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  ref={emailRef}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                <span>
                  <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                    이용약관
                  </Link>
                </span>{" "}
                및{" "}
                <span>
                  <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                    개인정보 처리방침
                  </Link>
                </span>
                에 동의합니다
              </label>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                회원가입
              </Button>
            </div>
          </form>


          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}



