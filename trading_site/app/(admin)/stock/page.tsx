"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRef } from "react"
import { fetchStockData } from "@/api/Get"
import { useLocation, useNavigate } from "react-router-dom"

// const chartData = [
//   { date: "2024-01-01", value: 4000 },
//   { date: "2024-01-02", value: 3000 },
//   { date: "2024-01-03", value: 2000 },
//   { date: "2024-01-04", value: 2780 },
//   { date: "2024-01-05", value: 1890 },
//   { date: "2024-01-06", value: 2390 },
//   { date: "2024-01-07", value: 3490 },
// ]

export default function StockDashboard() {

  const pulseAnimation = `
  @keyframes pulse {
    0% { r: 4; }
    50% { r: 8; }
    100% { r: 4; }
  }
`;
  const searchRef = useRef<HTMLInputElement>(null)
  const location = useLocation(); // 현재 URL의 location 객체 가져오기
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("")
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]); // 초기값을 빈 배열로 설정
  const [marketCapList, setMarketCapList] = useState<{ id: Number, date: string; }[]>([]);
  const [volumeList, setVolumeList] = useState<{ id: Number, date: string; }[]>([]);


  const [customList, setCustomList] = useState([
    "관심종목1",
    "관심종목2",
  ])
  const [newCustomItem, setNewCustomItem] = useState("")

  const handleAddCustomItem = () => {
    if (newCustomItem) {
      setCustomList([...customList, newCustomItem])
      setNewCustomItem("")
    }
  }

  const handleDeleteCustomItem = (index: number) => {
    setCustomList(customList.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = searchRef.current?.value;

    if (value) {
      // 숫자인지 확인
      const isNumeric = !isNaN(Number(value));

      if (isNumeric) {
        // 숫자일 경우 code로 설정
        navigate(`/stock?code=${value}`);
      } else {
        // 숫자가 아닐 경우 name으로 설정
        navigate(`/stock?name=${value}`);
      }
      if (searchRef.current) {
        searchRef.current.value = ""; // 입력 필드 초기화
      }
    }

  };
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search); // URL의 쿼리 매개변수 가져오기
    const code = queryParams.get("code");
    const name = queryParams.get("name");


    if (code) {

      const fetchData = async () => {
        const data = await fetchStockData(`http://localhost:4000/stock-data/stock?code=${code}`)
        if (data && data.stockData) {
          setTitle(data.trCode.name)
          setChartData(data.stockData.map((item: any) => ({ date: item.date, value: item.high })));
          const newMarketCapList = data.peakDates.map((peak: any) => ({
            id: peak.id,
            date: peak.date, // value를 date로 설정
          }));
          const newVolumeList = data.filteredPeaks.map((peak: any) => ({
            id: peak.id,
            date: peak.date, // value를 date로 설정
          }));

          setVolumeList(newVolumeList);
          setMarketCapList(newMarketCapList);

        } else {
          console.error('No stock data found');
        }
      };
      fetchData();
    } else if (name) {
      console.log("name")
      const fetchData = async () => {
        const data = await fetchStockData(`http://localhost:4000/stock-data/stock?name=${name}`)
        if (data && data.stockData) {

          setTitle(data.trCode.name)
          setChartData(data.stockData.map((item: any) => ({ date: item.date, value: item.close })));
          const newMarketCapList = data.peakDates.map((peak: any) => ({
            name: "", // name은 비워둡니다.
            value: peak.date, // value를 date로 설정
          }));

          setMarketCapList(newMarketCapList);
        } else {
          console.error('No stock data found');
        }
      };
      fetchData();
    }
  }, [location]); // location이 변경될 때마다 실행

 // 리스트 아이템 클릭 핸들러 추가
const handleDateClick = (date: string) => {
  setSelectedDate(date);
  // 2초 후에 선택 상태 해제
  setTimeout(() => setSelectedDate(null), 2000);
};

// renderCustomDots 함수 수정
const renderCustomDots = (props: any) => {
  const { cx, cy, payload } = props;
  const date = payload.date;
  const isSelected = date === selectedDate;

  return (
    <g key={`dots-${date}`}>
      {marketCapList.some((item) => item.date === date) && (
        <circle
          key={`peak-${date}`}
          cx={cx}
          cy={cy}
          r={isSelected ? 6 : 4}
          fill="red"
          style={{
            transition: "r 0.3s ease-in-out",
            animation: isSelected ? "pulse 1s infinite" : "none"
          }}
        />
      )}
      {volumeList.some((item) => item.date === date) && (
        <circle
          key={`volume-${date}`}
          cx={cx}
          cy={cy}
          r={isSelected ? 6 : 4}
          fill="blue"
          style={{
            transition: "r 0.3s ease-in-out",
            animation: isSelected ? "pulse 1s infinite" : "none"
          }}
        />
      )}
    </g>
  );
};

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <form className="relative" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="종목명 또는 종목코드를 입력하세요"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  ref={searchRef}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700">
                  <svg

                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Chart Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
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
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow">
                        <p className="text-sm">{`날짜: ${new Date(payload[0].payload.date).toLocaleDateString()}`}</p>
                        <p className="text-sm font-bold">{`가격: ${payload[0].value}`}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Line
                  key="stock-line"
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  key="peak-line"
                  type="monotone"
                  dataKey="value"
                  stroke="#ff0000"
                  dot={(props) => renderCustomDots({ ...props, dotType: 'peak' })}
                />
                <Line
                  key="volume-line"
                  type="monotone"
                  dataKey="value"
                  stroke="#0000ff"
                  dot={(props) => renderCustomDots({ ...props, dotType: 'volume' })}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Card>
            <CardHeader>
              <CardTitle>고점(빨간색)</CardTitle>
            </CardHeader>
            <CardContent>
              <style>{pulseAnimation}</style>
              <div className="h-[450px] overflow-y-auto">
                {marketCapList
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((item) => (
                    <div
                      key={item.id.toString()}
                      className="flex justify-center items-center py-2 border-b cursor-pointer hover:bg-gray-100"
                      onClick={() => handleDateClick(item.date)}
                    >
                      <span className="font-bold">{item.date}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>변곡점(파란색)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[450px] overflow-y-auto">
                {volumeList
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((item) => (
                    <div
                      key={item.id.toString()}
                      className="flex justify-center items-center py-2 border-b cursor-pointer hover:bg-gray-100"
                      onClick={() => handleDateClick(item.date)}
                    >
                      <span className="font-bold">{item.date}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>변곡점 설정 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[450px] overflow-y-auto mb-4">
                {customList.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <span>{item}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCustomItem(index)}
                      className="h-8 w-8 p-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      <span className="sr-only">Delete item</span>
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="종목명"
                  value={newCustomItem}
                  onChange={(e) => setNewCustomItem(e.target.value)}
                />
                <Button onClick={handleAddCustomItem}>추가</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
