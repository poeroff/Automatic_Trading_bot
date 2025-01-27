"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, User, Bell, Menu, X, LogOut, CreditCard, UserCircle } from "lucide-react"

interface HeaderProps {
  children: React.ReactNode;
}


type Notification = {
  id: number
  message: string
  isRead: boolean
}


export default function Header() {
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false)
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: "KOSPI 지수가 2% 상승했습니다.", isRead: false },
    { id: 2, message: "관심 종목 '삼성전자'의 주가가 5% 상승했습니다.", isRead: false },
    { id: 3, message: "새로운 시장 분석 리포트가 도착했습니다.", isRead: true },
  ])
  const [marketData, setMarketData] = useState<{ Kospi: { current_price: string; day_before_change: string }; Kosdaq: { current_price: string; day_before_change: string } } | null>(null);

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

    setIsProfileMenuVisible(!isProfileMenuVisible)
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length



  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8765');

    ws.onopen = () => {
      console.log('WebSocket 연결됨');
      ws.send('market_info');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMarketData(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket 에러:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket 연결 종료');
    };

    return () => {
      ws.close();
    };
  }, []);
  console.log(marketData)

  return (
    <header className="bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">


          {/* Main Navigation - Hidden on mobile */}
          <nav className="hidden md:flex space-x-4">
            <Link href="/" className="text-gray-600 hover:text-blue-600">
              시장동향
            </Link>
            <Link href="/stocks" className="text-gray-600 hover:text-blue-600">
              주식
            </Link>
            <Link href="/etf" className="text-gray-600 hover:text-blue-600">
              ETF
            </Link>
            <Link href="/news" className="text-gray-600 hover:text-blue-600">
              뉴스
            </Link>
          </nav>

          {/* Market Index - Hidden on mobile */}
          <div className="hidden md:flex space-x-4 text-sm">
            <span>
              코스피{" "}
              <span className="text-red-500">
                {marketData?.Kosdaq &&
                  (Number(marketData.Kospi.current_price) / 100).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                {` -5.00 (-0.58%)`}
              </span>
            </span>
            <span>
              코스닥 <span className="text-blue-500">{marketData?.Kosdaq &&
                (Number(marketData.Kosdaq.current_price) / 100).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                {` -5.00 (-0.58%)`} </span>
            </span>
          </div>

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
                  <Link href="/Login" className="flex justify-center items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={toggleProfileMenu}>
                    <UserCircle className="h-4 w-4 mr-2" />
                    프로필 보기
                  </Link>
                  <Link href="/account" className="flex justify-center items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={toggleProfileMenu}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    내 계좌 보기
                  </Link>
                  <button className="flex justify-center items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={toggleProfileMenu}>
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

