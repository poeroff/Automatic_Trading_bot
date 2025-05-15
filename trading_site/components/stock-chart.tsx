"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { date: "1월", price: 2400 },
  { date: "2월", price: 1398 },
  { date: "3월", price: 9800 },
  { date: "4월", price: 3908 },
  { date: "5월", price: 4800 },
  { date: "6월", price: 3800 },
  { date: "7월", price: 4300 },
  { date: "8월", price: 5300 },
  { date: "9월", price: 6200 },
  { date: "10월", price: 7800 },
  { date: "11월", price: 8500 },
  { date: "12월", price: 9200 },
]

export function StockChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>KOSPI 지수</CardTitle>
        <CardDescription>연간 지수 변동 추이</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            price: {
              label: "가격",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="aspect-[4/3]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
