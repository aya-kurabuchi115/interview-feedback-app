/**
 * i18n ヘルパー
 *
 * 型安全なメッセージ参照関数を提供する。
 * 現在は日本語のみだが、将来的に言語切り替え機構を追加可能な設計。
 */

import { ja } from "./ja";
import type { MessageKey, Messages } from "./types";

/** 現在のメッセージオブジェクト（将来的にロケール切替対応可能） */
const messages: Messages = ja;

/**
 * ドットキーで指定されたメッセージ文字列を取得する。
 *
 * @param key - "namespace.key" 形式のメッセージキー（例: "common.loading"）
 * @param params - テンプレート変数の置換マップ（例: { count: 3 }）
 * @returns 解決されたメッセージ文字列。キーが見つからない場合はキー自体を返す。
 *
 * @example
 * t("common.loading")          // => "読み込み中..."
 * t("interview.companyNameMaxLength", { max: 100 }) // => "企業名は100文字以内で入力してください"
 */
export function t(
  key: MessageKey,
  params?: Record<string, string | number>
): string {
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = messages;

  for (const part of parts) {
    if (value == null || typeof value !== "object") {
      return key;
    }
    value = value[part];
  }

  if (typeof value !== "string") {
    return key;
  }

  // テンプレート変数の置換: {variable} -> params[variable]
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, name: string) => {
      const replacement = params[name];
      return replacement != null ? String(replacement) : `{${name}}`;
    });
  }

  return value;
}

// 名前空間単位でオブジェクトを取得するヘルパー
export function getMessages<NS extends keyof Messages>(
  namespace: NS
): Messages[NS] {
  return messages[namespace];
}

// 型と定数をre-export
export { ja } from "./ja";
export type { MessageKey, Messages, Namespace } from "./types";
