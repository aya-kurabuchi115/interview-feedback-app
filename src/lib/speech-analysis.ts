/**
 * 話速（WPM）・間（ポーズ）分析ユーティリティ
 * Issue #218: 面接音声の文字起こし精度向上 — 話速・間分析
 */

// ============================================================
// 型定義
// ============================================================

/** 文字起こしセグメント（transcripts テーブルの行に対応） */
export interface TranscriptSegment {
  speaker: string;
  content: string;
  start_time: number; // 秒
  end_time: number;   // 秒
}

/** 沈黙区間 */
export interface PauseInterval {
  /** 沈黙開始時刻（秒） */
  start: number;
  /** 沈黙終了時刻（秒） */
  end: number;
  /** 沈黙の長さ（秒） */
  duration: number;
  /** 沈黙の評価 */
  assessment: "good" | "long" | "very_long";
}

/** 時系列 WPM データポイント（グラフ用） */
export interface WpmDataPoint {
  /** 時刻（秒） */
  time: number;
  /** その区間の WPM */
  wpm: number;
  /** 話者 */
  speaker: string;
}

/** 話速・間分析の結果 */
export interface SpeechAnalysisResult {
  /** 候補者の全体平均 WPM */
  overall_wpm: number;
  /** 面接に適した話速レンジ */
  ideal_wpm_range: { min: number; max: number };
  /** 話速の評価コメント */
  wpm_assessment: string;
  /** 沈黙区間一覧 */
  pauses: PauseInterval[];
  /** 沈黙の合計回数 */
  pause_count: number;
  /** 沈黙の合計時間（秒） */
  total_pause_duration: number;
  /** 良い間の回数 */
  good_pause_count: number;
  /** 長すぎる沈黙の回数 */
  long_pause_count: number;
  /** 沈黙の評価コメント */
  pause_assessment: string;
  /** 時系列 WPM データ（候補者のみ） */
  wpm_timeline: WpmDataPoint[];
  /** 面接全体の長さ（秒） */
  total_duration: number;
  /** 候補者の発話時間（秒） */
  interviewee_speaking_time: number;
}

// ============================================================
// 定数
// ============================================================

/** 沈黙検出の閾値（秒） */
const PAUSE_THRESHOLD = 2.0;
/** 良い間の上限（秒） */
const GOOD_PAUSE_MAX = 4.0;
/** 長すぎる沈黙の閾値（秒） */
const VERY_LONG_PAUSE_THRESHOLD = 8.0;

/** 面接に適した日本語の話速レンジ（文字/分ベース → WPM 近似） */
const IDEAL_WPM_RANGE = { min: 250, max: 400 };

/** WPM 計算用の時間窓（秒） */
const WPM_WINDOW_SIZE = 30;

// ============================================================
// 分析関数
// ============================================================

/**
 * 日本語テキストの文字数（≒ 発話量）を返す。
 * 日本語は単語境界がないため、文字数ベースで CPM (Characters Per Minute) を計算し、
 * UI上は「文字/分」として表示する。
 */
function countCharacters(text: string): number {
  // 句読点・記号・スペースを除いた文字数
  return text.replace(/[\s、。！？!?.,\-…「」『』（）()【】\[\]]/g, "").length;
}

/**
 * 沈黙区間を検出する。
 * 連続するセグメント間の gap が閾値以上の場合を沈黙として検出。
 */
function detectPauses(segments: TranscriptSegment[]): PauseInterval[] {
  if (segments.length < 2) return [];

  const pauses: PauseInterval[] = [];

  for (let i = 0; i < segments.length - 1; i++) {
    const currentEnd = segments[i].end_time;
    const nextStart = segments[i + 1].start_time;
    const gap = nextStart - currentEnd;

    if (gap >= PAUSE_THRESHOLD) {
      let assessment: PauseInterval["assessment"];
      if (gap >= VERY_LONG_PAUSE_THRESHOLD) {
        assessment = "very_long";
      } else if (gap > GOOD_PAUSE_MAX) {
        assessment = "long";
      } else {
        assessment = "good";
      }

      pauses.push({
        start: currentEnd,
        end: nextStart,
        duration: Math.round(gap * 10) / 10,
        assessment,
      });
    }
  }

  return pauses;
}

/**
 * 候補者の WPM を計算する（文字/分ベース）。
 */
function calculateOverallWpm(segments: TranscriptSegment[]): number {
  const intervieweeSegments = segments.filter(
    (s) => s.speaker === "interviewee"
  );

  if (intervieweeSegments.length === 0) return 0;

  let totalChars = 0;
  let totalTime = 0;

  for (const seg of intervieweeSegments) {
    totalChars += countCharacters(seg.content);
    totalTime += seg.end_time - seg.start_time;
  }

  if (totalTime <= 0) return 0;

  // 文字/分（CPM）
  return Math.round((totalChars / totalTime) * 60);
}

/**
 * 時系列 WPM データを生成する（候補者のみ）。
 * WPM_WINDOW_SIZE 秒ごとの区間 WPM を算出。
 */
function calculateWpmTimeline(segments: TranscriptSegment[]): WpmDataPoint[] {
  const intervieweeSegments = segments.filter(
    (s) => s.speaker === "interviewee"
  );

  if (intervieweeSegments.length === 0) return [];

  const firstStart = Math.min(...segments.map((s) => s.start_time));
  const lastEnd = Math.max(...segments.map((s) => s.end_time));
  const totalDuration = lastEnd - firstStart;

  if (totalDuration <= 0) return [];

  const dataPoints: WpmDataPoint[] = [];

  for (
    let windowStart = firstStart;
    windowStart < lastEnd;
    windowStart += WPM_WINDOW_SIZE
  ) {
    const windowEnd = windowStart + WPM_WINDOW_SIZE;

    // この窓にかかるセグメントの文字数を計算
    let charsInWindow = 0;
    let speakingTimeInWindow = 0;

    for (const seg of intervieweeSegments) {
      const overlapStart = Math.max(seg.start_time, windowStart);
      const overlapEnd = Math.min(seg.end_time, windowEnd);

      if (overlapStart < overlapEnd) {
        const segDuration = seg.end_time - seg.start_time;
        const overlapRatio =
          segDuration > 0 ? (overlapEnd - overlapStart) / segDuration : 0;
        charsInWindow += countCharacters(seg.content) * overlapRatio;
        speakingTimeInWindow += overlapEnd - overlapStart;
      }
    }

    if (speakingTimeInWindow > 0) {
      dataPoints.push({
        time: Math.round(windowStart - firstStart),
        wpm: Math.round((charsInWindow / speakingTimeInWindow) * 60),
        speaker: "interviewee",
      });
    }
  }

  return dataPoints;
}

/**
 * WPM に対する評価コメントを生成する。
 */
function assessWpm(wpm: number): string {
  if (wpm === 0) {
    return "候補者の発話データが不足しているため、話速を評価できません。";
  }
  if (wpm < IDEAL_WPM_RANGE.min) {
    return `話速は ${wpm} 文字/分で、面接の理想レンジ（${IDEAL_WPM_RANGE.min}〜${IDEAL_WPM_RANGE.max} 文字/分）より遅めです。落ち着いた印象を与える一方、テンポが遅すぎると面接官の集中が途切れる可能性があります。少しテンポを上げてみましょう。`;
  }
  if (wpm > IDEAL_WPM_RANGE.max) {
    return `話速は ${wpm} 文字/分で、面接の理想レンジ（${IDEAL_WPM_RANGE.min}〜${IDEAL_WPM_RANGE.max} 文字/分）より速めです。熱意が伝わる一方、聞き取りにくくなる恐れがあります。重要なポイントでは意識的にゆっくり話しましょう。`;
  }
  return `話速は ${wpm} 文字/分で、面接に適した理想レンジ（${IDEAL_WPM_RANGE.min}〜${IDEAL_WPM_RANGE.max} 文字/分）に収まっています。聞き取りやすいテンポです。`;
}

/**
 * 沈黙分析の評価コメントを生成する。
 */
function assessPauses(pauses: PauseInterval[]): string {
  if (pauses.length === 0) {
    return "沈黙区間は検出されませんでした。スムーズに会話が進んでいますが、重要な質問の前に意図的な「間」を取ることで、より深い回答につながることがあります。";
  }

  const goodCount = pauses.filter((p) => p.assessment === "good").length;
  const longCount = pauses.filter((p) => p.assessment === "long").length;
  const veryLongCount = pauses.filter(
    (p) => p.assessment === "very_long"
  ).length;

  const parts: string[] = [];

  if (goodCount > 0) {
    parts.push(
      `適切な間（2〜4秒）が ${goodCount} 回あり、考えをまとめる良い間の取り方ができています`
    );
  }
  if (longCount > 0) {
    parts.push(
      `やや長い沈黙（4〜8秒）が ${longCount} 回ありました。質問の意図を確認したり、「少し考えさせてください」と伝えることで印象が改善します`
    );
  }
  if (veryLongCount > 0) {
    parts.push(
      `長い沈黙（8秒以上）が ${veryLongCount} 回ありました。面接官に不安を与える可能性があるため、思考中でも何かしら言葉を発する練習をしましょう`
    );
  }

  return parts.join("。") + "。";
}

// ============================================================
// エクスポート: メイン分析関数
// ============================================================

/**
 * 文字起こしセグメントから話速・間分析を実行する。
 */
export function analyzeSpeech(
  segments: TranscriptSegment[]
): SpeechAnalysisResult {
  if (segments.length === 0) {
    return {
      overall_wpm: 0,
      ideal_wpm_range: IDEAL_WPM_RANGE,
      wpm_assessment: "文字起こしデータがないため分析できません。",
      pauses: [],
      pause_count: 0,
      total_pause_duration: 0,
      good_pause_count: 0,
      long_pause_count: 0,
      pause_assessment: "文字起こしデータがないため分析できません。",
      wpm_timeline: [],
      total_duration: 0,
      interviewee_speaking_time: 0,
    };
  }

  const overallWpm = calculateOverallWpm(segments);
  const pauses = detectPauses(segments);
  const wpmTimeline = calculateWpmTimeline(segments);

  const totalPauseDuration = pauses.reduce((sum, p) => sum + p.duration, 0);
  const goodPauseCount = pauses.filter((p) => p.assessment === "good").length;
  const longPauseCount = pauses.filter(
    (p) => p.assessment === "long" || p.assessment === "very_long"
  ).length;

  const firstStart = Math.min(...segments.map((s) => s.start_time));
  const lastEnd = Math.max(...segments.map((s) => s.end_time));
  const totalDuration = lastEnd - firstStart;

  const intervieweeSpeakingTime = segments
    .filter((s) => s.speaker === "interviewee")
    .reduce((sum, s) => sum + (s.end_time - s.start_time), 0);

  return {
    overall_wpm: overallWpm,
    ideal_wpm_range: IDEAL_WPM_RANGE,
    wpm_assessment: assessWpm(overallWpm),
    pauses,
    pause_count: pauses.length,
    total_pause_duration: Math.round(totalPauseDuration * 10) / 10,
    good_pause_count: goodPauseCount,
    long_pause_count: longPauseCount,
    pause_assessment: assessPauses(pauses),
    wpm_timeline: wpmTimeline,
    total_duration: Math.round(totalDuration),
    interviewee_speaking_time: Math.round(intervieweeSpeakingTime),
  };
}
