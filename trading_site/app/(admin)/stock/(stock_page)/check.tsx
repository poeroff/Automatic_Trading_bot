"use client"
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Get } from "@/services/Get";
import { useRouter } from "next/navigation";

interface StockAnalysisPointsProps {
  code: string | null;
  name: string | null;
}


const CheckPage = ({ code , name } : StockAnalysisPointsProps) =>{
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // 🔥 비동기 상태 업데이트 최적화

  const handleCompletionCheck = useCallback(() => {
    if (!code && !name) return;

    startTransition(async () => { // 🔥 상태 변경을 한번에 처리
      if (code) {
        await Get(`http://localhost:4000/stock-data/certified?code=${code}`);
      } else if (name) {
        await Get(`http://localhost:4000/stock-data/certified?name=${name}`);
      }

      const falseCertified = await Get(`http://localhost:4000/stock-data/false-certified`);
      if (falseCertified.length > 0) {
        router.push(`/stock?code=${falseCertified[0].code}`);
      }
   
    });
  }, [code, name]);

  return (
    <div className="flex justify-center mt-8">
      <Button onClick={handleCompletionCheck} disabled={isPending}>
        { isPending ? "검사 중..." : "검사 완료"}
      </Button>
    </div>
  );
}

export default CheckPage
