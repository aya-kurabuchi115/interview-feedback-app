export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      interviews: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          audio_url: string | null;
          duration_seconds: number | null;
          status: "uploaded" | "transcribing" | "analyzing" | "completed" | "error";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          audio_url?: string | null;
          duration_seconds?: number | null;
          status?: "uploaded" | "transcribing" | "analyzing" | "completed" | "error";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          audio_url?: string | null;
          duration_seconds?: number | null;
          status?: "uploaded" | "transcribing" | "analyzing" | "completed" | "error";
          created_at?: string;
        };
      };
      transcripts: {
        Row: {
          id: string;
          interview_id: string;
          speaker: "interviewer" | "interviewee";
          content: string;
          start_time: number;
          end_time: number;
        };
        Insert: {
          id?: string;
          interview_id: string;
          speaker: "interviewer" | "interviewee";
          content: string;
          start_time: number;
          end_time: number;
        };
        Update: {
          id?: string;
          interview_id?: string;
          speaker?: "interviewer" | "interviewee";
          content?: string;
          start_time?: number;
          end_time?: number;
        };
      };
      feedbacks: {
        Row: {
          id: string;
          interview_id: string;
          overall_score: number;
          summary: string;
          filler_words: Json;
          suggestions: Json;
          strengths: Json;
          improvements: Json;
        };
        Insert: {
          id?: string;
          interview_id: string;
          overall_score: number;
          summary: string;
          filler_words?: Json;
          suggestions?: Json;
          strengths?: Json;
          improvements?: Json;
        };
        Update: {
          id?: string;
          interview_id?: string;
          overall_score?: number;
          summary?: string;
          filler_words?: Json;
          suggestions?: Json;
          strengths?: Json;
          improvements?: Json;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
