import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t py-8 mb-6 md:py-0 mt-8 ">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    &copy; 2025 주식마스터. 모든 권리 보유.
                </p>
                <div className="flex gap-4">
                    <Link href="#" className="text-sm text-muted-foreground">
                        이용약관
                    </Link>
                    <Link href="#" className="text-sm text-muted-foreground">
                        개인정보 처리방침
                    </Link>
                    <Link href="#" className="text-sm text-muted-foreground">
                        고객센터
                    </Link>
                </div>
            </div>
        </footer>
    )
}