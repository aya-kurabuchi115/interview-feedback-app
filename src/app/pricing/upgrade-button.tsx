"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface UpgradeButtonProps {
  /** checkout API に送るプランキー */
  planKey?: "pro" | "premium";
  /** ボタンのラベル */
  label?: string;
  /** カラーバリアント */
  variant?: "default" | "violet";
}

export function UpgradeButton({
  planKey = "pro",
  label = "Pro にアップグレード",
  variant = "default",
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "チェックアウトに失敗しました");
      if (data.url) window.location.href = data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "チェックアウトに失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const buttonClassName =
    variant === "violet"
      ? "w-full bg-violet-600 hover:bg-violet-700"
      : "w-full";

  return (
    <Button
      className={buttonClassName}
      size="lg"
      onClick={handleUpgrade}
      disabled={loading}
    >
      {loading ? "処理中..." : label}
    </Button>
  );
}
