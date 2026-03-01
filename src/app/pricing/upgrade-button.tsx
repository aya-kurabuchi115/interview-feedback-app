"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "チェックアウトに失敗しました");
      if (data.url) window.location.href = data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "チェックアウトに失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button className="w-full" size="lg" onClick={handleUpgrade} disabled={loading}>
      {loading ? "処理中..." : "Pro にアップグレード"}
    </Button>
  );
}
