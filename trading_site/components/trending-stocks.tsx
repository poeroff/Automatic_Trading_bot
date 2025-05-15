"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const trendingStocks = [
  { rank: 1, name: "삼성전자", code: "005930", price: 72800, change: 2.1, volume: 12500000, recommendation: "매수" },
  {
    rank: 2,
    name: "SK하이닉스",
    code: "000660",
    price: 168500,
    change: 4.3,
    volume: 5600000,
    recommendation: "강력매수",
  },
  {
    rank: 3,
    name: "LG에너지솔루션",
    code: "373220",
    price: 358000,
    change: -1.8,
    volume: 980000,
    recommendation: "중립",
  },
  { rank: 4, name: "카카오", code: "035720", price: 56700, change: 3.2, volume: 4300000, recommendation: "매수" },
  { rank: 5, name: "NAVER", code: "035420", price: 186500, change: -0.8, volume: 1200000, recommendation: "중립" },
  { rank: 6, name: "현대차", code: "005380", price: 246000, change: 1.5, volume: 890000, recommendation: "매수" },
  { rank: 7, name: "LG화학", code: "051910", price: 452000, change: -1.2, volume: 450000, recommendation: "중립" },
  { rank: 8, name: "셀트리온", code: "068270", price: 178500, change: 2.8, volume: 1100000, recommendation: "매수" },
]

export function TrendingStocks() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">순위</TableHead>
            <TableHead>종목명</TableHead>
            <TableHead className="text-right">현재가</TableHead>
            <TableHead className="text-right">등락률</TableHead>
            <TableHead className="text-right">거래량</TableHead>
            <TableHead className="text-center">추천</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trendingStocks.map((stock) => (
            <TableRow key={stock.code}>
              <TableCell className="text-center font-medium">{stock.rank}</TableCell>
              <TableCell>
                <div className="font-medium">{stock.name}</div>
                <div className="text-xs text-muted-foreground">{stock.code}</div>
              </TableCell>
              <TableCell className="text-right font-medium">{stock.price.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <div
                  className={`flex items-center justify-end ${stock.change > 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {stock.change > 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  <span>{Math.abs(stock.change)}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{(stock.volume / 1000000).toFixed(1)}M</TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={
                    stock.recommendation === "강력매수"
                      ? "destructive"
                      : stock.recommendation === "매수"
                        ? "default"
                        : "secondary"
                  }
                  className="whitespace-nowrap"
                >
                  {stock.recommendation}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
