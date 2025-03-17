"use client"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"

interface TickerItem {
  id: number

  name: string
  price: string
  change: string
  changePercent: string
  isPositive: boolean
}

export function AutoTicker() {
  const [items, setItems] = useState<TickerItem[]>([])

  const socket = io("http://localhost:81"); // ✅ NestJS WebSocket 서버 주소 (Socket.IO 사용)

  useEffect(() => {
  
    socket.emit("Korea_main_stock_marketIndex"); // ✅ WebSocket 이벤트 요청
    
    // socket.on("connect", () => {
    //   console.log("✅ WebSocket 연결됨!");
  
    // });

    socket.on("IndexData", (data) => {
       console.log("📊 코스피 지수 데이터 받음:", data);
       const kospiObj = data.kospi
       const kosdaqObj = data.kosdak
       const kospi200 = data.kospi200
       const exchange_rate_USD = data.exchange_rate_USD
       const exchange_rate_JPY = data.exchange_rate_JPY

       const kospiTicker: TickerItem = {
        id: 1,
        name: "코스피",
        price: kospiObj.bstp_nmix_prpr,
        change: kospiObj.bstp_nmix_prdy_vrss,
        changePercent: kospiObj.bstp_nmix_prdy_ctrt + "%",
        isPositive: parseFloat(kospiObj.bstp_nmix_prdy_ctrt) >= 0,
      }

      const kosdaqTicker: TickerItem = {
        id: 2,
        name: "코스닥",
        price: kosdaqObj.bstp_nmix_prpr,
        change: kosdaqObj.bstp_nmix_prdy_vrss,
        changePercent: kosdaqObj.bstp_nmix_prdy_ctrt + "%",
        isPositive: parseFloat(kosdaqObj.bstp_nmix_prdy_vrss) >= 0,
      }

      const kospi200Ticker: TickerItem = {
        id: 3,
        name: "코스피 200",
        price: kospi200.bstp_nmix_prpr,
        change: kospi200.bstp_nmix_prdy_vrss,
        changePercent: kospi200.bstp_nmix_prdy_ctrt + "%",
        isPositive: parseFloat(kospi200.bstp_nmix_prdy_vrss) >= 0,
      }

      const USDTicker: TickerItem = {
        id: 4,
        name: "USD/KRW",
        price: exchange_rate_USD.ovrs_nmix_prpr,
        change: exchange_rate_USD.ovrs_nmix_prdy_vrss,
        changePercent: exchange_rate_USD.prdy_ctrt + "%",
        isPositive: parseFloat(exchange_rate_USD.ovrs_nmix_prdy_vrss) >= 0,
      }

      const JPYTicker: TickerItem = {
        id: 5,
        name: "JPY/KRW",
        price: exchange_rate_JPY.ovrs_nmix_prpr,
        change: exchange_rate_JPY.ovrs_nmix_prdy_vrss,
        changePercent: exchange_rate_JPY.prdy_ctrt + "%",
        isPositive: parseFloat(exchange_rate_JPY.ovrs_nmix_prdy_vrss) >= 0,
      }


    
      setItems([kospiTicker, kosdaqTicker, kospi200Ticker,USDTicker,JPYTicker])
  
    });

    // socket.on("disconnect", () => {
    //   console.log("❌ WebSocket 연결 종료");
    // });

    // return () => {
    //   socket.disconnect();
    // };
  }, []);

//   //샘플 데이터
//   const item: TickerItem[] = [
//     { id: 1,   name: "Apple Inc.",       price: "189.84", change: "+2.35", changePercent: "1.25%", isPositive: true },
//     { id: 2,  name: "Microsoft Corp.",  price: "415.50", change: "+3.20", changePercent: "0.78%", isPositive: true },
//     { id: 3,  name: "Alphabet Inc.",    price: "142.65", change: "-1.23", changePercent: "0.85%", isPositive: false },
//     { id: 4,   name: "Amazon.com Inc.",  price: "178.12", change: "+1.45", changePercent: "0.82%", isPositive: true },
//     { id: 5,   name: "Tesla Inc.",       price: "175.34", change: "-3.21", changePercent: "1.80%", isPositive: false },
//     { id: 6,   name: "Meta Platforms",   price: "485.39", change: "+5.67", changePercent: "1.18%", isPositive: true },
//     { id: 7,   name: "Netflix Inc.",     price: "605.88", change: "+2.76", changePercent: "0.46%", isPositive: true },
//     { id: 8,   name: "NVIDIA Corp.",     price: "925.17", change: "+15.32", changePercent: "1.68%", isPositive: true },
//   ]

  // 중복 배열로 붙여주기 (끊김 없이 자연스럽도록)
  const allItems = [...items, ...items]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white border-t border-slate-700 overflow-hidden">
      <div className="flex items-center h-10">
        {/* 왼쪽 고정 영역 */}
        <div className="flex items-center gap-2 px-4 shrink-0 border-r border-slate-700">
          <span className="text-sm font-medium">실시간 시세</span>
          <ArrowRight className="h-3 w-3" />
        </div>
        {/* 실제 티커 부분 */}
        <div className="relative w-full overflow-hidden">
          {/* marquee 클래스 적용 (globals.css에서 정의) */}
          <div className="marquee whitespace-nowrap">
            {allItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex-shrink-0 px-4">
                <span className="text-slate-400 mr-2">{item.name}</span>
                <span className="mr-1">{item.price}</span>
                <span className={item.isPositive ? "text-green-500" : "text-red-500"}>
                  {item.change} ({item.changePercent})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
