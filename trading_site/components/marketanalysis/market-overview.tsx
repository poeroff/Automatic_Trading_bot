"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

const marketData = [
  { name: "09:00", KOSPI: 2750, KOSDAQ: 880 },
  { name: "10:00", KOSPI: 2755, KOSDAQ: 885 },
  { name: "11:00", KOSPI: 2760, KOSDAQ: 890 },
  { name: "12:00", KOSPI: 2758, KOSDAQ: 888 },
  { name: "13:00", KOSPI: 2762, KOSDAQ: 892 },
  { name: "14:00", KOSPI: 2765, KOSDAQ: 895 },
  { name: "15:00", KOSPI: 2770, KOSDAQ: 900 },
]

const marketIndices = [
  { name: "KOSPI", value: 2770.71, change: 0.82, changeValue: 22.51 },
  { name: "KOSDAQ", value: 900.42, change: 1.24, changeValue: 11.03 },
  { name: "KOSPI 200", value: 368.12, change: 0.75, changeValue: 2.74 },
  { name: "선물(F 202406)", value: 371.25, change: -0.15, changeValue: -0.55 },
]

const sectorPerformance = [
  { name: "반도체", change: 2.8 },
  { name: "바이오", change: 1.5 },
  { name: "자동차", change: 0.9 },
  { name: "화학", change: -0.5 },
  { name: "금융", change: 0.3 },
  { name: "IT", change: 1.2 },
  { name: "통신", change: -0.2 },
  { name: "유통", change: 0.6 },
  { name: "건설", change: -0.8 },
  { name: "철강", change: 0.4 },
]

export function MarketOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketIndices.map((index) => (
          <Card key={index.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{index.name}</CardTitle>
              <CardDescription>현재 지수 정보</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{index.value.toLocaleString()}</div>
              <div
                className={`flex items-center mt-1 ${
                  index.change > 0 ? "text-green-500" : index.change < 0 ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                {index.change > 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : index.change < 0 ? (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                ) : null}
                <span>
                  {index.changeValue > 0 ? "+" : ""}
                  {index.changeValue.toFixed(2)} ({Math.abs(index.change)}%)
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>시장 동향</CardTitle>
          <CardDescription>오늘의 KOSPI/KOSDAQ 지수 변화</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="kospi">
            <TabsList className="mb-4">
              <TabsTrigger value="kospi">KOSPI</TabsTrigger>
              <TabsTrigger value="kosdaq">KOSDAQ</TabsTrigger>
            </TabsList>
            <TabsContent value="kospi">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketData}>
                    <defs>
                      <linearGradient id="colorKospi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis domain={["dataMin - 10", "dataMax + 10"]} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area type="monotone" dataKey="KOSPI" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorKospi)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="kosdaq">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketData}>
                    <defs>
                      <linearGradient id="colorKosdaq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis domain={["dataMin - 10", "dataMax + 10"]} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area type="monotone" dataKey="KOSDAQ" stroke="#f43f5e" fillOpacity={1} fill="url(#colorKosdaq)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>업종별 등락률</CardTitle>
          <CardDescription>주요 업종의 오늘 등락률</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {sectorPerformance.map((sector) => (
              <div key={sector.name} className="border rounded-lg p-4">
                <div className="text-sm font-medium mb-2">{sector.name}</div>
                <div
                  className={`text-lg font-bold ${
                    sector.change > 0 ? "text-green-500" : sector.change < 0 ? "text-red-500" : "text-muted-foreground"
                  }`}
                >
                  {sector.change > 0 ? "+" : ""}
                  {sector.change}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
