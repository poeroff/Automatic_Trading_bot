"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import axios from "axios"

interface StockRankingData {
  hts_kor_isnm: string;
  mksc_shrn_iscd: string;
  data_rank: string;
  stck_prpr: string;
  prdy_vrss_sign: string;
  prdy_vrss: string;
  prdy_ctrt: string;
  acml_vol: string;
  prdy_vol: string;
  lstn_stcn: string;
  avrg_vol: string;
  n_befr_clpr_vrss_prpr_rate: string;
  vol_inrt: string;
  vol_tnrt: string;
  nday_vol_tnrt: string;
  avrg_tr_pbmn: string;
  tr_pbmn_tnrt: string;
  nday_tr_pbmn_tnrt: string;
  acml_tr_pbmn: string;
}


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
  const initialData: StockRankingData[] = [];
  const [stockRankings, setStockRankings] = useState<StockRankingData[]>(initialData);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("http://localhost:4000/stock-rankings/tradingvolume")
      setStockRankings(response.data)
    }
    fetchData()

  },[])
  console.log(stockRankings)
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
            <TableHead className="text-center">평균거래대금</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stockRankings.map((stock) => (
            <TableRow key={stock.data_rank}>
              <TableCell className="text-center font-medium">{stock.data_rank}</TableCell>
              <TableCell>
                <div className="font-medium">{stock.hts_kor_isnm}</div>
              </TableCell>
              <TableCell className="text-right font-medium">{stock.stck_prpr.toLocaleString()}원</TableCell>
              <TableCell className="text-right">
                <div
                  className={`flex items-center justify-end ${Number(stock.prdy_ctrt)> 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {Number(stock.prdy_ctrt) > 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  <span>{Math.abs(Number(stock.prdy_ctrt))}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
  {Number(stock.acml_vol) >= 100000000
    ? `${(Number(stock.acml_vol) / 100000000).toFixed(1)}억`
    : Number(stock.acml_vol) >= 10000
    ? `${Math.floor(Number(stock.acml_vol) / 10000)}만`
    : Number(stock.acml_vol) >= 1000
    ? `${Math.floor(Number(stock.acml_vol) / 1000)}천`
    : Number(stock.acml_vol)}
</TableCell>          
<TableCell className="text-center">
  {Number(stock.prdy_vol) >= 100000000
    ? `${(Number(stock.prdy_vol) / 100000000).toFixed(1)}억`
    : Number(stock.prdy_vol) >= 10000
    ? `${Math.floor(Number(stock.prdy_vol) / 10000)}만`
    : Number(stock.prdy_vol) >= 1000
    ? `${Math.floor(Number(stock.prdy_vol) / 1000)}천`
    : Number(stock.prdy_vol)}
</TableCell>   
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
