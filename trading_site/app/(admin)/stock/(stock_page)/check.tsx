"use client"
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Get } from "@/services/Get";
import { useRouter } from "next/navigation";
import { Patch } from "@/services/Patch";

interface StockAnalysisPointsProps {
  code: string | null;
}


const CheckPage = ({ code } : StockAnalysisPointsProps) =>{
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // 🔥 비동기 상태 업데이트 최적화

  const handleCompletionCheck = useCallback(() => {
    if (!code) return;

    startTransition(async () => { // 🔥 상태 변경을 한번에 처리
      if (code) {
        await Patch(`http://localhost:4000/stock-data/Certified?code=${code}`,{});

      }
      const falseCertified = await Get(`http://localhost:4000/stock-data/FalseCertified`);
      if (falseCertified.length > 0) {
        console.log(falseCertified[0].code)
        router.push(`/stock?code=${falseCertified[0].code}`);
      }
   
    });
  }, [code]);

  return (
    <div className="flex justify-center mt-8">
      <Button onClick={handleCompletionCheck} disabled={isPending}>
        { isPending ? "검사 중..." : "검사 완료"}
      </Button>
    </div>
  );
}

export default CheckPage
