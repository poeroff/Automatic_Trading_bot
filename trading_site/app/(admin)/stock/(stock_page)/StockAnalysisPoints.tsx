"use client"
import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRef } from "react"
import { Get } from "@/services/Get"
import { useRouter, useSearchParams } from "next/navigation"
import { Post } from "@/services/Post"
import { Delete } from "@/services/Delete"
import ChartPage from "./chart"
import React from "react"
import axios from "axios"



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


const pulseAnimation = `
@keyframes pulse {
  0% { r: 4; }
  50% { r: 8; }
  100% { r: 4; }
}
`;


interface StockAnalysisPointsProps {
  code: string | null;
  name: string | null;
}

const StockAnalysisPoints = ({ code , name } : StockAnalysisPointsProps)  =>{
  const highpoint = useRef<HTMLInputElement>(null)
  const inflectionpointRef = useRef<HTMLInputElement>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [title, setTitle] = useState<StockAnalysisPointsProps>({code: null,name: null});
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]); // 초기값을 빈 배열로 설정
  const [marketCapList, setMarketCapList] = useState<{ id: number, date: string; }[]>([]);
  const [volumeList, setVolumeList] = useState<{ id: number, date: string; }[]>([]);
  const [customList, setCustomList] = useState<{ id: number; date: string; highdate: string | null;}[]>([]);  
  const [ErrorMessage, setErrorMessage] = useState<string | null>()
  const [isPending, startTransition] = useTransition();

  // 주식,고점,변곡점,변곡점 설정정 데이터 가져오기
  const fetchStockData = useCallback(async (codeParam?: string, nameParam?: string) => {
    const url = codeParam ? `http://localhost:4000/stock-data/stock?code=${codeParam}` : `http://localhost:4000/stock-data/stock?name=${nameParam}`;
    const data = await Get(url);
    if (data?.stockData) {
      startTransition(() => {
        setTitle({name : data.trCode.name, code : data.trCode.code});
        setChartData(data.stockData.map((item: any) => ({
          date: item.date,
          value: codeParam ? item.high : item.close
        })));

        setMarketCapList(data.peakDates.map((peak: any) => ({
          id: peak.id,
          date: peak.date,
        })));

        setVolumeList(data.filteredPeaks.map((peak: any) => ({
          id: peak.id,
          date: peak.date,
        })));
        
        setCustomList(data.userInflections.map((peak: any) => {
          const dateStr = peak.date.toString();
        
          if(peak.highdate == null){
         
            return {
              id: peak.id,
              date: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
              highdate : null
            };

          }
          else{
            const highdate = peak.highdate.toString();
            return {
              id: peak.id,
              date: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
              highdate : `${highdate.slice(0, 4)}-${highdate.slice(4, 6)}-${highdate.slice(6, 8)}`
            };

          }
         
        }));
      });
    }
  }, []);





  useEffect(() => {
    setErrorMessage(null)
    if (code || name) {
      fetchStockData(code ?? undefined, name ?? undefined);
    }

    if (!code && !name) return; // ✅ 불필요한 실행 방지

    // CSS 스타일 한 번만 추가
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      styleSheet.remove();
    };
  }, [code, name, fetchStockData]);

  // 나머지 핸들러 함수들도 useCallback으로 메모이제이션
  const handleDateClick = useCallback((date: string) => {
    setSelectedDate(date);
    setTimeout(() => setSelectedDate(null), 2000);
  }, []);

  const handleAddCustomItem = useCallback(async (event :React.FormEvent) => {
    event.preventDefault()
    const highPointValue = highpoint.current?.value;
    if (!inflectionpointRef.current?.value) return;

    if (customList.length > 1) {
      setErrorMessage("* 3개 이상의 변곡점을 추가할 수 없습니다.");
      return;
    }

    const dateValue = inflectionpointRef.current.value;
    if (!isValidDate(dateValue)) {
      setErrorMessage('* 올바른 날짜 형식(YYYYMMDD)을 입력하세요.');
      return;
    }

    try {
      const payload: Record<string, any> = {
        date: Number(dateValue), // 날짜 값 전송
        highPoint: highPointValue ? Number(highPointValue) : null, // highpoint가 없으면 null
      };
    
      if (code) payload.code = code;
      if (name) payload.name = name;
      const result = await axios.post("http://localhost:4000/stock-data/user-inflection", payload);
      console.log(result)
      // 데이터 리프레시
      fetchStockData(code ?? undefined, name ?? undefined);
    } catch (error) {
      setErrorMessage('* 저장 중 오류가 발생.(DB에 일치하는 값이 없습니다, 인터넷 문제)');
    }
  }, [code, name, customList.length, fetchStockData]);

  const handleDeleteCustomItem = useCallback(async (id: number) => {
    try {
      await Delete(`http://localhost:4000/stock-data/user-inflection`, id);
      // 데이터 리프레시
      fetchStockData(code ?? undefined, name ?? undefined);
    } catch (error) {
      setErrorMessage('* 삭제 중 오류가 발생했습니다.');
    }
  }, [code, name]);


  // 날짜 유효성 검사 함수
  const isValidDate = useCallback((dateString: string) => {
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10);
    const day = parseInt(dateString.substring(6, 8), 10);

    // 월이 1~12 사이인지 확인
    if (month < 1 || month > 12) return false;

    // 각 월에 따른 일 수 확인
    const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return day > 0 && day <= daysInMonth[month - 1];
  }, [inflectionpointRef.current?.value]);


  return <> <ChartPage marketCapList={marketCapList} volumeList={volumeList} chartData={chartData} name={title.name} code = {title.code} selectedDate={selectedDate} customList={customList}></ChartPage><div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>고점(빨간색)</CardTitle>
      </CardHeader>
      <CardContent>
        <style>{pulseAnimation}</style>
        <div className="h-[500px] overflow-y-auto relative bg-gray-50 rounded-lg shadow-md p-4">
          {isPending ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-lg font-semibold text-gray-700">데이터 로딩 중...</p>
            </div>
          ) : (
            marketCapList
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((item) => (
                <div
                  key={item.id.toString()}
                  className="flex justify-center items-center py-3 border-b cursor-pointer hover:bg-blue-100 transition duration-200"
                  onClick={() => handleDateClick(item.date)}
                >
                  <span className="font-bold text-gray-800">{item.date}</span>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>변곡점(파란색)</CardTitle>
      </CardHeader>
      <CardContent>
        <style>{pulseAnimation}</style>
        <div className="h-[500px] overflow-y-auto relative bg-gray-50 rounded-lg shadow-md p-4">
          {isPending ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-lg font-semibold text-gray-700">데이터 로딩 중...</p>
            </div>
          ) : (
            volumeList
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((item) => (
                <div
                  key={item.id.toString()}
                  className="flex justify-center items-center py-3 border-b cursor-pointer hover:bg-blue-100 transition duration-200"
                  onClick={() => handleDateClick(item.date)}
                >
                  <span className="font-bold text-gray-800">{item.date}</span>
                </div>
              ))
          )}
        </div>

      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>변곡점 설정 목록</CardTitle>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-semibold text-gray-700">데이터 로딩 중...</p>
          </div>
        ) :(<>
          <div className="h-[450px] overflow-y-auto mb-4">
            {customList.map((item, index) => (
              <div key={item.id.toString()} className="flex justify-between items-center py-2 border-b">
                {item.highdate != null ? <span className="font-bold text-red-600">{item.highdate}</span> : <span className="font-bold text-red-600">None</span>}
                <span className="font-bold text-blue-600">{item.date}</span>
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
        <form className="flex gap-2">
          <Input
            placeholder="고점"
            ref={highpoint}
            type="number"
          />
          <Input
            placeholder="변곡점"
            ref={inflectionpointRef}
            type="number"
          />
          <Button onClick={handleAddCustomItem}>추가</Button>
        </form>
        </>)}
      </CardContent>
    </Card>
  </div></>
}


export default StockAnalysisPoints

