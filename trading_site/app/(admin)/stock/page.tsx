"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRef } from "react"
import { Get } from "@/services/Get"
import { useRouter, useSearchParams } from "next/navigation"
import { Post } from "@/services/Post"
import { Delete } from "@/services/Delete"





export default function StockDashboard() {

// CSS 스타일
  const spinnerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh', // 전체 화면을 차지하도록 설정
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // 배경색 설정
    position: 'fixed', // 'fixed'로 설정
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999, // 다른 요소 위에 표시
  };

  // CSS 애니메이션 추가
  const styles = `
  .loader {
    border: 8px solid #f3f3f3; /* Light grey */
    border-top: 8px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  `;

  // 스타일을 문서에 추가
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

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
  const [ErrorMessage, setErrorMessage] = useState<string>()
  const [stockList, setStockList] = useState<{ id: number, code: string, name:string }[]>([]);
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  
  // 날짜 유효성 검사 함수
  const isValidDate = (dateString: string) => {
      const year = parseInt(dateString.substring(0, 4), 10);
      const month = parseInt(dateString.substring(4, 6), 10);
      const day = parseInt(dateString.substring(6, 8), 10);
  
      // 월이 1~12 사이인지 확인
      if (month < 1 || month > 12) return false;
  
      // 각 월에 따른 일 수 확인
      const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      return day > 0 && day <= daysInMonth[month - 1];
  };
  //사용자 변곡점 설정  추가 목록 함수수
   const handleAddCustomItem = () => {
    if (customList.length > 1  ) {
      setErrorMessage("* 3개 이상의 변곡점을 추가할 수 없습니다.")
      return;
    }

    if (!isValidDate(inputRef.current?.value || '')) {
      setErrorMessage('* 올바른 날짜 형식(YYYYMMDD)을 입력하세요.');
      return; // 에러 발생 시 함수 종료
    }
  
    else {
      if (inputRef.current?.value) {
        const code = searchParams.get("code");
        const name = searchParams.get("name");
        if (code) {
          const fetchData = async () => {
            await Post(`http://localhost:4000/stock-data/user-inflection`, Number(inputRef.current?.value), code, undefined)

          };
          fetchData();
        } else if (name) {

          const fetchData = async () => {
           await Post(`http://localhost:4000/stock-data/user-inflection`, Number(inputRef.current?.value), undefined, name)

          };
          fetchData();
        }
        inputRef.current.value = "";
      }
    }

  }

  //사용자 변곡점 설정 목록 삭제 함수
  const handleDeleteCustomItem = async (id: number) => {
    const fetchData = async () => {
      await Delete(`http://localhost:4000/stock-data/user-inflection`, id)
    }
    fetchData();
  }


  // 주식,고점,변곡점,변곡점 설정정 데이터 가져오기
  useEffect(() => {
    const code = searchParams.get("code");
    const name = searchParams.get("name");
    if (code) {
      const fetchData = async () => {
        const data = await Get(`http://localhost:4000/stock-data/stock?code=${code}`)
        const falseCertified = await Get(`http://localhost:4000/stock-data/false-certified`)
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
          setStockList(falseCertified)
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
        const data = await Get(`http://localhost:4000/stock-data/stock?name=${name}`)
        const falseCertified = await Get(`http://localhost:4000/stock-data/false-certified`)
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
          setStockList(falseCertified)
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

  const handleCompletionCheck = () => {
    const code = searchParams.get("code");
    const name = searchParams.get("name");

    const fetchData = async (url: string) => {
      setLoading(true); // 로딩 시작
      const response = await Get(url);
      setLoading(false); // 로딩 종료
      return response;
    };

    const processData = async () => {
      if (code) {
        await fetchData(`http://localhost:4000/stock-data/certified?code=${code}`);
        const falseCertified = await fetchData(`http://localhost:4000/stock-data/false-certified`);
        if (falseCertified.length > 0) {
          router.push(`/stock?code=${falseCertified[1].code}`);
        }
      } else if (name) {
        await fetchData(`http://localhost:4000/stock-data/certified?name=${name}`);
        const falseCertified = await fetchData(`http://localhost:4000/stock-data/false-certified`);
        if (falseCertified.length > 0) {
          router.push(`/stock?code=${falseCertified[1].code}`);
        }
      }
    };

    processData();
  };

  const LoadingSpinner: React.FC = () => {
    return (
      <div style={spinnerStyle}>
        <div className="loader"></div>
      </div>
    );
  };

   




  return (
    <div className="min-h-screen bg-background">
     {loading ?  <LoadingSpinner /> :  <>     
      <header className="border-b">
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2" style={{ width: "max-content" }}>
            {stockList.map((stock) => (
              <Button
                key={stock.id}
                onClick={() => router.push(`/stock?code=${stock.code}`)}
                variant={selectedStock === stock.name ? "default" : "outline"}
                className="px-4 py-2 whitespace-nowrap"
              >
                {stock.name}
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
              {ErrorMessage && (
                <span className="text-red-600 font-bold text-sm">
                    {ErrorMessage}
                </span>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="날짜(YYYYMMDD) 입력"
                  ref={inputRef}
                  type="number"
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
      </main></>}
    </div>
  )
}
