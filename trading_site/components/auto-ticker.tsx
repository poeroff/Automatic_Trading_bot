"use client"
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface TickerItem {
  id: number;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

const createTickerItem = (
  id: number,
  name: string,
  price: string,
  change: string,
  changePercent: string
): TickerItem => ({
  id,
  name,
  price,
  change,
  changePercent,
  isPositive: parseFloat(changePercent) >= 0,
});

export function AutoTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const socket = io("http://localhost:81");

  useEffect(() => {
    socket.emit("Korea_main_stock_marketIndex");

    socket.on("IndexData", (data) => {
      const tickers = [
        {
          id: 1,
          name: "코스피",
          price: data.kospi.bstp_nmix_prpr,
          change: data.kospi.bstp_nmix_prdy_vrss,
          changePercent: data.kospi.bstp_nmix_prdy_ctrt + "%",
        },
        {
          id: 2,
          name: "코스닥",
          price: data.kosdak.bstp_nmix_prpr,
          change: data.kosdak.bstp_nmix_prdy_vrss,
          changePercent: data.kosdak.bstp_nmix_prdy_ctrt + "%",
        },
        {
          id: 3,
          name: "코스피 200",
          price: data.kospi200.bstp_nmix_prpr,
          change: data.kospi200.bstp_nmix_prdy_vrss,
          changePercent: data.kospi200.bstp_nmix_prdy_ctrt + "%",
        },
        {
          id: 4,
          name: "USD/KRW",
          price: data.exchange_rate_USD.ovrs_nmix_prpr,
          change: data.exchange_rate_USD.ovrs_nmix_prdy_vrss,
          changePercent: data.exchange_rate_USD.prdy_ctrt + "%",
        },
        {
          id: 5,
          name: "JPY/KRW",
          price: data.exchange_rate_JPY.ovrs_nmix_prpr,
          change: data.exchange_rate_JPY.ovrs_nmix_prdy_vrss,
          changePercent: data.exchange_rate_JPY.prdy_ctrt + "%",
        },
      ];

      setItems(tickers.map((ticker) =>
        createTickerItem(ticker.id, ticker.name, ticker.price, ticker.change, ticker.changePercent)
      ));
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const allItems = [...items, ...items];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white border-t border-slate-700 overflow-hidden">
      <div className="flex items-center h-10">
        <div className="flex items-center gap-2 px-4 shrink-0 border-r border-slate-700">
          <span className="text-sm font-medium">실시간 지수</span>
          <ArrowRight className="h-3 w-3" />
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="marquee whitespace-nowrap">
            {loading ? (
              <div className="text-center text-slate-400">로딩 중...</div>
            ) : (
              allItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex-shrink-0 px-4">
                  <span className="text-slate-400 mr-2">{item.name}</span>
                  <span className="mr-1">{item.price}</span>
                  <span className={item.isPositive ? "text-green-500" : "text-red-500"}>
                    {item.change} ({item.changePercent})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
