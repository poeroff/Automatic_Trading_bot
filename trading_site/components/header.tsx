// "use client"

// import { useEffect, useMemo, useState } from "react"
// import Link from "next/link"
// import { Search, User, Bell, Menu, X, LogOut, CreditCard, UserCircle } from "lucide-react"
// import { signOut } from "next-auth/react"
// import { useRouter } from "next/navigation"
// import { useSessionContext } from "@/app/providers"
// import DropdownMenu from "@/components/DropdownMenu"
// import { io } from "socket.io-client";
// import Frame from "./header-frame"

// type Notification = {
//   id: number
//   message: string
//   isRead: boolean
// }

// type MarketItem = {
//   name: string
//   value: number
//   change: number
//   percentage : number

// }

// type MarketGroup = MarketItem[]
// type MarketDataGroups = MarketGroup[]

// export default function Header() {
//   const { session, updateSession } = useSessionContext()


//   const MemoSession = useMemo(() => {
//     return session
//   }, [session])
//   const router = useRouter()

//   const [isSearchVisible, setIsSearchVisible] = useState(false)
//   const [isNotificationsVisible, setIsNotificationsVisible] = useState(false)
//   const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false)
//   const [searchTerm, setSearchTerm] = useState(""); // input 값 상태 관리

//   const [notifications, setNotifications] = useState<Notification[]>([
//     { id: 1, message: "KOSPI 지수가 2% 상승했습니다.", isRead: false },
//     { id: 2, message: "관심 종목 '삼성전자'의 주가가 5% 상승했습니다.", isRead: false },
//     { id: 3, message: "새로운 시장 분석 리포트가 도착했습니다.", isRead: true },
//   ])

//   // const socket = io("http://localhost:81"); // ✅ NestJS WebSocket 서버 주소 (Socket.IO 사용)

//   // useEffect(() => {

//   //   socket.emit("Korea_main_stock_marketIndex"); // ✅ WebSocket 이벤트 요청

//   //   // socket.on("connect", () => {
//   //   //   console.log("✅ WebSocket 연결됨!");

//   //   // });

//   //   socket.on("IndexData", (data) => {
//   //      console.log("📊 코스피 지수 데이터 받음:", data);
//   //      transformData(data)

//   //   });

//   //   // socket.on("disconnect", () => {
//   //   //   console.log("❌ WebSocket 연결 종료");
//   //   // });

//   //   return () => {
//   //     socket.disconnect();
//   //   };
//   // }, []);



//   const toggleSearch = () => {
//     setIsSearchVisible(!isSearchVisible)
//   }

//   const toggleNotifications = () => {
//     if (isProfileMenuVisible) {
//       setIsProfileMenuVisible(false)
//     }

//     setIsNotificationsVisible(!isNotificationsVisible)
//   }
//   const toggleProfileMenu = () => {
//     if (isNotificationsVisible) {
//       setIsNotificationsVisible(false)
//     }

//     if (!MemoSession) {
//       router.push("/signin")
//     } else {
//       setIsProfileMenuVisible(!isProfileMenuVisible)
//     }
//   }

//   const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     event.preventDefault()
//     console.log(event.target.value)
//     setSearchTerm(event.target.value); // 입력된 값을 상태로 업데이트
//   };
//   const handleSubmit = (event: React.FormEvent) => {
//     event.preventDefault()
//     console.log(searchTerm)
//     router.push(`/item/stock?code=${searchTerm}`)

//   };


//   const unreadCount = notifications.filter((n) => !n.isRead).length



//   return (
//     <header className="bg-white whitespace-nowrap">
//     <div className="container mx-auto px-4 py-3">
//       <div className="flex items-center justify-between relative">

//         {/* 왼쪽 영역 (필요시 로고나 빈 공간으로 유지 가능) */}
//         <div className="flex-shrink-0">
//           {/* 필요하면 로고 등을 여기에 추가 */}
//         </div>

//         {/* Frame 컴포넌트 (가운데 정렬) */}
//         <div className="absolute left-1/2 transform -translate-x-1/2">
//           <Frame />
//         </div>

//         {/* 오른쪽 메뉴 영역 */}
//         <div className="flex items-center space-x-4 flex-shrink-0">
//           {/* Search Input */}
//           <form  onSubmit ={handleSubmit} className="relative flex items-center">
//             <input
//               type="text"
//               placeholder="검색..."
//               value ={searchTerm}
//               onChange={handleSearchChange}
//               className={`
//                 absolute right-0 bg-gray-100 px-3 py-1 rounded-md
//                 transition-all duration-300 ease-in-out
//                 ${isSearchVisible ? "w-60 opacity-100" : "w-0 opacity-0"}
//               `}
//             />
//             <button  type="button" onClick={toggleSearch} className="text-gray-600 hover:text-blue-600 z-10">
//               {isSearchVisible ? <X className="h-5 w-5" /> : <Search className="h-6 w-6 " />}
//             </button>
//           </form>

//           {/* Notifications */}
//           <div className="relative mt-2">
//             <button
//               onClick={toggleNotifications}
//               className="text-gray-600 hover:text-blue-600 relative left-1/2 transform -translate-x-1/2"
//             >
//               <Bell className="h-6 w-6" />
//               {unreadCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//             {isNotificationsVisible && (
//               <div className="absolute left-1/2 transform -translate-x-1/2 mt-3 w-80 bg-white rounded-md shadow-lg py-1 z-10">
//                 {notifications.map((notification) => (
//                   <div
//                     key={notification.id}
//                     className={`px-4 py-2 hover:bg-gray-100 ${
//                       notification.isRead ? "text-gray-600" : "text-black font-semibold"
//                     }`}
//                   >
//                     {notification.message}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Profile Menu */}
//           <div className="relative mt-2">
//             <button
//               onClick={toggleProfileMenu}
//               className="text-gray-600 hover:text-blue-600"
//               aria-label="프로필 메뉴"
//             >
//               <User className="h-6 w-6" />
//             </button>
//             {isProfileMenuVisible && (
//               <div className="absolute left-1/2 transform -translate-x-1/2 mt-3 w-40 bg-white rounded-md shadow-lg py-1 z-10">
//                 <Link
//                   href="/profile"
//                   className="flex justify-center items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   onClick={() => setIsProfileMenuVisible(false)}
//                 >
//                   <UserCircle className="h-4 w-4 mr-2" />
//                   프로필 보기
//                 </Link>
//                 <Link
//                   href="/account"
//                   className="flex justify-center items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   onClick={() => setIsProfileMenuVisible(false)}
//                 >
//                   <CreditCard className="h-4 w-4 mr-2" />내 계좌 보기
//                 </Link>
//                 <button
//                   onClick={() => {
//                     signOut({ callbackUrl: "/" });
//                     setIsProfileMenuVisible(false);
//                   }}
//                   className="flex justify-center items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 >
//                   <LogOut className="h-4 w-4 mr-2" />
//                   로그아웃
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <button className="md:hidden text-gray-600 hover:text-blue-600">
//             <Menu className="h-5 w-5" />
//           </button>
//         </div>
//       </div>
//     </div>
//   </header>

//   )
// }

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu, X } from "lucide-react"
import { useSessionContext } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePathname, useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// 종목 데이터
const STOCK_LIST = [
  { code: "005930", name: "삼성전자" },
  { code: "000660", name: "SK하이닉스" },
  { code: "035420", name: "NAVER" },
  { code: "005380", name: "현대차" },
  { code: "035720", name: "카카오" },
  { code: "051910", name: "LG화학" },
  { code: "373220", name: "LG에너지솔루션" },
  { code: "006400", name: "삼성SDI" },
  { code: "207940", name: "삼성바이오로직스" },
  { code: "068270", name: "셀트리온" },
  { code: "323410", name: "카카오뱅크" },
  { code: "352820", name: "하이브" },
  { code: "247540", name: "에코프로비엠" },
  { code: "086520", name: "에코프로" },
  { code: "003670", name: "포스코퓨처엠" },
  { code: "096770", name: "SK이노베이션" },
  { code: "000270", name: "기아" },
  { code: "105560", name: "KB금융" },
  { code: "055550", name: "신한지주" },
  { code: "066570", name: "LG전자" },
]

export default function Header() {
  const { session } = useSessionContext()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<typeof STOCK_LIST>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // 검색어에 따른 자동완성 필터링
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const filtered = STOCK_LIST.filter(stock => 
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.code.includes(searchQuery)
    )

    setSuggestions(filtered.slice(0, 8)) // 최대 8개만 표시
    setShowSuggestions(filtered.length > 0)
  }, [searchQuery])

  // 검색 실행
  const handleSearch = (stockCode?: string, stockName?: string) => {
    const targetCode = stockCode || searchQuery
    
    if (stockCode) {
      router.push(`/news?ticker=${stockCode}&name=${encodeURIComponent(stockName || '')}`)
    } else {
      const found = STOCK_LIST.find(stock => 
        stock.name === searchQuery || stock.code === searchQuery
      )
      
      if (found) {
        router.push(`/news?ticker=${found.code}&name=${encodeURIComponent(found.name)}`)
      } else {
        alert('해당 종목을 찾을 수 없습니다.')
      }
    }
    
    // 검색 후 상태 초기화
    setSearchQuery('')
    setShowSuggestions(false)
    setIsSearchOpen(false) // 모바일에서 검색 창 닫기
  }

  // 키보드 이벤트
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length > 0) {
        handleSearch(suggestions[0].code, suggestions[0].name)
      } else {
        handleSearch()
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setIsSearchFocused(false)
    }
  }

  // 검색창 외부 클릭 시 자동완성 닫기
  const handleSearchBlur = () => {
    // 약간의 딜레이를 줘서 suggestion 클릭이 가능하도록
    setTimeout(() => {
      setIsSearchFocused(false)
      setShowSuggestions(false)
    }, 200)
  }

  const handleSearchFocus = () => {
    setIsSearchFocused(true)
    if (searchQuery && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl">
            주식마스터
          </Link>
        </div>

        {/* 데스크탑 네비게이션 */}
        <div className="hidden md:flex items-center gap-6 mx-4 flex-grow justify-center">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            홈
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            종목 추천
          </Link>
          <Link href="/marketanalysis" className="text-sm font-medium hover:text-primary">
            시장 분석
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            포트폴리오
          </Link>
          <Link href="/news" className="text-sm font-medium hover:text-primary">
            뉴스
          </Link>
          {session && session.user && session.user.author === "admin" && (
            <Link href="/stock" className="text-sm font-medium hover:text-primary">
              관리자
            </Link>
          )}
        </div>

        {/* 데스크탑 검색 및 로그인 */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                placeholder="종목 검색..." 
                className="w-64 pl-8" 
              />
            </div>
            
            {/* 데스크탑 자동완성 드롭다운 */}
            {showSuggestions && isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((stock) => (
                  <div
                    key={stock.code}
                    onClick={() => handleSearch(stock.code, stock.name)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{stock.name}</div>
                      <div className="text-sm text-gray-500">{stock.code}</div>
                    </div>
                    <div className="text-xs text-blue-600">분석 →</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Link href="/signin">
            <Button>로그인</Button>
          </Link>        
        </div>

        {/* 모바일 검색 및 메뉴 */}
        <div className="flex md:hidden items-center gap-2">
          {/* 모바일 검색 토글 */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          {/* 모바일 메뉴 */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-foreground">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" className="text-lg font-medium hover:text-primary">
                  홈
                </Link>
                <Link href="#" className="text-lg font-medium hover:text-primary">
                  종목 추천
                </Link>
                <Link href="/marketanalysis" className="text-lg font-medium hover:text-primary">
                  시장 분석
                </Link>
                <Link href="#" className="text-lg font-medium hover:text-primary">
                  포트폴리오
                </Link>
                <Link href="/news" className="text-lg font-medium hover:text-primary">
                  뉴스
                </Link>
                {session && session.user && session.user.author === "admin" && (
                  <Link href="/stock" className="text-lg font-medium hover:text-primary">
                    관리자
                  </Link>
                )}
                <Button className="mt-4">로그인</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* 모바일 검색 입력창 (토글) */}
      {isSearchOpen && (
        <div className="md:hidden border-t py-2 px-4 bg-background">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="종목 검색..." 
              className="w-full pl-8" 
            />
            
            {/* 모바일 자동완성 드롭다운 */}
            {showSuggestions && isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((stock) => (
                  <div
                    key={stock.code}
                    onClick={() => handleSearch(stock.code, stock.name)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{stock.name}</div>
                      <div className="text-sm text-gray-500">{stock.code}</div>
                    </div>
                    <div className="text-xs text-blue-600">분석 →</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}