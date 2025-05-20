"use client"

import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

export function RankingCategories() {
  const [expanded, setExpanded] = useState({
    domestic: true,
    overseas: false,
    theme: false,
  })

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted px-4 py-3 font-medium">순위 분석 카테고리</div>

      {/* 국내주식 섹션 */}
      <div>
        <button
          onClick={() => toggleSection("domestic")}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 border-b"
        >
          <span className="font-medium">[국내주식] 순위분석</span>
          {expanded.domestic ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {expanded.domestic && (
          <div className="border-b">
            <ul className="py-2">
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50 text-primary">
                  거래량순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 등락률 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 호가잔량 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 수익자산대표 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 시가총액 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 재무비율 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 시간외잔량 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 주식수/리퍼런스 상위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 이격도 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 시장가치 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 체결강도 상위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 관심종목등록 상위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 예상체결 상승/하락상위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 당사체결종목 상위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 신고가/신저가종목 상위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 배당률 상위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 대량체결건수 상위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 신용잔고 상위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 공매도 상위종목
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 시간외종목순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  국내주식 시간외거래순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  HTS조회상위20종목
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* 해외주식 섹션 */}
      <div>
        <button
          onClick={() => toggleSection("overseas")}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 border-b"
        >
          <span className="font-medium">[해외주식] 순위분석</span>
          {expanded.overseas ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {expanded.overseas && (
          <div className="border-b">
            <ul className="py-2">
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  미국주식 거래량 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  미국주식 등락률 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  미국주식 시가총액 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  중국주식 거래량 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  중국주식 등락률 순위
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* 테마주 섹션 */}
      <div>
        <button
          onClick={() => toggleSection("theme")}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50"
        >
          <span className="font-medium">[테마주] 순위분석</span>
          {expanded.theme ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {expanded.theme && (
          <div>
            <ul className="py-2">
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  테마주 등락률 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  테마주 거래량 순위
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-muted/50">
                  테마주 관심도 순위
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
