import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockChart } from "@/components/stock-chart"
import { TrendingStocks } from "@/components/trending-stocks"
import { RecommendedStocks } from "@/components/recommended-stocks"

export default function Page() {
  return (
    <>
      {/* <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">최고의 주식 종목 추천 서비스</h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                데이터 기반 분석과 전문가의 통찰력을 통해 최적의 투자 기회를 발견하세요. 시장 트렌드를 파악하고 수익성
                높은 종목을 추천해 드립니다.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg">무료 종목 추천 받기</Button>
                <Button size="lg" variant="outline">
                  서비스 알아보기
                </Button>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
              <StockChart />
            </div>
          </div>
        </div>
      </section> */}

      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">오늘의 추천 종목</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                시장 분석과 기술적 지표를 기반으로 선별된 최고의 투자 기회
              </p>
            </div>
          </div>

          <Tabs defaultValue="all" className="mt-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="growth">성장주</TabsTrigger>
              <TabsTrigger value="value">가치주</TabsTrigger>
              <TabsTrigger value="dividend">배당주</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <RecommendedStocks />
            </TabsContent>
            <TabsContent value="growth" className="mt-6">
              <RecommendedStocks category="growth" />
            </TabsContent>
            <TabsContent value="value" className="mt-6">
              <RecommendedStocks category="value" />
            </TabsContent>
            <TabsContent value="dividend" className="mt-6">
              <RecommendedStocks category="dividend" />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-muted/40">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">실시간 인기 종목</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                지금 시장에서 가장 주목받는 종목들을 확인하세요
              </p>
            </div>
          </div>

          <div className="mt-8">
            <TrendingStocks />
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_450px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">전문가의 분석을 받아보세요</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  주식 시장 전문가들의 심층 분석과 맞춤형 종목 추천을 통해 투자 성공률을 높이세요. 시장 트렌드, 기업
                  분석, 투자 전략에 대한 전문적인 인사이트를 제공합니다.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button>프리미엄 서비스 가입하기</Button>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>뉴스레터 구독하기</CardTitle>
                <CardDescription>매주 엄선된 종목 추천과 시장 분석 정보를 이메일로 받아보세요</CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Input placeholder="이름" />
                    </div>
                    <div className="grid gap-2">
                      <Input type="email" placeholder="이메일" />
                    </div>
                    <Button type="submit" className="w-full">
                      구독하기
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                구독 신청 시 개인정보 처리방침에 동의하게 됩니다.
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
