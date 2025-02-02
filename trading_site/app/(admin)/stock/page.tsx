"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRef } from "react"
import { fetchStockData } from "@/api/Get"
import { useLocation, useNavigate } from "react-router-dom"
import { useRouter, useSearchParams } from "next/navigation"
import { Post } from "@/api/Post"
import { Delete } from "@/api/Delete"

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
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("")
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]); // 초기값을 빈 배열로 설정
  const [marketCapList, setMarketCapList] = useState<{ id: number, date: string; }[]>([]);
  const [volumeList, setVolumeList] = useState<{ id: number, date: string; }[]>([]);
  const [customList, setCustomList] = useState<{ id: number, date: string; }[]>([]);
    const [stockList, setStockList] = useState([
    "삼성전자",
    "SK하이닉스",
    "NAVER",
    "카카오",
    "현대차",
    "LG전자",
    "기아",
    "POSCO홀딩스",
    "삼성바이오로직스",
    "삼성SDI",
    "삼성전자1",
    "SK하이닉스1",
    "NAVER1",
    "카카오1",
    "현대차1",
    "LG전자1",
    "기아1",
    "POSCO홀딩스1",
    "삼성바이오로직스1",
    "삼성SDI1",   
    "삼성전자2",
    "SK하이닉스2",
    "NAVER2",
    "카카오2",
    "현대차2",
    "LG전자2",
    "기아2",
    "POSCO홀딩스2",
    "삼성바이오로직스2",
    "삼성SDI2",

  ])
  


 
  const [newCustomItem, setNewCustomItem] = useState("")

  const handleAddCustomItem = () => {
   
      if (inputRef.current?.value) {
        const code = searchParams.get("code");
        const name = searchParams.get("name");
        if (code) {
          const fetchData = async () => {
            const data = await Post(`http://localhost:4000/stock-data/user-inflection`, Number(inputRef.current?.value),code, undefined)

          };
          fetchData();
        } else if (name) {
          console.log("name")
          const fetchData = async () => {
            const data = await Post(`http://localhost:4000/stock-data/user-inflection`, Number(inputRef.current?.value),undefined, name)
           
          };
          fetchData();
        }
        inputRef.current.value = "";
      }
  }


  const handleDeleteCustomItem = async(id: number) => {
    const fetchData = async () => {
      await Delete(`http://localhost:4000/stock-data/user-inflection`, id)
    }
    fetchData();
    

  }



  useEffect(() => {
    console.log("searchParams", searchParams.get("name"))
    const code = searchParams.get("code");
    const name = searchParams.get("name");


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
          const newCustomList = data.userInflections.map((peak: any) => {
            const dateStr = peak.date.toString(); // peak.date를 문자열로 변환
            const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`; // YYYY-MM-DD 형식으로 변환
          
            return {
              id: peak.id,
              date: formattedDate, // 변환된 날짜를 사용
            };
          });


          setCustomList(newCustomList);
          setVolumeList(newVolumeList);
          setMarketCapList(newMarketCapList);

        } else {
          console.error('No stock data found');
        }
      };
      fetchData();
    } else if (name) {
      const fetchData = async () => {
        const data = await fetchStockData(`http://localhost:4000/stock-data/stock?name=${name}`)
        if (data && data.stockData) {

          setTitle(data.trCode.name)
          setChartData(data.stockData.map((item: any) => ({ date: item.date, value: item.close })));
          const newMarketCapList = data.peakDates.map((peak: any) => ({
            id: peak.id, // name은 비워둡니다.
            date: peak.date, // value를 date로 설정
          }));
          const newVolumeList = data.filteredPeaks.map((peak: any) => ({
            id: peak.id,
            date: peak.date, // value를 date로 설정
          }));
          const newCustomList = data.userInflections.map((peak: any) => {
            const dateStr = peak.date.toString(); // peak.date를 문자열로 변환
            const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`; // YYYY-MM-DD 형식으로 변환
          
            return {
              id: peak.id,
              date: formattedDate, // 변환된 날짜를 사용
            };
          });
          setCustomList(newCustomList);
          setVolumeList(newVolumeList);
          setMarketCapList(newMarketCapList);
        } else {
          console.error('No stock data found');
        }
      };
      fetchData();
    }
  }, [searchParams]); // location이 변경될 때마다 실행

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
const [selectedStock, setSelectedStock] = useState<string | null>(null)
const handleStockSelect = async (stock: string) => {
  setSelectedStock(stock)
  // 여기서 실제 API 호출을 통해 해당 주식의 데이터를 가져와야 합니다.
  // 예시 코드:
  // const data = await fetchStockData(`http://localhost:4000/stock-data/stock?code=${stock}`);
  // setChartData(data.stockData.map((item: any) => ({ date: item.date, value: item.close })));
}
const handleCompletionCheck = () => {
  // 여기에 검사 완료 버튼 클릭 시 수행할 로직을 추가합니다.
  console.log("검사 완료 버튼이 클릭되었습니다.")
  // 예: 데이터 저장, 상태 업데이트, API 호출 등
}

console.log
  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="border-b">
        <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-2 pb-2" style={{ width: "max-content" }}>
              {stockList.map((stock) => (
                <Button
                  key={stock}
                  onClick={() => handleStockSelect(stock)}
                  variant={selectedStock === stock ? "default" : "outline"}
                  className="px-4 py-2 whitespace-nowrap"
                >
                  {stock}
                </Button>
              ))}
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
                  <div key={item.id.toString()} className="flex justify-between items-center py-2 border-b">
                    <span className="font-bold">{item.date}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCustomItem(item.id)}
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
                  ref={inputRef}
                />
                <Button onClick={handleAddCustomItem}>추가</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center mt-8">
          <Button onClick={handleCompletionCheck} className="px-8 py-3 text-lg">
            검사 완료
          </Button>
        </div>
      </main>
    </div>
  )
}
