"use client"

import { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, BarChart3, Clock, ExternalLink, Bot, Newspaper, Star, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Stock {
  symbol: string
  name: string
  market: string
}

interface NewsItem {
  title: string
  content?: string
  url?: string
  source?: string
  time?: string
  ai_analysis?: {
    sentiment: string
    confidence: number
    summary?: string
    investment_advice?: string
    price_impact?: string
  }
}

interface AnalysisResult {
  stock_name: string
  stock_code: string
  articles: NewsItem[]
  gemini_analysis?: {
    overall_sentiment: string
    average_sentiment_score: number
    total_articles: number
    summary: string
    recommendation: string
  }
  crawled_at: string
}

export function NewsAnalysisInterface() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [majorStocks, setMajorStocks] = useState<Stock[]>([])
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

  // 주요 종목 로드
  useEffect(() => {
    fetchMajorStocks()
  }, [])

  const fetchMajorStocks = async () => {
    try {
      console.log('🔗 백엔드 API 연결 시도...')
      setApiStatus('connecting')
      
      const response = await fetch('http://localhost:8000/news/stocks/major')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ 주요 종목 데이터:', data)
      
      setMajorStocks(data.data || [])
      setApiStatus('connected')
      setError(null)
      
    } catch (error) {
      console.error('❌ 백엔드 연결 실패:', error)
      setApiStatus('error')
      setError(`백엔드 서버 연결 실패: ${error}`)
      
      // 백엔드 연결 실패 시 기본 종목 리스트 제공
      setMajorStocks([
        { symbol: '005930', name: '삼성전자', market: 'KOSPI' },
        { symbol: '000660', name: 'SK하이닉스', market: 'KOSPI' },
        { symbol: '035420', name: 'NAVER', market: 'KOSPI' },
        { symbol: '005380', name: '현대차', market: 'KOSPI' },
        { symbol: '035720', name: '카카오', market: 'KOSPI' },
        { symbol: '051910', name: 'LG화학', market: 'KOSPI' },
        { symbol: '373220', name: 'LG에너지솔루션', market: 'KOSPI' },
        { symbol: '207940', name: '삼성바이오로직스', market: 'KOSPI' }
      ])
    }
  }

  // 종목 검색 처리
  const handleStockSearch = async (stockCode: string, stockName: string) => {
    console.log(`🔍 종목 선택: ${stockName} (${stockCode})`)
    
    setLoading(true)
    setSelectedStock({ symbol: stockCode, name: stockName, market: 'KOSPI' })
    setAnalysisResult(null)
    setNewsData([])
    setError(null)
    
    try {
      console.log('📰 뉴스 크롤링 API 호출 중...')
      
      // 백엔드 뉴스 크롤링 및 분석 API 호출
      const response = await fetch(`http://localhost:8000/news/crawl-and-analyze/?ticker=${stockCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('📡 API 응답 상태:', response.status, response.statusText)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('📊 뉴스 분석 결과:', result)
      
      if (result.success && result.data) {
        // 뉴스 데이터 설정
        const articles = result.data.articles || []
        setNewsData(articles)
        
        console.log(`✅ ${stockName} 뉴스 ${articles.length}개 로드됨`)
        
        // 분석 결과가 있으면 설정
        if (result.data.ai_analysis_summary) {
          setAnalysisResult({
            stock_name: stockName,
            stock_code: stockCode,
            articles: articles,
            gemini_analysis: {
              overall_sentiment: result.data.ai_analysis_summary.overall_sentiment || '분석 중',
              average_sentiment_score: 0.7,
              total_articles: result.data.crawled_articles || articles.length,
              summary: result.data.ai_analysis_summary.market_outlook || '뉴스 분석을 진행하고 있습니다.',
              recommendation: result.data.ai_analysis_summary.investment_recommendation || '분석 중'
            },
            crawled_at: result.data.crawled_at || new Date().toISOString()
          })
          console.log('🤖 AI 분석 결과 설정 완료')
        }
        
      } else {
        console.error('❌ 뉴스 분석 실패:', result.error || result.message)
        setError(`뉴스 분석 실패: ${result.error || result.message || '알 수 없는 오류'}`)
        
        // 실패 시에도 샘플 뉴스 표시
        const sampleNews = createSampleNews(stockName)
        setNewsData(sampleNews)
      }
    } catch (error) {
      console.error('🚨 API 요청 실패:', error)
      setError(`API 요청 실패: ${error}`)
      
      // 에러 시에도 샘플 뉴스 표시
      const sampleNews = createSampleNews(stockName)
      setNewsData(sampleNews)
    } finally {
      setLoading(false)
    }
  }

  // 샘플 뉴스 생성 함수
  const createSampleNews = (stockName: string): NewsItem[] => {
    return [
      {
        title: `${stockName} 주가 상승세 지속, 투자자들 관심 집중`,
        content: `${stockName}가 최근 긍정적인 실적 전망으로 주가 상승세를 보이고 있다.`,
        source: '샘플뉴스',
        time: '1시간 전',
        ai_analysis: {
          sentiment: '긍정',
          confidence: 0.85,
          summary: '긍정적인 실적 전망으로 투자심리 개선',
          investment_advice: '매수 검토',
          price_impact: '상승 예상'
        }
      },
      {
        title: `${stockName} 신기술 발표로 미래 성장 동력 확보`,
        content: `${stockName}가 차세대 기술 개발에 성공하며 장기 성장 가능성을 높였다.`,
        source: '샘플뉴스',
        time: '3시간 전',
        ai_analysis: {
          sentiment: '매우긍정',
          confidence: 0.92,
          summary: '신기술 개발로 장기 성장 전망 밝음',
          investment_advice: '적극 매수',
          price_impact: '급등 예상'
        }
      },
      {
        title: `${stockName} 실적 발표 앞두고 시장 기대감 증가`,
        content: `${stockName}의 다음 분기 실적 발표를 앞두고 시장의 기대감이 높아지고 있다.`,
        source: '샘플뉴스',
        time: '5시간 전',
        ai_analysis: {
          sentiment: '중립',
          confidence: 0.70,
          summary: '실적 발표 대기로 관망세 지속',
          investment_advice: '관망',
          price_impact: '중립'
        }
      }
    ]
  }

  // 개별 뉴스 AI 분석
  const analyzeNews = async (newsItem: NewsItem) => {
    if (!selectedStock) return
    
    console.log(`🤖 뉴스 AI 분석 시작: ${newsItem.title.substring(0, 30)}...`)
    
    setSelectedNews(newsItem)
    setLoading(true)
    
    try {
      // Gemini AI 분석 API 호출
      const response = await fetch(`http://localhost:8000/news/gemini-analyze/${selectedStock.symbol}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('🎯 Gemini 분석 결과:', result)
      
      if (result.success && result.data) {
        setAnalysisResult(result.data)
        console.log('✅ Gemini AI 분석 완료')
      } else {
        console.error('❌ Gemini 분석 실패:', result.error)
        
        // 분석 실패 시 기본 결과 설정
        setAnalysisResult({
          stock_name: selectedStock.name,
          stock_code: selectedStock.symbol,
          articles: newsData,
          gemini_analysis: {
            overall_sentiment: '분석 실패',
            average_sentiment_score: 0,
            total_articles: newsData.length,
            summary: 'AI 분석에 실패했습니다. 나중에 다시 시도해 주세요.',
            recommendation: '수동 분석 필요'
          },
          crawled_at: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('🚨 Gemini 분석 실패:', error)
      setError(`AI 분석 실패: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // 필터된 종목 리스트
  const filteredStocks = majorStocks.filter(stock => 
    stock.name.includes(searchTerm) || stock.symbol.includes(searchTerm)
  )

  const getSentimentColor = (sentiment: string) => {
    const sentimentMap: { [key: string]: string } = {
      '매우긍정': 'text-blue-600',
      '긍정': 'text-green-600', 
      '중립': 'text-gray-600',
      '부정': 'text-red-600',
      '매우부정': 'text-red-800'
    }
    return sentimentMap[sentiment] || 'text-gray-600'
  }

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment?.includes('긍정')) return <TrendingUp className="w-4 h-4" />
    if (sentiment?.includes('부정')) return <TrendingDown className="w-4 h-4" />
    return <BarChart3 className="w-4 h-4" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter md:text-4xl mb-2">📰 AI 뉴스 분석</h1>
        <p className="text-muted-foreground md:text-xl">종목을 검색하여 관련 뉴스와 AI 분석 결과를 확인하세요</p>
        
        {/* API 상태 표시 */}
        <div className="mt-4">
          {apiStatus === 'connecting' && (
            <Badge variant="outline" className="text-yellow-600">
              🔗 백엔드 연결 중...
            </Badge>
          )}
          {apiStatus === 'connected' && (
            <Badge variant="outline" className="text-green-600">
              ✅ 백엔드 연결됨
            </Badge>
          )}
          {apiStatus === 'error' && (
            <Badge variant="outline" className="text-red-600">
              ❌ 백엔드 연결 실패 (샘플 데이터 사용중)
            </Badge>
          )}
        </div>
      </div>

      {/* 에러 메시지 - Alert 대신 Card 사용 */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 검색 섹션 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="종목명 또는 코드를 입력하세요 (예: 삼성전자, 005930)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* 검색 결과 */}
          {searchTerm && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {filteredStocks.map((stock) => (
                <Button
                  key={stock.symbol}
                  variant="outline"
                  onClick={() => handleStockSearch(stock.symbol, stock.name)}
                  className="p-3 h-auto text-left justify-start"
                >
                  <div>
                    <div className="font-medium">{stock.name}</div>
                    <div className="text-sm text-muted-foreground">{stock.symbol} · {stock.market}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 종목 정보 & 뉴스 리스트 */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 선택된 종목 정보 */}
          {selectedStock && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedStock.name}</CardTitle>
                    <CardDescription>{selectedStock.symbol}</CardDescription>
                  </div>
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                
                {loading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>뉴스를 분석하고 있습니다...</span>
                  </div>
                )}
              </CardHeader>
            </Card>
          )}

          {/* 뉴스 리스트 */}
          {newsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-blue-600" />
                  관련 뉴스 ({newsData.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsData.map((news, index) => (
                    <Card 
                      key={index}
                      className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-blue-500"
                      onClick={() => analyzeNews(news)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2 line-clamp-2 text-lg">
                              {news.title}
                            </h4>
                            
                            {news.ai_analysis && (
                              <div className="flex items-center gap-2 mb-2">
                                {getSentimentIcon(news.ai_analysis.sentiment)}
                                <Badge variant="outline" className={getSentimentColor(news.ai_analysis.sentiment)}>
                                  {news.ai_analysis.sentiment} ({Math.round(news.ai_analysis.confidence * 100)}%)
                                </Badge>
                                <Badge variant="outline">
                                  {news.ai_analysis.investment_advice}
                                </Badge>
                              </div>
                            )}
                            
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                              {news.ai_analysis?.summary || news.content || "클릭하여 AI 분석 결과를 확인하세요"}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{news.source || "뉴스 소스"}</span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{news.time || "방금 전"}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-blue-600" />
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 뉴스 없을 때 안내 */}
          {selectedStock && newsData.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">뉴스를 불러오는 중입니다</h3>
                <p className="text-muted-foreground">
                  {selectedStock.name} 관련 뉴스를 수집하고 있습니다. 잠시만 기다려주세요.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI 분석 결과 패널 */}
        <div className="space-y-6">
          
          {/* AI 분석 카드 */}
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  🤖 AI 분석 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* 전체 감정 분석 */}
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">
                      {analysisResult.gemini_analysis?.overall_sentiment || "분석 중"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      분석된 뉴스: {analysisResult.gemini_analysis?.total_articles || 0}개
                    </div>
                  </div>
                </div>

                {/* 투자 추천 */}
                <div className="mb-6">
                  <h4 className="font-medium mb-2">📈 투자 추천</h4>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-800 font-medium">
                      {analysisResult.gemini_analysis?.recommendation || "분석 중"}
                    </span>
                  </div>
                </div>

                {/* 종합 요약 */}
                <div className="mb-6">
                  <h4 className="font-medium mb-2">📋 종합 요약</h4>
                  <p className="text-sm leading-relaxed">
                    {analysisResult.gemini_analysis?.summary || "AI가 뉴스를 분석하고 있습니다..."}
                  </p>
                </div>

                {/* 분석 통계 */}
                <div className="text-xs text-muted-foreground border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span>Google Gemini Pro</span>
                  </div>
                  <div className="mt-1">
                    분석 시간: {analysisResult.crawled_at ? new Date(analysisResult.crawled_at).toLocaleTimeString() : '방금 전'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 사용법 안내 */}
          {!selectedStock && (
            <Card>
              <CardHeader>
                <CardTitle>🔍 사용 방법</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>1. 상단에서 관심 종목을 검색하세요</div>
                  <div>2. 종목을 선택하면 관련 뉴스가 로드됩니다</div>
                  <div>3. 뉴스를 클릭하면 AI가 호재/악재를 분석합니다</div>
                  <div>4. 우측에서 상세 분석 결과를 확인하세요</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 인기 종목 */}
          <Card>
            <CardHeader>
              <CardTitle>🔥 인기 종목</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['005930', '000660', '035420', '005380', '035720'].map((code) => {
                  const stock = majorStocks.find(s => s.symbol === code)
                  if (!stock) return null
                  
                  return (
                    <Button
                      key={code}
                      variant="ghost"
                      onClick={() => handleStockSearch(stock.symbol, stock.name)}
                      className="w-full justify-start p-3 h-auto"
                    >
                      <div className="text-left">
                        <div className="font-medium">{stock.name}</div>
                        <div className="text-sm text-muted-foreground">{stock.symbol}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}