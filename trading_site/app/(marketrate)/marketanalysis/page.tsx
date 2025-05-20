
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketRankings } from "@/components/marketanalysis/market-rankings"
import { MarketOverview } from "@/components/marketanalysis/market-overview"
import { RankingCategories } from "@/components/marketanalysis/ranking-categories"

const MarketAnalysis = () => {
    return (
        <main className="flex-1">
        <div className="container py-6">
          <h1 className="text-3xl font-bold mb-6">시장 분석</h1>

          <Tabs defaultValue="rankings" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="overview">시장 개요</TabsTrigger>
              <TabsTrigger value="rankings">순위 분석</TabsTrigger>
              <TabsTrigger value="sectors">업종 분석</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* <MarketOverview /> */}
              <div className="text-center py-12 text-muted-foreground">시장 개요 기능은 준비 중입니다.</div>

            </TabsContent>
            

            <TabsContent value="rankings" className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/4">
                <RankingCategories />
              </div>
              <div className="lg:w-3/4">
                <MarketRankings />
              </div>
            </TabsContent>

            <TabsContent value="sectors">
              <div className="text-center py-12 text-muted-foreground">업종 분석 기능은 준비 중입니다.</div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    )

}
export default MarketAnalysis