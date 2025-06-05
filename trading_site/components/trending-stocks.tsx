"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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



export function TrendingStocks() {
  const initialData: StockRankingData[] = [];
  const [stockRankings, setStockRankings] = useState<StockRankingData[]>(initialData);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("http://localhost:4000/stock-rankings/tradingvolume")
      console.log("trending",response)
      setStockRankings(response.data)
    }
    fetchData()

  },[])
 

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
          {stockRankings &&stockRankings.map((stock) => (
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
