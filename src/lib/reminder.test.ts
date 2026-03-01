import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getReminderSettings,
  saveReminderSettings,
  getDaysForFrequency,
  recordPracticeActivity,
  getLastPracticeTimestamp,
  getDaysSinceLastPractice,
  dismissReminderBanner,
  isReminderBannerDismissed,
  shouldShowReminder,
  shouldShowInactivityBanner,
  FREQUENCY_LABELS,
  DAY_LABELS,
  type ReminderSettings,
} from "./reminder";

// localStorage のモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("reminder", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getReminderSettings", () => {
    it("デフォルト設定を返す", () => {
      const settings = getReminderSettings();
      expect(settings.enabled).toBe(false);
      expect(settings.frequency).toBe("three_per_week");
      expect(settings.time).toBe("20:00");
      expect(settings.days).toEqual([false, true, false, true, false, true, false]);
    });

    it("保存済みの設定を正しく読み込む", () => {
      const custom: ReminderSettings = {
        enabled: true,
        frequency: "daily",
        time: "09:00",
        days: [true, true, true, true, true, true, true],
      };
      saveReminderSettings(custom);
      const settings = getReminderSettings();
      expect(settings).toEqual(custom);
    });

    it("不正な JSON の場合デフォルトを返す", () => {
      localStorageMock.setItem("practice_reminder_settings", "invalid-json");
      const settings = getReminderSettings();
      expect(settings.enabled).toBe(false);
    });
  });

  describe("saveReminderSettings", () => {
    it("設定を localStorage に保存する", () => {
      const settings: ReminderSettings = {
        enabled: true,
        frequency: "weekly",
        time: "18:30",
        days: [false, true, false, false, false, false, false],
      };
      saveReminderSettings(settings);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "practice_reminder_settings",
        JSON.stringify(settings)
      );
    });
  });

  describe("getDaysForFrequency", () => {
    it("daily は全日 true", () => {
      const days = getDaysForFrequency("daily");
      expect(days).toEqual([true, true, true, true, true, true, true]);
    });

    it("three_per_week は月水金", () => {
      const days = getDaysForFrequency("three_per_week");
      expect(days).toEqual([false, true, false, true, false, true, false]);
    });

    it("weekly は月曜のみ", () => {
      const days = getDaysForFrequency("weekly");
      expect(days).toEqual([false, true, false, false, false, false, false]);
    });
  });

  describe("recordPracticeActivity / getLastPracticeTimestamp", () => {
    it("タイムスタンプを記録・取得できる", () => {
      expect(getLastPracticeTimestamp()).toBeNull();
      recordPracticeActivity();
      expect(getLastPracticeTimestamp()).not.toBeNull();
    });
  });

  describe("getDaysSinceLastPractice", () => {
    it("記録がない場合 null を返す", () => {
      expect(getDaysSinceLastPractice()).toBeNull();
    });

    it("今日の記録なら 0 日", () => {
      recordPracticeActivity();
      expect(getDaysSinceLastPractice()).toBe(0);
    });

    it("3日前の記録なら 3", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      localStorageMock.setItem("last_practice_timestamp", threeDaysAgo.toISOString());
      expect(getDaysSinceLastPractice()).toBe(3);
    });
  });

  describe("dismissReminderBanner / isReminderBannerDismissed", () => {
    it("dismiss 前は false", () => {
      expect(isReminderBannerDismissed()).toBe(false);
    });

    it("dismiss 後は true", () => {
      dismissReminderBanner();
      expect(isReminderBannerDismissed()).toBe(true);
    });
  });

  describe("shouldShowReminder", () => {
    it("無効の場合 false を返す", () => {
      expect(shouldShowReminder()).toBe(false);
    });

    it("有効で曜日・時刻が一致すれば true", () => {
      const now = new Date();
      const todayDay = now.getDay();
      const days = [false, false, false, false, false, false, false];
      days[todayDay] = true;

      saveReminderSettings({
        enabled: true,
        frequency: "daily",
        time: "00:00", // 常に過ぎている
        days,
      });

      expect(shouldShowReminder()).toBe(true);
    });

    it("曜日が一致しなければ false", () => {
      const now = new Date();
      const todayDay = now.getDay();
      const days = [true, true, true, true, true, true, true];
      days[todayDay] = false;

      saveReminderSettings({
        enabled: true,
        frequency: "daily",
        time: "00:00",
        days,
      });

      expect(shouldShowReminder()).toBe(false);
    });
  });

  describe("shouldShowInactivityBanner", () => {
    it("無効の場合 false", () => {
      expect(shouldShowInactivityBanner()).toBe(false);
    });

    it("一度も利用していない場合 false", () => {
      saveReminderSettings({
        enabled: true,
        frequency: "daily",
        time: "00:00",
        days: [true, true, true, true, true, true, true],
      });
      expect(shouldShowInactivityBanner()).toBe(false);
    });

    it("daily で2日以上経過していれば true", () => {
      saveReminderSettings({
        enabled: true,
        frequency: "daily",
        time: "00:00",
        days: [true, true, true, true, true, true, true],
      });
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      localStorageMock.setItem("last_practice_timestamp", threeDaysAgo.toISOString());
      expect(shouldShowInactivityBanner()).toBe(true);
    });

    it("weekly で10日以上経過していれば true", () => {
      saveReminderSettings({
        enabled: true,
        frequency: "weekly",
        time: "00:00",
        days: [false, true, false, false, false, false, false],
      });
      const elevenDaysAgo = new Date();
      elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);
      localStorageMock.setItem("last_practice_timestamp", elevenDaysAgo.toISOString());
      expect(shouldShowInactivityBanner()).toBe(true);
    });
  });

  describe("定数", () => {
    it("FREQUENCY_LABELS が正しい", () => {
      expect(FREQUENCY_LABELS.daily).toBe("毎日");
      expect(FREQUENCY_LABELS.three_per_week).toBe("週3回");
      expect(FREQUENCY_LABELS.weekly).toBe("週1回");
    });

    it("DAY_LABELS が7つ", () => {
      expect(DAY_LABELS).toHaveLength(7);
      expect(DAY_LABELS[0]).toBe("日");
      expect(DAY_LABELS[6]).toBe("土");
    });
  });
});
