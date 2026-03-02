"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, X, Mic, Square, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { InterviewCategory, InterviewRound } from "@/types/database";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

// --- 定数 ---
const MIN_TRANSCRIPT_LENGTH = 100;
const MAX_TRANSCRIPT_LENGTH = 50_000;
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_COMPANY_NAME_LENGTH = 100;
const DRAFT_STORAGE_KEY = "interview-new-draft";

const CATEGORY_OPTIONS: { value: InterviewCategory; label: string }[] = [
  { value: "arubaito", label: "アルバイト" },
  { value: "intern", label: "インターン" },
  { value: "new_grad", label: "新卒" },
  { value: "other", label: "その他" },
];

const ROUND_OPTIONS: { value: InterviewRound; label: string }[] = [
  { value: "first", label: "一次面接" },
  { value: "second", label: "二次面接" },
  { value: "third", label: "三次面接" },
  { value: "final", label: "最終面接" },
  { value: "gd", label: "GD（グループディスカッション）" },
  { value: "case", label: "ケース面接" },
  { value: "other", label: "その他" },
];

/** 下書きデータの型 */
interface DraftData {
  companyName: string;
  category: InterviewCategory | "";
  round: InterviewRound | "";
  interviewDate: string;
  transcript: string;
}

/** 録音時間をフォーマット */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

type InputMode = "record" | "text";

export default function NewInterviewPage() {
  // 入力モード
  const [inputMode, setInputMode] = useState<InputMode>("record");

  // フォーム状態
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState<InterviewCategory | "">("");
  const [round, setRound] = useState<InterviewRound | "">("");
  const [interviewDate, setInterviewDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [transcript, setTranscript] = useState("");

  // 録音
  const recorder = useAudioRecorder();
  const [uploadingAudio, setUploadingAudio] = useState(false);

  // 企業名サジェスト
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // UI 状態
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- 下書き保存・復元 ---
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft: DraftData = JSON.parse(saved);
        if (draft.companyName) setCompanyName(draft.companyName);
        if (draft.category) setCategory(draft.category);
        if (draft.round) setRound(draft.round);
        if (draft.interviewDate) setInterviewDate(draft.interviewDate);
        if (draft.transcript) setTranscript(draft.transcript);
      }
    } catch {
      // 下書き復元失敗は無視
    }
  }, []);

  useEffect(() => {
    const draft: DraftData = {
      companyName,
      category,
      round,
      interviewDate,
      transcript,
    };
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ストレージ書き込み失敗は無視
    }
  }, [companyName, category, round, interviewDate, transcript]);

  // --- 企業名サジェスト ---
  const fetchCompanySuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 1) {
      setCompanySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const supabase = createClient();
      // ワイルドカード文字をエスケープして ilike インジェクションを防止
      const escaped = query.replace(/[%_\\]/g, "\\$&");
      const { data } = await supabase
        .from("companies")
        .select("name")
        .ilike("name", `%${escaped}%`)
        .limit(5);

      const companies = data as { name: string }[] | null;
      if (companies && companies.length > 0) {
        setCompanySuggestions(companies.map((c) => c.name));
        setShowSuggestions(true);
      } else {
        setCompanySuggestions([]);
        setShowSuggestions(false);
      }
    } catch {
      // サジェスト取得失敗は無視
    }
  }, []);

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value);
    clearError("companyName");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchCompanySuggestions(value);
    }, 300);
  };

  const selectSuggestion = (name: string) => {
    setCompanyName(name);
    setShowSuggestions(false);
  };

  // --- ファイルアップロード ---
  const processFile = useCallback(
    (file: File) => {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.file;
        delete next.transcript;
        return next;
      });

      // 拡張子チェック
      if (!file.name.endsWith(".txt")) {
        setErrors((prev) => ({
          ...prev,
          file: ".txt ファイルのみアップロードできます",
        }));
        return;
      }

      // サイズチェック
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          file: "ファイルサイズは1MB以内にしてください",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;

        // 文字化けチェック（制御文字が多い場合）
        const controlCharCount = (text.match(/[\x00-\x08\x0E-\x1F]/g) || [])
          .length;
        if (controlCharCount > text.length * 0.05) {
          setErrors((prev) => ({
            ...prev,
            file: "ファイルのエンコーディングが正しくない可能性があります。UTF-8 のテキストファイルを使用してください。",
          }));
          return;
        }

        setTranscript(text);
        setFileName(file.name);
      };
      reader.onerror = () => {
        setErrors((prev) => ({
          ...prev,
          file: "ファイルの読み込みに失敗しました",
        }));
      };
      reader.readAsText(file, "UTF-8");
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // input をリセットして同じファイルの再選択を可能に
    e.target.value = "";
  };

  // --- ドラッグ & ドロップ ---
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // --- バリデーション ---
  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 企業名
    const trimmedName = companyName.trim();
    if (!trimmedName) {
      newErrors.companyName = "企業名を入力してください";
    } else if (trimmedName.length > MAX_COMPANY_NAME_LENGTH) {
      newErrors.companyName = `企業名は${MAX_COMPANY_NAME_LENGTH}文字以内で入力してください`;
    }

    // カテゴリ
    if (!category) {
      newErrors.category = "面接カテゴリを選択してください";
    }

    // ラウンド（新卒の場合のみ）
    if (category === "new_grad" && !round) {
      newErrors.round = "面接ラウンドを選択してください";
    }

    // 面接日
    if (interviewDate) {
      const dateObj = new Date(interviewDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (dateObj > today) {
        newErrors.interviewDate =
          "面接日は今日以前の日付を指定してください";
      }
    }

    // 録音モード: 録音データが必要
    if (inputMode === "record") {
      if (!recorder.audioBlob) {
        newErrors.audio = "面接を録音してください";
      }
    } else {
      // テキストモード: 音声スクリプト
      const trimmedTranscript = transcript.trim();
      if (!trimmedTranscript) {
        newErrors.transcript = "音声スクリプトを入力してください";
      } else if (trimmedTranscript.length < MIN_TRANSCRIPT_LENGTH) {
        newErrors.transcript = `音声スクリプトは${MIN_TRANSCRIPT_LENGTH}文字以上入力してください（現在: ${trimmedTranscript.length}文字）`;
      } else if (trimmedTranscript.length > MAX_TRANSCRIPT_LENGTH) {
        newErrors.transcript = `音声スクリプトは${MAX_TRANSCRIPT_LENGTH.toLocaleString()}文字以内で入力してください（現在: ${trimmedTranscript.length.toLocaleString()}文字）`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- 送信 ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      let audioUrl: string | null = null;

      // 録音モード: 音声をアップロード
      if (inputMode === "record" && recorder.audioBlob) {
        setUploadingAudio(true);
        const formData = new FormData();
        formData.append("audio", recorder.audioBlob, "recording.webm");

        const uploadRes = await fetch("/api/interviews/upload-audio", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        setUploadingAudio(false);

        if (!uploadRes.ok) {
          setErrors({ submit: uploadData.error || "音声のアップロードに失敗しました" });
          return;
        }

        audioUrl = uploadData.audio_url;
      }

      // 面接レコード作成
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          interview_category: category,
          interview_round: category === "new_grad" ? round || null : null,
          interview_date: interviewDate || null,
          transcript: inputMode === "text" ? transcript.trim() : null,
          audio_url: audioUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error || "保存に失敗しました" });
        return;
      }

      // 下書きをクリア
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);

      // 処理ページへ遷移
      router.push(`/interview/${data.interview_id}/processing`);
    } catch {
      setErrors({
        submit:
          "ネットワークエラーが発生しました。接続を確認してもう一度お試しください。",
      });
    } finally {
      setSubmitting(false);
      setUploadingAudio(false);
    }
  };

  const transcriptCharCount = transcript.trim().length;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">面接を記録する</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 送信エラー */}
        {errors.submit && (
          <div
            role="alert"
            className="rounded-md bg-destructive/10 p-4 text-sm text-destructive"
          >
            {errors.submit}
          </div>
        )}

        {/* 企業名 */}
        <div className="space-y-2">
          <Label htmlFor="company-name">
            企業名 <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="company-name"
              placeholder="例: 株式会社サンプル"
              value={companyName}
              onChange={(e) => handleCompanyNameChange(e.target.value)}
              onBlur={() => {
                // 少し遅延させてクリックイベントを先に処理
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              maxLength={MAX_COMPANY_NAME_LENGTH}
              aria-invalid={!!errors.companyName}
              aria-describedby={
                errors.companyName ? "company-name-error" : undefined
              }
            />
            {showSuggestions && companySuggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                {companySuggestions.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                      onMouseDown={() => selectSuggestion(name)}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {errors.companyName && (
            <p id="company-name-error" className="text-sm text-destructive">
              {errors.companyName}
            </p>
          )}
        </div>

        {/* 面接カテゴリ */}
        <div className="space-y-2">
          <Label htmlFor="category">
            面接カテゴリ <span className="text-destructive">*</span>
          </Label>
          <Select
            value={category}
            onValueChange={(value: string) => {
              setCategory(value as InterviewCategory);
              clearError("category");
              // 新卒以外を選んだらラウンドをリセット
              if (value !== "new_grad") {
                setRound("");
              }
            }}
          >
            <SelectTrigger
              id="category"
              className="w-full"
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? "category-error" : undefined}
            >
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p id="category-error" className="text-sm text-destructive">
              {errors.category}
            </p>
          )}
        </div>

        {/* 面接ラウンド（新卒のみ表示） */}
        {category === "new_grad" && (
          <div className="space-y-2">
            <Label htmlFor="round">
              面接ラウンド <span className="text-destructive">*</span>
            </Label>
            <Select
              value={round}
              onValueChange={(value: string) => {
                setRound(value as InterviewRound);
                clearError("round");
              }}
            >
              <SelectTrigger
                id="round"
                className="w-full"
                aria-invalid={!!errors.round}
                aria-describedby={errors.round ? "round-error" : undefined}
              >
                <SelectValue placeholder="ラウンドを選択" />
              </SelectTrigger>
              <SelectContent>
                {ROUND_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.round && (
              <p id="round-error" className="text-sm text-destructive">
                {errors.round}
              </p>
            )}
          </div>
        )}

        {/* 面接日 */}
        <div className="space-y-2">
          <Label htmlFor="interview-date">面接日</Label>
          <Input
            id="interview-date"
            type="date"
            value={interviewDate}
            onChange={(e) => {
              setInterviewDate(e.target.value);
              clearError("interviewDate");
            }}
            max={new Date().toISOString().split("T")[0]}
            aria-invalid={!!errors.interviewDate}
            aria-describedby={
              errors.interviewDate ? "interview-date-error" : undefined
            }
          />
          {errors.interviewDate && (
            <p id="interview-date-error" className="text-sm text-destructive">
              {errors.interviewDate}
            </p>
          )}
        </div>

        {/* 入力方法選択 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              面接データ <span className="text-destructive">*</span>
            </CardTitle>
            {/* タブ切替 */}
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setInputMode("record")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  inputMode === "record"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mic className="h-4 w-4" />
                録音する
              </button>
              <button
                type="button"
                onClick={() => setInputMode("text")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  inputMode === "text"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-4 w-4" />
                テキスト入力
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {inputMode === "record" ? (
              /* === 録音モード === */
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  面接中にマイクで録音してください。録音後、AIが自動で文字起こし・話者分離を行います。
                </p>

                {/* 録音コントロール */}
                <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/30 p-6">
                  {/* タイマー */}
                  <div className="text-3xl font-mono font-bold tabular-nums">
                    {formatTime(recorder.elapsedTime)}
                  </div>

                  {/* 録音インジケーター */}
                  {recorder.state === "recording" && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-destructive" />
                      録音中...
                    </div>
                  )}
                  {recorder.state === "paused" && (
                    <div className="text-sm text-amber-600">一時停止中</div>
                  )}

                  {/* ボタン群 */}
                  <div className="flex items-center gap-3">
                    {recorder.state === "idle" || recorder.state === "stopped" ? (
                      <Button
                        type="button"
                        size="lg"
                        onClick={recorder.start}
                        className="gap-2"
                      >
                        <Mic className="h-5 w-5" />
                        {recorder.audioBlob ? "録り直す" : "録音開始"}
                      </Button>
                    ) : (
                      <>
                        {recorder.state === "recording" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={recorder.pause}
                            className="gap-2"
                          >
                            <Pause className="h-5 w-5" />
                            一時停止
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={recorder.resume}
                            className="gap-2"
                          >
                            <Play className="h-5 w-5" />
                            再開
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="lg"
                          onClick={recorder.stop}
                          className="gap-2"
                        >
                          <Square className="h-4 w-4" />
                          録音停止
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* 録音完了後のプレビュー */}
                {recorder.audioBlob && recorder.state === "stopped" && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">録音データ</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(recorder.elapsedTime)} / {(recorder.audioBlob.size / 1024 / 1024).toFixed(1)}MB
                      </span>
                    </div>
                    <audio
                      controls
                      src={URL.createObjectURL(recorder.audioBlob)}
                      className="w-full"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      送信後、AIが自動で文字起こしと話者分離を行います。面接官とあなたの発言を自動で識別し、あなたの発言のみフィラー分析を実施します。
                    </p>
                  </div>
                )}

                {/* 録音エラー */}
                {recorder.error && (
                  <p className="text-sm text-destructive">{recorder.error}</p>
                )}
                {errors.audio && (
                  <p className="text-sm text-destructive">{errors.audio}</p>
                )}
              </div>
            ) : (
              /* === テキストモード === */
              <div className="space-y-4">
                {/* ファイルアップロードエリア */}
                <div
                  className={`relative rounded-md border-2 border-dashed p-6 text-center transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="テキストファイルをアップロード"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      .txt ファイルをドラッグ&ドロップ、または
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      ファイルを選択
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      最大 1MB / UTF-8 テキストファイル
                    </p>
                  </div>
                </div>

                {/* アップロードされたファイル名表示 */}
                {fileName && (
                  <div className="flex items-center gap-2 rounded-md bg-secondary p-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span className="flex-1 truncate">{fileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFileName(null);
                        setTranscript("");
                      }}
                      className="rounded-full p-1 hover:bg-accent"
                      aria-label="ファイルをクリア"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* ファイルエラー */}
                {errors.file && (
                  <p className="text-sm text-destructive">{errors.file}</p>
                )}

                {/* テキストエリア */}
                <div className="space-y-2">
                  <Label htmlFor="transcript">
                    テキストを直接貼り付けることもできます
                  </Label>
                  <Textarea
                    id="transcript"
                    placeholder="音声文字起こし結果をここに貼り付けてください..."
                    value={transcript}
                    onChange={(e) => {
                      setTranscript(e.target.value);
                      setFileName(null);
                      clearError("transcript");
                    }}
                    rows={10}
                    className="min-h-[200px] resize-y"
                    aria-invalid={!!errors.transcript}
                    aria-describedby="transcript-count transcript-error"
                  />
                  <div className="flex items-center justify-between">
                    <p
                      id="transcript-count"
                      className={`text-xs ${
                        transcriptCharCount > MAX_TRANSCRIPT_LENGTH
                          ? "text-destructive"
                          : transcriptCharCount > 0 &&
                              transcriptCharCount < MIN_TRANSCRIPT_LENGTH
                            ? "text-amber-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {transcriptCharCount.toLocaleString()} /{" "}
                      {MAX_TRANSCRIPT_LENGTH.toLocaleString()} 文字
                      {transcriptCharCount > 0 &&
                        transcriptCharCount < MIN_TRANSCRIPT_LENGTH &&
                        `（最低${MIN_TRANSCRIPT_LENGTH}文字）`}
                    </p>
                  </div>
                  {errors.transcript && (
                    <p
                      id="transcript-error"
                      className="text-sm text-destructive"
                    >
                      {errors.transcript}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 送信ボタン */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting || recorder.state === "recording" || recorder.state === "paused"}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {uploadingAudio ? "音声をアップロード中..." : "保存中..."}
            </>
          ) : inputMode === "record" ? (
            "録音データを送信して分析する"
          ) : (
            "登録する"
          )}
        </Button>
      </form>
    </div>
  );
}
