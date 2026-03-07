import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "決済キャンセル | Menpass" };

export default function PricingCancelPage() {
  return (
    <div className="flex items-center justify-center px-4 py-24">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <XCircle className="size-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">決済がキャンセルされました</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">決済処理がキャンセルされました。引き続き無料プランをご利用いただけます。</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" size="lg" asChild><Link href="/pricing">料金プランに戻る</Link></Button>
          <Button variant="outline" className="w-full" asChild><Link href="/dashboard">ダッシュボードへ</Link></Button>
        </CardFooter>
      </Card>
    </div>
  );
}
