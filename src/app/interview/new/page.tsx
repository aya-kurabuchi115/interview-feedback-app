"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Pause, Play, Square, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type InterviewInsert = Database["public"]["Tables"]["interviews"]["Insert"];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function NewInterviewPage() {
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();
  const { state, elapsedTime, audioBlob, error, start, pause, resume, stop } =
    useAudioRecorder();

  const handleUpload = async () => {
    if (!audioBlob) return;

    if (audioBlob.size > MAX_FILE_SIZE) {
      setUploadError("ファイルサイズが100MBを超えています");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("認証エラー");

      const interviewId = crypto.randomUUID();
      const filePath = `${user.id}/${interviewId}.webm`;

      const { error: storageError } = await supabase.storage
        .from("interviews")
        .upload(filePath, audioBlob, { contentType: "audio/webm" });

      if (storageError) throw storageError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("interviews").getPublicUrl(filePath);

      const insertData: InterviewInsert = {
        id: interviewId,
        user_id: user.id,
        title: title || `面接 ${new Date().toLocaleDateString("ja-JP")}`,
        audio_url: publicUrl,
        duration_seconds: elapsedTime,
        status: "uploaded",
      };

      const { error: dbError } = await supabase
        .from("interviews")
        .insert(insertData as never);

      if (dbError) throw dbError;

      router.push("/dashboard");
      router.refresh();
    } catch {
      setUploadError("アップロードに失敗しました。もう一度お試しください。");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">新しい面接セッション</h1>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">セッションタイトル（任意）</Label>
          <Input
            id="title"
            placeholder="例: 模擬面接 - 自己紹介の練習"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">録音</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {/* 経過時間 */}
            <div className="text-4xl font-mono tabular-nums">
              {formatTime(elapsedTime)}
            </div>

            {/* エラー表示 */}
            {(error || uploadError) && (
              <div className="w-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error || uploadError}
              </div>
            )}

            {/* 録音コントロール */}
            <div className="flex items-center gap-4">
              {state === "idle" && (
                <Button size="lg" onClick={start}>
                  <Mic className="mr-2 h-5 w-5" />
                  録音開始
                </Button>
              )}

              {state === "recording" && (
                <>
                  <Button size="lg" variant="outline" onClick={pause}>
                    <Pause className="mr-2 h-5 w-5" />
                    一時停止
                  </Button>
                  <Button size="lg" variant="destructive" onClick={stop}>
                    <Square className="mr-2 h-5 w-5" />
                    停止
                  </Button>
                </>
              )}

              {state === "paused" && (
                <>
                  <Button size="lg" onClick={resume}>
                    <Play className="mr-2 h-5 w-5" />
                    再開
                  </Button>
                  <Button size="lg" variant="destructive" onClick={stop}>
                    <Square className="mr-2 h-5 w-5" />
                    停止
                  </Button>
                </>
              )}

              {state === "stopped" && audioBlob && (
                <Button
                  size="lg"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-5 w-5" />
                  )}
                  {uploading ? "アップロード中..." : "アップロード"}
                </Button>
              )}
            </div>

            {/* 録音状態インジケーター */}
            {state === "recording" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                録音中
              </div>
            )}
            {state === "paused" && (
              <div className="text-sm text-muted-foreground">一時停止中</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
