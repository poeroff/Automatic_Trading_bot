"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AlertCircle, ArrowLeft } from "lucide-react"

const ErrorPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get("error")
  const [errorMessage, setErrorMessage] = useState("")
  const [errorDescription, setErrorDescription] = useState("")

  useEffect(() => {
    switch (error) {
      case "EXISTING_USER":
        setErrorMessage("이미 존재하는 이메일입니다.")
        setErrorDescription(
          "동일한 계정이 있으니 기존에 사용하던 로그인 방식을 이용해 주세요.",
        )
        break
      case "AccessDenied":
        setErrorMessage("접근이 거부되었습니다.")
        setErrorDescription(
          "계정에 접근할 수 있는 권한이 없습니다. 관리자에게 문의하거나 다른 계정으로 로그인해 주세요.",
        )
        break
      case "OAuthAccountNotLinked":
        setErrorMessage("이메일이 다른 계정과 연결되어 있습니다.")
        setErrorDescription(
          "이 이메일 주소로 이미 다른 방식으로 가입한 계정이 있습니다. 기존에 사용하던 로그인 방식을 이용해 주세요.",
        )
        break
      case "CredentialsSignin":
        setErrorMessage("로그인 정보가 올바르지 않습니다.")
        setErrorDescription("이메일 주소와 비밀번호를 다시 확인해 주세요. 비밀번호를 잊으셨다면 재설정할 수 있습니다.")
        break
      default:
        setErrorMessage("알 수 없는 오류가 발생했습니다.")
        setErrorDescription("잠시 후 다시 시도해 주세요. 문제가 지속되면 고객 지원팀에 문의해 주세요.")
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">오류 발생</h1>
        <p className="text-red-600 font-semibold text-center mb-4">{errorMessage}</p>
        <p className="text-gray-600 text-center mb-6">{errorDescription}</p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => router.push("/signin")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300"
          >
            로그인 페이지로 이동
          </button>
          {/* <button
            onClick={() => router.back()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition duration-300 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전 페이지로 돌아가기
          </button> */}
        </div>
      </div>
    </div>
  )
}

export default ErrorPage

