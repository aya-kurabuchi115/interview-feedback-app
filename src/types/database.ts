/**
 * Supabase Database 型定義
 * Issue #17: DBスキーマ・RLS設計
 *
 * このファイルはマイグレーション 00001 + 00002 の完全なスキーマに対応する型定義。
 * supabase gen types typescript で再生成した場合はこのファイルを上書きすること。
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================
// ENUM 型
// ============================================================

/** 面接カテゴリ */
export type InterviewCategory = "arubaito" | "intern" | "new_grad" | "other";

/** 面接ラウンド */
export type InterviewRound =
  | "first"
  | "second"
  | "third"
  | "final"
  | "gd"
  | "case"
  | "other";

/** サブスクリプションプラン */
export type SubscriptionPlan = "free" | "pro" | "premium" | "enterprise";

/** サブスクリプションステータス */
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "trialing"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

/** 就活ステータス */
export type JobHuntingStatus =
  | "not_started"
  | "preparing"
  | "active"
  | "offered"
  | "decided"
  | "other";

/** 面接ステータス */
export type InterviewStatus =
  | "uploaded"
  | "transcribing"
  | "analyzing"
  | "completed"
  | "error";

/** 話者 */
export type Speaker = "interviewer" | "interviewee";

/** 模擬面接カテゴリ */
export type MockInterviewCategory =
  | "general"
  | "technical"
  | "behavioral"
  | "case";

/** 模擬面接ラウンド */
export type MockInterviewRound =
  | "first"
  | "second"
  | "third"
  | "final";

/** 模擬面接難易度 */
export type MockInterviewDifficulty = "easy" | "normal" | "hard";

/** 模擬面接ステータス */
export type MockInterviewStatus = "in_progress" | "completed";

/** 模擬面接メッセージ */
export interface MockInterviewMessage {
  role: "interviewer" | "user";
  content: string;
  timestamp: string;
}

// ============================================================
// カテゴリ別スコアの型
// ============================================================

/** フィードバックのカテゴリ別スコア */
export interface CategoryScores {
  /** 論理性スコア (0-100) */
  logic?: number;
  /** 具体性スコア (0-100) */
  specificity?: number;
  /** 熱意スコア (0-100) */
  enthusiasm?: number;
  /** マナースコア (0-100) */
  manners?: number;
  /** 質問対応スコア (0-100) */
  question_handling?: number;
  /** その他のカテゴリスコア */
  [key: string]: number | undefined;
}

// ============================================================
// Database 型定義
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          university: string | null;
          faculty: string | null;
          graduation_year: number | null;
          graduation_month: number | null;
          target_industry: string[];
          target_job_type: string[];
          job_hunting_status: JobHuntingStatus;
          job_hunting_start_date: string | null;
          preferred_work_location: string[];
          personality_type: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          university?: string | null;
          faculty?: string | null;
          graduation_year?: number | null;
          graduation_month?: number | null;
          target_industry?: string[];
          target_job_type?: string[];
          job_hunting_status?: JobHuntingStatus;
          job_hunting_start_date?: string | null;
          preferred_work_location?: string[];
          personality_type?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          university?: string | null;
          faculty?: string | null;
          graduation_year?: number | null;
          graduation_month?: number | null;
          target_industry?: string[];
          target_job_type?: string[];
          job_hunting_status?: JobHuntingStatus;
          job_hunting_start_date?: string | null;
          preferred_work_location?: string[];
          personality_type?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      companies: {
        Row: {
          id: string;
          name: string;
          industry: string | null;
          normalized_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          industry?: string | null;
          normalized_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          industry?: string | null;
          normalized_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      interviews: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          audio_url: string | null;
          duration_seconds: number | null;
          status: InterviewStatus;
          company_id: string | null;
          company_name_snapshot: string;
          interview_category: InterviewCategory;
          interview_round: InterviewRound | null;
          interview_date: string | null;
          transcript: string | null;
          transcript_char_count: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          audio_url?: string | null;
          duration_seconds?: number | null;
          status?: InterviewStatus;
          company_id?: string | null;
          company_name_snapshot?: string;
          interview_category?: InterviewCategory;
          interview_round?: InterviewRound | null;
          interview_date?: string | null;
          transcript?: string | null;
          transcript_char_count?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          audio_url?: string | null;
          duration_seconds?: number | null;
          status?: InterviewStatus;
          company_id?: string | null;
          company_name_snapshot?: string;
          interview_category?: InterviewCategory;
          interview_round?: InterviewRound | null;
          interview_date?: string | null;
          transcript?: string | null;
          transcript_char_count?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      transcripts: {
        Row: {
          id: string;
          interview_id: string;
          speaker: Speaker;
          content: string;
          start_time: number;
          end_time: number;
        };
        Insert: {
          id?: string;
          interview_id: string;
          speaker: Speaker;
          content: string;
          start_time: number;
          end_time: number;
        };
        Update: {
          id?: string;
          interview_id?: string;
          speaker?: Speaker;
          content?: string;
          start_time?: number;
          end_time?: number;
        };
        Relationships: [];
      };

      feedbacks: {
        Row: {
          id: string;
          interview_id: string;
          user_id: string | null;
          overall_score: number;
          summary: string;
          filler_words: Json;
          suggestions: Json;
          strengths: Json;
          improvements: Json;
          good_points: Json;
          improvement_points: Json;
          overall_comment: string | null;
          category_scores: CategoryScores;
          annotations: Json;
          raw_response: Json | null;
          model_version: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          user_id?: string | null;
          overall_score: number;
          summary: string;
          filler_words?: Json;
          suggestions?: Json;
          strengths?: Json;
          improvements?: Json;
          good_points?: Json;
          improvement_points?: Json;
          overall_comment?: string | null;
          category_scores?: CategoryScores;
          annotations?: Json;
          raw_response?: Json | null;
          model_version?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          user_id?: string | null;
          overall_score?: number;
          summary?: string;
          filler_words?: Json;
          suggestions?: Json;
          strengths?: Json;
          improvements?: Json;
          good_points?: Json;
          improvement_points?: Json;
          overall_comment?: string | null;
          category_scores?: CategoryScores;
          annotations?: Json;
          raw_response?: Json | null;
          model_version?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      interview_tags: {
        Row: {
          interview_id: string;
          tag_id: string;
        };
        Insert: {
          interview_id: string;
          tag_id: string;
        };
        Update: {
          interview_id?: string;
          tag_id?: string;
        };
        Relationships: [];
      };

      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at: string | null;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      /** Issue #129: AI模擬面接 */
      mock_interviews: {
        Row: {
          id: string;
          user_id: string;
          company_name: string | null;
          industry: string | null;
          category: string;
          round: string;
          duration_minutes: number;
          difficulty: string;
          messages: Json;
          status: string;
          total_questions: number;
          started_at: string;
          completed_at: string | null;
          feedback_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name?: string | null;
          industry?: string | null;
          category?: string;
          round?: string;
          duration_minutes?: number;
          difficulty?: string;
          messages?: Json;
          status?: string;
          total_questions?: number;
          started_at?: string;
          completed_at?: string | null;
          feedback_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string | null;
          industry?: string | null;
          category?: string;
          round?: string;
          duration_minutes?: number;
          difficulty?: string;
          messages?: Json;
          status?: string;
          total_questions?: number;
          started_at?: string;
          completed_at?: string | null;
          feedback_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      /** Issue #78: 面接結果の共有リンク */
      shared_results: {
        Row: {
          id: string;
          interview_id: string;
          user_id: string;
          share_token: string;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          user_id: string;
          share_token: string;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          user_id?: string;
          share_token?: string;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      interview_category: InterviewCategory;
      interview_round: InterviewRound;
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
      job_hunting_status: JobHuntingStatus;
      mock_interview_category: MockInterviewCategory;
      mock_interview_round: MockInterviewRound;
      mock_interview_difficulty: MockInterviewDifficulty;
      mock_interview_status: MockInterviewStatus;
    };
  };
}

// ============================================================
// ヘルパー型
// ============================================================

/** テーブル名のユニオン型 */
export type TableName = keyof Database["public"]["Tables"];

/** 指定テーブルの Row 型 */
export type Row<T extends TableName> =
  Database["public"]["Tables"][T]["Row"];

/** 指定テーブルの Insert 型 */
export type InsertRow<T extends TableName> =
  Database["public"]["Tables"][T]["Insert"];

/** 指定テーブルの Update 型 */
export type UpdateRow<T extends TableName> =
  Database["public"]["Tables"][T]["Update"];
