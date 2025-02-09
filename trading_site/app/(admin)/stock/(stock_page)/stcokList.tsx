"use client"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"

import { Get } from "@/services/Get"
import { useRouter } from "next/navigation"
import React from "react"


function StockListPage(){
    const [stockList, setStockList] = useState<{ id: number, code: string, name:string }[]>([]);

    useEffect(() => {
      const fetchData = async () => {
        const falseCertified = await Get(`http://localhost:4000/stock-data/false-certified`);
        setStockList(falseCertified);
      };
      fetchData()
    },[])

    const router = useRouter();
    return  <header className="border-b">
    <div className="mb-8 overflow-x-auto">
      <div className="flex space-x-2 pb-2" style={{ width: "max-content" }}>
        {stockList.map((stock) => (
          <Button
            key={stock.id}
            onClick={() => router.push(`/stock?code=${stock.code}`)}
            variant={ "outline" }
            className="px-4 py-2 whitespace-nowrap"
          >
            {stock.name}
          </Button>
        ))}
      </div>
    </div>   
  </header>
}

export default React.memo(StockListPage);
