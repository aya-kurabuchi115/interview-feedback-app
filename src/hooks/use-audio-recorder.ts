"use client";

import { useState, useRef, useCallback } from "react";

// ============================================================
// Types
// ============================================================

export type RecordingState = "idle" | "recording" | "processing";

interface UseAudioRecorderReturn {
  /** 現在の録音状態 */
  state: RecordingState;
  /** 録音開始 */
  startRecording: () => Promise<void>;
  /** 録音停止 → Blob を返す */
  stopRecording: () => Promise<Blob | null>;
  /** エラーメッセージ */
  error: string | null;
  /** エラーをクリア */
  clearError: () => void;
  /** 録音時間（秒） */
  duration: number;
  /** 録音中の MediaStream（波形表示用） */
  stream: MediaStream | null;
}

// ============================================================
// Hook
// ============================================================

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setDuration(0);

      // マイクアクセスを取得
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);

      // MediaRecorder のフォーマットを決定
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      const recorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        resolveRef.current?.(blob);
        resolveRef.current = null;
      };

      recorder.onerror = () => {
        setError("録音中にエラーが発生しました");
        setState("idle");
        cleanup();
        resolveRef.current?.(null);
        resolveRef.current = null;
      };

      // 250ms ごとにデータを取得
      recorder.start(250);
      setState("recording");

      // 録音時間カウンター
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      cleanup();
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("マイクへのアクセスが許可されていません。ブラウザの設定を確認してください。");
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setError("マイクが見つかりません。デバイスを接続してください。");
      } else {
        setError("マイクの起動に失敗しました。");
      }
      setState("idle");
    }
  }, [cleanup]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder || recorder.state === "inactive") {
        cleanup();
        setState("idle");
        resolve(null);
        return;
      }

      resolveRef.current = resolve;

      // タイマー停止
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // ストリーム停止
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setStream(null);

      recorder.stop();
      setState("idle");
    });
  }, [cleanup]);

  const clearError = useCallback(() => setError(null), []);

  return {
    state,
    startRecording,
    stopRecording,
    error,
    clearError,
    duration,
    stream,
  };
}
