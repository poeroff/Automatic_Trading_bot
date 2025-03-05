"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode]
      newCode[index] = value
      setVerificationCode(newCode)

      if (value !== "" && index < 5) {
        inputRefs[index + 1].current?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && index > 0 && verificationCode[index] === "") {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const code = verificationCode.join("")
    if (code.length !== 6) {
      setError("6자리 코드를 모두 입력해주세요.")
      setIsLoading(false)
      return
    }

    try {
      // 여기에 실제 인증 API 호출 로직을 구현합니다.
      // 예시: const response = await verifyEmail(code)

      // 임시로 3초 후에 성공했다고 가정합니다.
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setIsVerified(true)
      // 인증 성공 후 리다이렉트 또는 다음 단계로 이동
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (err) {
      setError("인증 코드가 올바르지 않습니다. 다시 시도해 주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    inputRefs[0].current?.focus()
  }, [inputRefs[0]])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>이메일 인증</CardTitle>
          <CardDescription>이메일로 받은 6자리 인증 코드를 입력해 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="verificationCode">인증 코드</Label>
                <div className="flex justify-between space-x-2">
                  {verificationCode.map((digit, index) => (
                    <Input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      className="w-10 h-12 text-center text-2xl"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isLoading || isVerified}
                    />
                  ))}
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button
            onClick={handleSubmit}
            disabled={verificationCode.join("").length !== 6 || isLoading || isVerified}
            className="w-full"
          >
            {isLoading ? "인증 중..." : "인증하기"}
          </Button>
          {error && (
            <div className="flex items-center mt-2 text-red-500">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {isVerified && (
            <div className="flex items-center mt-2 text-green-500">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              <span className="text-sm">인증이 완료되었습니다. 잠시 후 다음 페이지로 이동합니다.</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

