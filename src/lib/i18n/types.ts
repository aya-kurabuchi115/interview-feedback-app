/**
 * i18n メッセージ型定義
 *
 * 各名前空間のキーをドット区切りで参照するためのユーティリティ型。
 * 例: "common.loading" | "auth.login" | "dashboard.title" ...
 */

import type { ja } from "./ja";

/** メッセージオブジェクト全体の型 */
export type Messages = typeof ja;

/** 名前空間のキー */
export type Namespace = keyof Messages;

/**
 * ネストされたオブジェクトのリーフキーをドット区切りで取得するユーティリティ型。
 * 最大2階層まで対応。
 */
type DotPrefix<T extends string, U extends string> = `${T}.${U}`;

type NestedKeys<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends string
        ? K
        : T[K] extends object
          ? DotPrefix<K, keyof T[K] & string>
          : never;
    }[keyof T & string]
  : never;

/** メッセージキーの完全修飾型（名前空間.キー） */
export type MessageKey = {
  [NS in Namespace]: DotPrefix<NS, NestedKeys<Messages[NS]>>;
}[Namespace];
