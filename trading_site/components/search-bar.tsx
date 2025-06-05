// components/search-bar.tsx - 새로운 검색 컴포넌트 파일

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 종목 데이터
const STOCK_LIST = [
  { code: "005930", name: "삼성전자" },
  { code: "000660", name: "SK하이닉스" },
  { code: "035420", name: "NAVER" },
  { code: "005380", name: "현대차" },
  { code: "035720", name: "카카오" },
  { code: "051910", name: "LG화학" },
  { code: "373220", name: "LG에너지솔루션" },
  { code: "006400", name: "삼성SDI" },
  { code: "207940", name: "삼성바이오로직스" },
  { code: "068270", name: "셀트리온" },
  { code: "323410", name: "카카오뱅크" },
  { code: "352820", name: "하이브" },
  { code: "247540", name: "에코프로비엠" },
  { code: "086520", name: "에코프로" },
  { code: "003670", name: "포스코퓨처엠" },
];

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof STOCK_LIST>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  // 검색어에 따른 자동완성 필터링
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = STOCK_LIST.filter(stock => 
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.code.includes(searchQuery)
    );

    setSuggestions(filtered.slice(0, 8)); // 최대 8개만 표시
    setShowSuggestions(filtered.length > 0);
  }, [searchQuery]);

  // 검색 실행
  const handleSearch = (stockCode?: string, stockName?: string) => {
    const targetCode = stockCode || searchQuery;
    
    if (stockCode) {
      router.push(`/news?ticker=${stockCode}&name=${encodeURIComponent(stockName || '')}`);
    } else {
      const found = STOCK_LIST.find(stock => 
        stock.name === searchQuery || stock.code === searchQuery
      );
      
      if (found) {
        router.push(`/news?ticker=${found.code}&name=${encodeURIComponent(found.name)}`);
      } else {
        alert('해당 종목을 찾을 수 없습니다.');
      }
    }
    
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // 키보드 이벤트
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSearch(suggestions[0].code, suggestions[0].name);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => searchQuery && setShowSuggestions(suggestions.length > 0)}
            placeholder="종목명 검색..."
            className="w-full"
          />
          
          {/* 자동완성 드롭다운 */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {suggestions.map((stock) => (
                <div
                  key={stock.code}
                  onClick={() => handleSearch(stock.code, stock.name)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-gray-900">{stock.name}</div>
                    <div className="text-sm text-gray-500">{stock.code}</div>
                  </div>
                  <div className="text-xs text-blue-600">분석 →</div>
                </div>
              ))}
            </div>
          )}

          {/* 검색어가 있지만 결과가 없을 때 */}
          {searchQuery && !showSuggestions && suggestions.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4 text-center text-gray-500">
              검색 결과가 없습니다
            </div>
          )}
        </div>
        
        <Button onClick={() => handleSearch()}>
          검색
        </Button>
      </div>
    </div>
  );
}