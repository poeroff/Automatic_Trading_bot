'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ListItem {
  id: number;
  date: string;
}

interface ChartPageProps {
  marketCapList: ListItem[];
  volumeList: ListItem[];
  chartData: { date: string; value: number }[];
  name: string | null;
  code: string | null;
  selectedDate: string | null;
}

const ChartPage = ({ marketCapList, volumeList, chartData, name, code, selectedDate }: ChartPageProps) => {
  // ✅ useMemo를 사용해 customDots 미리 계산하여 최적화
  const customDots = useMemo(() => {
    return chartData.map(({ date }) => ({
      date,
      isSelected: date === selectedDate,
      isPeak: marketCapList.some((item) => item.date === date),
      isVolume: volumeList.some((item) => item.date === date),
    }));
  }, [chartData, selectedDate, marketCapList, volumeList]);

  // ✅ useCallback을 활용하여 renderCustomDots 최적화
  const renderCustomDots = useCallback(
    (props: any) => {
      const { cx, cy, payload } = props;
      const dotInfo = customDots.find((dot) => dot.date === payload.date);
      if (!dotInfo) return <></>;

      const { isSelected, isPeak, isVolume } = dotInfo;

      return (
        <g key={`dots-${payload.date}`}>
          {isPeak && (
            <circle
              cx={cx}
              cy={cy}
              r={isSelected ? 6 : 4}
              fill="red"
              style={{
                transition: "r 0.3s ease-in-out",
                animation: isSelected ? "pulse 1s infinite" : "none",
              }}
            />
          )}
          {isVolume && (
            <circle
              cx={cx}
              cy={cy}
              r={isSelected ? 6 : 4}
              fill="blue"
              style={{
                transition: "r 0.3s ease-in-out",
                animation: isSelected ? "pulse 1s infinite" : "none",
              }}
            />
          )}
        </g>
      );
    },
    [customDots]
  );

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>
          {name} ({code})
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              interval="preserveStartEnd"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="text-sm">{`날짜: ${new Date(payload[0].payload.date).toLocaleDateString()}`}</p>
                      <p className="text-sm font-bold">{`가격: ${payload[0].value}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* 기본 선 */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />

            {/* Custom Dots (Recharts의 dot 속성을 활용) */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="transparent"
              dot={renderCustomDots} // ✅ 여기서 `cx`, `cy`를 자동으로 전달받음
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
export default ChartPage
