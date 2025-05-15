"use client"

import { ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import axios from "axios"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type StockCategory = "all" | "growth" | "value" | "dividend"

interface RecommendedStocksProps {
  category?: StockCategory
}

interface TrCode {
  id: number
  company: string
  code: string
  category: string
  products: string
  listed_date: string
  settlement_month: string
  representative: string
  homepage: string
  region: string
  mket_id_cd: string
  capital_Impairment: string
  admn_item_yn: string
  tr_stop_yn: string
  mcap: string
  sale_account: string
  trendline_oblique_angle: boolean
  certified: boolean
}

interface Signal {
  id: number
  price: number
  createdAt: string
  trCode: TrCode
  currentPrice: string
}

const stockData = {
  all: [
    { name: "삼성전자", code: "005930", price: 72800, change: 2.1, recommendation: "매수", sector: "전자" },
    { name: "현대차", code: "005380", price: 246000, change: 1.5, recommendation: "매수", sector: "자동차" },
    { name: "NAVER", code: "035420", price: 186500, change: -0.8, recommendation: "중립", sector: "서비스" },
    { name: "카카오", code: "035720", price: 56700, change: 3.2, recommendation: "매수", sector: "서비스" },
    { name: "LG화학", code: "051910", price: 452000, change: -1.2, recommendation: "중립", sector: "화학" },
    { name: "SK하이닉스", code: "000660", price: 168500, change: 4.3, recommendation: "강력매수", sector: "반도체" },
  ],
  growth: [
    { name: "카카오", code: "035720", price: 56700, change: 3.2, recommendation: "매수", sector: "서비스" },
    { name: "SK하이닉스", code: "000660", price: 168500, change: 4.3, recommendation: "강력매수", sector: "반도체" },
    { name: "셀트리온", code: "068270", price: 178500, change: 2.8, recommendation: "매수", sector: "제약" },
    { name: "POSCO홀딩스", code: "005490", price: 375000, change: 1.9, recommendation: "매수", sector: "철강" },
  ],
  value: [
    { name: "삼성전자", code: "005930", price: 72800, change: 2.1, recommendation: "매수", sector: "전자" },
    { name: "현대차", code: "005380", price: 246000, change: 1.5, recommendation: "매수", sector: "자동차" },
    { name: "KB금융", code: "105560", price: 58700, change: 0.5, recommendation: "중립", sector: "금융" },
    { name: "LG전자", code: "066570", price: 112000, change: 1.2, recommendation: "매수", sector: "전자" },
  ],
  dividend: [
    { name: "KT&G", code: "033780", price: 92400, change: 0.3, recommendation: "매수", sector: "소비재" },
    { name: "한국전력", code: "015760", price: 19850, change: -0.5, recommendation: "중립", sector: "전기" },
    { name: "SK텔레콤", code: "017670", price: 48900, change: 0.8, recommendation: "매수", sector: "통신" },
    { name: "현대차우", code: "005385", price: 108500, change: 1.1, recommendation: "매수", sector: "자동차" },
  ],
}

export function RecommendedStocks({ category = "all" }: RecommendedStocksProps) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:4000/signals/trigger")
        setSignals(response.data)
        setError(null)
      } catch (error) {
        console.error("데이터를 가져오는 중 오류 발생:", error)
        setError("데이터를 불러오는 중 오류가 발생했습니다.")
        // 개발 환경에서는 더미 데이터 사용
        if (process.env.NODE_ENV === "development") {
          setSignals(
            stockData.all.map((stock, index) => ({
              id: index,
              price: stock.price * 0.95, // 예시: 현재 가격보다 5% 낮은 가격을 시그널 가격으로 설정
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // 최근 30일 내 랜덤 날짜
              currentPrice: stock.price.toString(),
              trCode: {
                id: index,
                company: stock.name,
                code: stock.code,
                category: stock.sector,
                products: "",
                listed_date: "",
                settlement_month: "",
                representative: "",
                homepage: "",
                region: "",
                mket_id_cd: "",
                capital_Impairment: "",
                admn_item_yn: "",
                tr_stop_yn: "",
                mcap: "",
                sale_account: "",
                trendline_oblique_angle: false,
                certified: false,
              },
            })),
          )
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // 날짜가 얼마나 지났는지 계산하는 함수
  const getDaysSinceSignal = (dateString: string): number => {
    const signalDate = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - signalDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateChangePercentage = (oldPrice: number, currentPrice: string): number | null => {
    const currentPriceNum = Number.parseFloat(currentPrice)
    if (isNaN(currentPriceNum) || oldPrice === 0) {
      return null
    }
    const change = ((currentPriceNum - oldPrice) / oldPrice) * 100
    return change
  }

  if (loading) {
    return <div className="text-center py-8">데이터를 불러오는 중...</div>
  }

  if (error && signals.length === 0) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {signals.map((stock) => {
        const changePercentage = calculateChangePercentage(stock.price, stock.currentPrice)
        const daysSinceSignal = getDaysSinceSignal(stock.createdAt)

        return (
          <Card key={stock.trCode.code}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{stock.trCode.company}</CardTitle>
                  <CardDescription>
                    {stock.trCode.code} | {stock.trCode.category}
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(stock.createdAt)}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>매수 신호 발생일 ({daysSinceSignal}일 전)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-muted-foreground">매수 신호 가격</div>
                    <div className="text-lg font-medium">
                      {Number.parseInt(stock.price.toString()).toLocaleString()}원
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">현재 가격</div>
                    <div className="text-lg font-bold">{Number.parseInt(stock.currentPrice).toLocaleString()}원</div>
                  </div>
                  {changePercentage !== null && (
                    <div className={`flex items-center ${changePercentage > 0 ? "text-green-500" : "text-red-500"}`}>
                      {changePercentage > 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      <span>{Math.abs(changePercentage).toFixed(2)}%</span>
                    </div>
                  )}
                </div>

               
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                상세 분석
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
