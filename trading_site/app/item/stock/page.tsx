"use client"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/router"
import { useMemo } from "react"

const StockPage = () => {

  const searchParams = useSearchParams();
  const code = useMemo(() => searchParams.get("code"), [searchParams.get("code")]);
  const name = useMemo(() => searchParams.get("name"), [searchParams.get("name")]);

  return (
    <div>
      <h1>STOCK PAGE!</h1>
      <p>Code: {code}</p>
    </div>
  )

}
export default StockPage