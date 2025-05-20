"use client";

import StockAnalysisPoints from "./(stock_page)/StockAnalysisPoints";
import StockListPage from "./(stock_page)/stcokList";
import CheckPage from "./(stock_page)/check";
import { memo, useMemo } from "react";
import { useSearchParams } from "next/navigation";


const StockDashboard = () => {
  const searchParams = useSearchParams();
  const code = useMemo(() => searchParams.get("code"), [searchParams.get("code")]);
  const name = useMemo(() => searchParams.get("name"), [searchParams.get("name")]);


  return (
    <div className="min-h-screen bg-background">
  
      <StockListPage code={code} name = {name}/>
      {(code || name) && <main className="container mx-auto px-4 py-8">
        {code && <StockAnalysisPoints code={code} />}
        {code && <CheckPage code={code}/>}
      </main>}
    </div>
  );
};

export default StockDashboard;



