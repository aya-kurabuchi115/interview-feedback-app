"use client";

import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  stream: MediaStream | null;
  className?: string;
}

export function AudioWaveform({ stream, className = "" }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stream) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // AudioContext & AnalyserNode を作成
    const audioContext = new AudioContext();
    contextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const BAR_COUNT = 32;
    const BAR_GAP = 2;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, width, height);

      const barWidth = (width - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;
      const step = Math.floor(bufferLength / BAR_COUNT);

      for (let i = 0; i < BAR_COUNT; i++) {
        // 各バーの音量を算出
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        const avg = sum / step / 255;

        const minHeight = 3;
        const barHeight = Math.max(minHeight, avg * height * 0.9);
        const x = i * (barWidth + BAR_GAP);
        const y = (height - barHeight) / 2;

        // グラデーション: 音量に応じて色が変化
        const intensity = Math.min(1, avg * 2);
        const r = Math.round(239 * intensity + 100 * (1 - intensity));
        const g = Math.round(68 * intensity + 116 * (1 - intensity));
        const b = Math.round(68 * intensity + 204 * (1 - intensity));

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      source.disconnect();
      audioContext.close();
      contextRef.current = null;
      analyserRef.current = null;
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full ${className}`}
      aria-label="音声入力レベル"
      role="img"
    />
  );
}
