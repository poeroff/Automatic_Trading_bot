import Link from "next/link";

export default function VerifyRequest() {
    return (
      <div className="min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">이메일을 확인해주세요</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              로그인 링크가 포함된 이메일을 보냈습니다. 이메일을 확인하고 링크를 클릭하여 로그인해주세요.
            </p>
          </div>
          <div className="flex justify-center">
            <Link href="/signin" className="text-blue-500 hover:text-blue-600">로그인 페이지로 돌아가기</Link>
          </div>
       
        </div>
      </div>
    )
  }
  
  