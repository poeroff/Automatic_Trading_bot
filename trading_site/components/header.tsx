"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, User, Bell, Menu, X, LogOut, CreditCard, UserCircle } from "lucide-react"

import { signOut, useSession } from "next-auth/react";

import { useRouter } from "next/navigation"; 


type Notification = {
  id: number
  message: string
  isRead: boolean
}

type MarketItem = {
  name: string;
  value: string;
  change: string;
  isPositive: string;
}

type MarketGroup = MarketItem[];
type MarketDataGroups = MarketGroup[];


export default function Header() {

  const { data: session , status} = useSession();
  const router = useRouter(); 

  
  

  const [marketGroups, setMarketGroups] = useState<MarketDataGroups>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false)
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: "KOSPI 지수가 2% 상승했습니다.", isRead: false },
    { id: 2, message: "관심 종목 '삼성전자'의 주가가 5% 상승했습니다.", isRead: false },
    { id: 3, message: "새로운 시장 분석 리포트가 도착했습니다.", isRead: true },
  ])
 



  const transformData = (data: any) => {
    // 첫 번째 그룹
    const group1 = [
      {
        name: "KOSPI",
        value: data.Kospi.value,
        change: data.Kospi.change,
        isPositive: data.Kospi.isPositive
      },
      {
        name: "KOSDAQ",
        value: data.Kosdaq.value,
        change: data.Kosdaq.change,
        isPositive: data.Kosdaq.isPositive
      },
      {
        name: "KOSPI200",
        value: data.Kospi200.value,
        change: data.Kospi200.change,
        isPositive: data.Kospi200.isPositive
      },
    ];
 
    // 두 번째 그룹 (다른 종목들)
    const group2 = [
      {
        name: "USD/KRW(원)",
        value: data.USD.value,
        change: data.USD.change,
        isPositive: data.USD.blind
      },
      {
        name: "JPY(100엔)",
        value: data.JPY.value,
        change: data.JPY.change,
        isPositive: data.JPY.blind
      },
      {
        name: "GOLD(달러)",
        value: data.GOLD.value,
        change: data.GOLD.change,
        isPositive: data.GOLD.blind
      },
      // 여기에 추가 종목들 넣기
    ];
    console.log(group1, group2)
    setMarketGroups([group1, group2]);
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentGroupIndex(prev => (prev + 1) % 2);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

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

    if (!session) {
      router.push("/signin");
    }
    else{
      setIsProfileMenuVisible(!isProfileMenuVisible)
    }
 
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length



  // useEffect(() => {
  //   const ws = new WebSocket('ws://localhost:8765');

  //   ws.onopen = () => {
  //     console.log('WebSocket 연결됨');

  //   };

  //   ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     console.log(data)
  //     transformData(data)
  //     //setMarketData(data);
  //   };

  //   ws.onerror = (error) => {
  //     console.error('WebSocket 에러:', error);
  //   };

  //   ws.onclose = () => {
  //     console.log('WebSocket 연결 종료');
  //   };

  //   return () => {
  //     ws.close();
  //   };
  // }, []);



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
              뉴스스
            </Link>
           <Link href="/stock?code=000020" className="text-gray-600 hover:text-blue-600">
              종목 관리(admin)
            </Link>
          </nav>
          <div className="hidden md:flex space-x-4 text-sm">
            {marketGroups[currentGroupIndex]?.map((item, index) => (
              <span key={item.name} className={index > 0 ? "ml-4" : ""}>
                {item.name}{" "}
                <span className={item.isPositive?.includes('+') || item.isPositive === "상승" ? "text-red-500" : "text-blue-500"}>
                  {item.value} {item.isPositive?.includes('+') || item.isPositive === "상승" ? "+" : "-"}{item.change}
                  {(item.isPositive !== "상승" && item.isPositive !== "하락") && (
                    <span>({item.isPositive})</span>
                  )}
                </span>

              </span>
            ))}
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
                  
                  <Link href="/profile" className="flex justify-center items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileMenuVisible(false)}>
                    <UserCircle className="h-4 w-4 mr-2" />
                    프로필 보기
                  </Link>
                  <Link href="/account" className="flex justify-center items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileMenuVisible(false)}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    내 계좌 보기
                  </Link>
                  <button onClick={() => {signOut({ callbackUrl: '/' }); setIsProfileMenuVisible(false)}} className="flex justify-center items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" >
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

