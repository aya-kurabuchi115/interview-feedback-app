import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "決済完了 | InterviewCoach" };

export default function PricingSuccessPage() {
  return (
    <div className="flex items-center justify-center px-4 py-24">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">プランのアップグレード完了!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">お支払いが正常に完了しました。すべての機能が利用可能になりました。</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" size="lg" asChild><Link href="/dashboard">ダッシュボードへ</Link></Button>
          <Button variant="outline" className="w-full" asChild><Link href="/settings/billing">プラン管理</Link></Button>
        </CardFooter>
      </Card>
    </div>
  );
}
