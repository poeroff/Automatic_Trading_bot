"use client"

import { ArrowUpRight, ArrowDownRight, Calendar, ChevronDown } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import axios from "axios"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

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

export function RecommendedStocks({ category = "all" }: RecommendedStocksProps) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(6) // 초기에 보여줄 아이템 수
  const [hasMore, setHasMore] = useState(false) // 더 보여줄 아이템이 있는지 여부

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:4000/signals/trigger")
        const fetchedSignals = response.data
        setSignals(fetchedSignals)
        setHasMore(fetchedSignals.length > visibleCount) // 더 보여줄 아이템이 있는지 확인
        setError(null)
      } catch (error) {
        setError("데이터를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [visibleCount])

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

  // 더보기 버튼 클릭 핸들러
  const handleShowMore = () => {
    setVisibleCount(signals.length) // 모든 아이템 표시
    setHasMore(false) // 더 이상 표시할 아이템이 없음
  }

  if (loading) {
    return <div className="text-center py-8">데이터를 불러오는 중...</div>
  }

  if (error && signals.length === 0) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  // 현재 보여줄 아이템만 필터링
  const visibleSignals = signals.slice(0, visibleCount)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleSignals.map((stock) => {
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

      {/* 더보기 버튼 */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Link href= "123" onClick={handleShowMore} className="flex items-center gap-2 px-8">
            더보기 <ChevronDown className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* 전체 종목 수 표시 */}
      <div className="text-center text-sm text-muted-foreground">
        {visibleCount < signals.length
          ? `${visibleCount}개 / 총 ${signals.length}개 종목 표시 중`
          : `전체 ${signals.length}개 종목 표시 중`}
      </div>
    </div>
  )
}
