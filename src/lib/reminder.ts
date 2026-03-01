/**
 * 面接練習リマインダー設定ユーティリティ
 *
 * localStorage ベースでリマインダーの頻度・時刻・曜日を管理する。
 * DB 変更不要。ブラウザ通知 API と組み合わせて使用。
 */

// ============================================================
// localStorage キー
// ============================================================

const REMINDER_SETTINGS_KEY = "practice_reminder_settings";
const LAST_PRACTICE_KEY = "last_practice_timestamp";
const REMINDER_DISMISSED_KEY = "reminder_banner_dismissed";

// ============================================================
// 型定義
// ============================================================

export type ReminderFrequency = "daily" | "three_per_week" | "weekly";

export interface ReminderSettings {
  /** リマインダー有効/無効 */
  enabled: boolean;
  /** 頻度 */
  frequency: ReminderFrequency;
  /** リマインダー時刻（HH:mm 形式） */
  time: string;
  /** 曜日ごとの有効/無効（0=日, 1=月, ... 6=土） */
  days: boolean[];
}

// ============================================================
// デフォルト値
// ============================================================

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  frequency: "three_per_week",
  time: "20:00",
  // デフォルト: 月水金
  days: [false, true, false, true, false, true, false],
};

/** 頻度のプリセット曜日 */
const FREQUENCY_PRESETS: Record<ReminderFrequency, boolean[]> = {
  daily: [true, true, true, true, true, true, true],
  three_per_week: [false, true, false, true, false, true, false],
  weekly: [false, true, false, false, false, false, false],
};

// ============================================================
// 設定の読み書き
// ============================================================

/** リマインダー設定を取得 */
export function getReminderSettings(): ReminderSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(REMINDER_SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(stored) as Partial<ReminderSettings>;
    return {
      enabled: parsed.enabled ?? DEFAULT_SETTINGS.enabled,
      frequency: parsed.frequency ?? DEFAULT_SETTINGS.frequency,
      time: parsed.time ?? DEFAULT_SETTINGS.time,
      days:
        Array.isArray(parsed.days) && parsed.days.length === 7
          ? parsed.days
          : DEFAULT_SETTINGS.days,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** リマインダー設定を保存 */
export function saveReminderSettings(settings: ReminderSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(settings));
}

/** 頻度プリセットから曜日配列を取得 */
export function getDaysForFrequency(frequency: ReminderFrequency): boolean[] {
  return [...FREQUENCY_PRESETS[frequency]];
}

// ============================================================
// 最終利用日の管理
// ============================================================

/** 最終利用タイムスタンプを記録 */
export function recordPracticeActivity(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_PRACTICE_KEY, new Date().toISOString());
}

/** 最終利用タイムスタンプを取得 */
export function getLastPracticeTimestamp(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_PRACTICE_KEY);
}

/** 最終利用からの経過日数を計算 */
export function getDaysSinceLastPractice(): number | null {
  const timestamp = getLastPracticeTimestamp();
  if (!timestamp) return null;
  const last = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// ============================================================
// バナー dismiss 管理
// ============================================================

/** バナーを非表示にする（当日分） */
export function dismissReminderBanner(): void {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(REMINDER_DISMISSED_KEY, today);
}

/** バナーが当日 dismiss 済みか */
export function isReminderBannerDismissed(): boolean {
  if (typeof window === "undefined") return true;
  const dismissed = localStorage.getItem(REMINDER_DISMISSED_KEY);
  if (!dismissed) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dismissed === today;
}

// ============================================================
// リマインダー判定ロジック
// ============================================================

/**
 * 今日リマインダーを表示すべきかどうか判定する
 * - 設定が有効
 * - 今日が設定曜日に含まれている
 * - リマインダー時刻を過ぎている
 */
export function shouldShowReminder(): boolean {
  const settings = getReminderSettings();
  if (!settings.enabled) return false;

  const now = new Date();
  const todayDay = now.getDay(); // 0=日, 1=月, ...

  // 曜日チェック
  if (!settings.days[todayDay]) return false;

  // 時刻チェック
  const [hours, minutes] = settings.time.split(":").map(Number);
  const reminderTime = new Date(now);
  reminderTime.setHours(hours, minutes, 0, 0);

  return now >= reminderTime;
}

/**
 * ダッシュボードでリマインダーバナーを表示すべきか判定
 * 設定日数以上利用がなければ true
 */
export function shouldShowInactivityBanner(): boolean {
  const settings = getReminderSettings();
  if (!settings.enabled) return false;
  if (isReminderBannerDismissed()) return false;

  const daysSince = getDaysSinceLastPractice();

  // 一度も利用していない場合は表示しない（初回ユーザーはデータがない）
  if (daysSince === null) return false;

  // 頻度に応じた閾値
  const thresholds: Record<ReminderFrequency, number> = {
    daily: 2,
    three_per_week: 4,
    weekly: 10,
  };

  return daysSince >= thresholds[settings.frequency];
}

// ============================================================
// 表示用ヘルパー
// ============================================================

export const FREQUENCY_LABELS: Record<ReminderFrequency, string> = {
  daily: "毎日",
  three_per_week: "週3回",
  weekly: "週1回",
};

export const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;
