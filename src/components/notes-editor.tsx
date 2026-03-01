"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { StickyNote, Check, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { MAX_NOTES_LENGTH } from "@/lib/constants";

interface NotesEditorProps {
  interviewId: string;
  initialNotes: string | null;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function NotesEditor({ interviewId, initialNotes }: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const saveNotes = useCallback(async (value: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/interviews/${interviewId}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value }),
        signal: controller.signal,
      });
      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSaveStatus("error");
    }
  }, [interviewId]);

  const handleChange = useCallback((value: string) => {
    setNotes(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { saveNotes(value); }, 1000);
  }, [saveNotes]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">メモ</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>保存中...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Check className="h-3 w-3 text-green-500" />
              <span className="text-green-600 dark:text-green-400">保存済み</span>
            </>
          )}
          {saveStatus === "error" && (
            <span className="text-red-600 dark:text-red-400">保存に失敗しました</span>
          )}
          <span>{notes.length}/{MAX_NOTES_LENGTH}</span>
        </div>
      </div>
      <Textarea
        placeholder="面接のメモを自由に記入できます..."
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        maxLength={MAX_NOTES_LENGTH}
        rows={4}
        className="resize-y"
      />
    </div>
  );
}
