"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Search, User, Bell, Menu, X, LogOut, CreditCard, UserCircle } from "lucide-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useSessionContext } from "@/app/providers"
import DropdownMenu from "@/components/DropdownMenu"
import { io } from "socket.io-client";

type Notification = {
  id: number
  message: string
  isRead: boolean
}

type MarketItem = {
  name: string
  value: number
  change: number
  percentage : number

}

type MarketGroup = MarketItem[]
type MarketDataGroups = MarketGroup[]

export default function Header() {
  const { session, updateSession } = useSessionContext()
  const MemoSession = useMemo(() => {
    return session
  }, [session])
  const router = useRouter()
  const [marketGroups, setMarketGroups] = useState<MarketDataGroups>([])
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false)
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: "KOSPI 지수가 2% 상승했습니다.", isRead: false },
    { id: 2, message: "관심 종목 '삼성전자'의 주가가 5% 상승했습니다.", isRead: false },
    { id: 3, message: "새로운 시장 분석 리포트가 도착했습니다.", isRead: true },
  ])

  const socket = io("http://localhost:81"); // ✅ NestJS WebSocket 서버 주소 (Socket.IO 사용)

  useEffect(() => {
  
    socket.emit("getKospiIndex"); // ✅ WebSocket 이벤트 요청
    
    // socket.on("connect", () => {
    //   console.log("✅ WebSocket 연결됨!");
  
    // });

    socket.on("IndexData", (data) => {
       console.log("📊 코스피 지수 데이터 받음:", data);
       transformData(data)

     
    });

    // socket.on("disconnect", () => {
    //   console.log("❌ WebSocket 연결 종료");
    // });

    return () => {
      socket.disconnect();
    };
  }, []);


  const transformData = (data: any) => {
    if (data) {
      const group1 = [
        {
          name: "KOSPI",
          value: Number(data.bstp_nmix_prpr),
          change: Number(data.bstp_nmix_prdy_vrss),
          percentage: Number(data.bstp_nmix_prdy_ctrt),
        },
        {
          name: "KOSDAQ",
          value: Number(data.bstp_nmix_prpr),
          change: Number(data.bstp_nmix_prdy_vrss),
          percentage: Number(data.bstp_nmix_prdy_ctrt),
        },
        {
          name: "S&P 500",
          value: Number(data.bstp_nmix_prpr),
          change: Number(data.bstp_nmix_prdy_vrss),
          percentage: Number(data.bstp_nmix_prdy_ctrt),
        },
      ]
  
      const group2 = [
        {
          name: "USD/KRW(원)",
          value: Number(data.bstp_nmix_prpr),
          change: Number(data.bstp_nmix_prdy_vrss),
          percentage: Number(data.bstp_nmix_prdy_ctrt),
        },
        {
          name: "EUR/USD",
          value: Number(data.bstp_nmix_prpr),
          change: Number(data.bstp_nmix_prdy_vrss),
          percentage: Number(data.bstp_nmix_prdy_ctrt),
        },
        {
          name: "BTC/USD",
          value: Number(data.bstp_nmix_prpr),
          change: Number(data.bstp_nmix_prdy_vrss),
          percentage: Number(data.bstp_nmix_prdy_ctrt),
        },
      ]
      setMarketGroups(() => [group1, group2]); // ✅ 기존 데이터를 지우고 새로운 데이터로 업데이트
    }
  }
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentGroupIndex((prev) => (prev + 1) % 2)
    }, 10000)

    return () => clearInterval(timer)
  }, [])

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible)
  }
  const toggleNotifications = () => {
    if (isProfileMenuVisible) {
      setIsProfileMenuVisible(false)
    }

    setIsNotificationsVisible(!isNotificationsVisible)
  }
  const toggleProfileMenu = () => {
    if (isNotificationsVisible) {
      setIsNotificationsVisible(false)
    }

    if (!MemoSession) {
      router.push("/signin")
    } else {
      setIsProfileMenuVisible(!isProfileMenuVisible)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length


  const stockItems = [
    { label: "국내 주식", href: "/stocks/domestic" },
    { label: "해외 주식", href: "/stocks/international" },
    { label: "주식 스크리너", href: "/stocks/screener" },
  ]

  const newsItems = [
    { label: "주요 뉴스", href: "/news/main" },
    { label: "시장 분석", href: "/news/analysis" },
    { label: "기업 뉴스", href: "/news/corporate" },
  ]

  return (
    <header className="bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Current Time Display */}
      

          {/* Main Navigation - Hidden on mobile */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="flex justify-center items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              시장동향
            </Link>
            <DropdownMenu label="주식" items={stockItems} />
            <DropdownMenu label="뉴스" items={newsItems} />
            {MemoSession?.user.author === "admin" && (
              <Link href="/stock" className="flex justify-center items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                종목 관리
              </Link>
            )}
          </nav>

          {/* Market Data Display */}
          {marketGroups && <div className="hidden md:flex space-x-4 text-sm">
            {marketGroups[currentGroupIndex]?.map((item, index) => (
              <span key={item.name} className={index > 0 ? "ml-4" : ""}>
                {item.name}{" "}
                <span className={item.change > 0 ? " text-red-700" : " text-blue-700"}>
                  {item.value}{" "}{" "}
                  {item.change}({item.percentage}%)
                  
                </span>
              </span>
            ))}
          </div>} 

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="검색..."
                className={`
                  absolute right-0 bg-gray-100 px-3 py-1 rounded-md
                  transition-all duration-300 ease-in-out
                  ${isSearchVisible ? "w-48 opacity-100" : "w-0 opacity-0"}
                `}
              />
              <button onClick={toggleSearch} className="text-gray-600 hover:text-blue-600 z-10">
                {isSearchVisible ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>
            </div>
            <div className="relative mt-2">
              <button
                onClick={toggleNotifications}
                className="text-gray-600 hover:text-blue-600 relative left-1/2 transform -translate-x-1/2"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationsVisible && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-3 w-80 bg-white rounded-md shadow-lg py-1 z-10">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-2 hover:bg-gray-100 ${notification.isRead ? "text-gray-600" : "text-black font-semibold"}`}
                    >
                      {notification.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative mt-2">
              <button
                onClick={toggleProfileMenu}
                className="text-gray-600 hover:text-blue-600"
                aria-label="프로필 메뉴"
              >
                <User className="h-5 w-5" />
              </button>
              {isProfileMenuVisible && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-3 w-40 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/profile"
                    className="flex justify-center items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuVisible(false)}
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    프로필 보기
                  </Link>
                  <Link
                    href="/account"
                    className="flex justify-center items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuVisible(false)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />내 계좌 보기
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" })
                      setIsProfileMenuVisible(false)
                    }}
                    className="flex justify-center items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
            {/* Mobile menu button */}
            <button className="md:hidden text-gray-600 hover:text-blue-600">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

