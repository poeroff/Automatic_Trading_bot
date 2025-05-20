"use client"

import { useState } from "react"
import { ArrowUpRight, ArrowDownRight, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

// 더미 데이터
const stockData = [
  { rank: 1, name: "삼성전자", code: "005930", price: 72800, change: 2.1, volume: 12500000, amount: 910000000000 },
  { rank: 2, name: "SK하이닉스", code: "000660", price: 168500, change: 4.3, volume: 5600000, amount: 943600000000 },
  {
    rank: 3,
    name: "LG에너지솔루션",
    code: "373220",
    price: 358000,
    change: -1.8,
    volume: 980000,
    amount: 350840000000,
  },
  { rank: 4, name: "카카오", code: "035720", price: 56700, change: 3.2, volume: 4300000, amount: 243810000000 },
  { rank: 5, name: "NAVER", code: "035420", price: 186500, change: -0.8, volume: 1200000, amount: 223800000000 },
  { rank: 6, name: "현대차", code: "005380", price: 246000, change: 1.5, volume: 890000, amount: 218940000000 },
  { rank: 7, name: "LG화학", code: "051910", price: 452000, change: -1.2, volume: 450000, amount: 203400000000 },
  { rank: 8, name: "셀트리온", code: "068270", price: 178500, change: 2.8, volume: 1100000, amount: 196350000000 },
  {
    rank: 9,
    name: "삼성바이오로직스",
    code: "207940",
    price: 820000,
    change: 0.5,
    volume: 120000,
    amount: 98400000000,
  },
  { rank: 10, name: "KB금융", code: "105560", price: 58700, change: 0.5, volume: 1500000, amount: 88050000000 },
  { rank: 11, name: "LG전자", code: "066570", price: 112000, change: 1.2, volume: 750000, amount: 84000000000 },
  { rank: 12, name: "삼성SDI", code: "006400", price: 432000, change: -0.7, volume: 180000, amount: 77760000000 },
  { rank: 13, name: "현대모비스", code: "012330", price: 218000, change: 1.1, volume: 320000, amount: 69760000000 },
  { rank: 14, name: "SK이노베이션", code: "096770", price: 132000, change: -0.9, volume: 480000, amount: 63360000000 },
  { rank: 15, name: "기아", code: "000270", price: 98500, change: 1.8, volume: 620000, amount: 61070000000 },
]

export function MarketRankings() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("volume")

  // 검색 필터링
  const filteredStocks = stockData.filter(
    (stock) => stock.name.toLowerCase().includes(searchTerm.toLowerCase()) || stock.code.includes(searchTerm),
  )

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted px-6 py-4">
        <h2 className="text-xl font-bold">거래량순위</h2>
        <p className="text-sm text-muted-foreground mt-1">국내 주식 시장의 거래량 기준 상위 종목 순위입니다.</p>
      </div>

      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 items-center">
          </div>
          <div className="relative">
            <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString()} 기준</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">순위</TableHead>
              <TableHead>종목명</TableHead>
              <TableHead className="text-right">현재가</TableHead>
              <TableHead className="text-right">등락률</TableHead>
              <TableHead className="text-right">거래량</TableHead>
              <TableHead className="text-right">거래대금</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.map((stock) => (
              <TableRow key={stock.code}>
                <TableCell className="text-center font-medium">{stock.rank}</TableCell>
                <TableCell>
                  <div className="font-medium">{stock.name}</div>
                  <div className="text-xs text-muted-foreground">{stock.code}</div>
                </TableCell>
                <TableCell className="text-right font-medium">{stock.price.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div
                    className={`flex items-center justify-end ${
                      stock.change > 0 ? "text-green-500" : stock.change < 0 ? "text-red-500" : "text-muted-foreground"
                    }`}
                  >
                    {stock.change > 0 ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : stock.change < 0 ? (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    ) : null}
                    <span>{Math.abs(stock.change)}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{(stock.volume / 1000000).toFixed(2)}M</TableCell>
                <TableCell className="text-right">{(stock.amount / 1000000000).toFixed(1)}B</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
