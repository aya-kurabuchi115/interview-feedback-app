import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ASSEMBLYAI_BASE = "https://api.assemblyai.com/v2";

async function pollTranscript(transcriptId: string, apiKey: string) {
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${ASSEMBLYAI_BASE}/transcript/${transcriptId}`, {
      headers: { authorization: apiKey },
    });
    const data = await res.json();

    if (data.status === "completed") return data;
    if (data.status === "error") throw new Error(data.error);

    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("文字起こしがタイムアウトしました");
}

export async function POST(request: Request) {
  try {
    const { interview_id } = await request.json();
    if (!interview_id) {
      return NextResponse.json({ error: "interview_id is required" }, { status: 400 });
    }

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ASSEMBLYAI_API_KEY not configured" }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // interviews レコードを取得
    const { data: interview, error: fetchError } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", interview_id)
      .single();

    if (fetchError || !interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // ステータスを transcribing に更新
    await supabase
      .from("interviews")
      .update({ status: "transcribing" } as never)
      .eq("id", interview_id);

    // AssemblyAI に文字起こしリクエスト
    const transcriptRes = await fetch(`${ASSEMBLYAI_BASE}/transcript`, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: (interview as Record<string, unknown>).audio_url,
        speaker_labels: true,
        language_code: "ja",
      }),
    });

    const transcriptData = await transcriptRes.json();
    if (!transcriptData.id) {
      throw new Error("Failed to start transcription");
    }

    // ポーリングで完了を待つ
    const result = await pollTranscript(transcriptData.id, apiKey);

    // utterances を transcripts テーブルに保存
    if (result.utterances) {
      const transcripts = result.utterances.map(
        (u: { speaker: string; text: string; start: number; end: number }, index: number) => ({
          interview_id,
          speaker: index % 2 === 0 ? "interviewer" : "interviewee",
          content: u.text,
          start_time: u.start / 1000,
          end_time: u.end / 1000,
        })
      );

      for (const t of transcripts) {
        await supabase.from("transcripts").insert(t as never);
      }
    }

    // ステータスを analyzing に更新
    await supabase
      .from("interviews")
      .update({ status: "analyzing" } as never)
      .eq("id", interview_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    // エラー時は status を error に
    try {
      const { interview_id } = await request.clone().json();
      if (interview_id) {
        const supabase = await createClient();
        await supabase
          .from("interviews")
          .update({ status: "error" } as never)
          .eq("id", interview_id);
      }
    } catch {
      // ignore
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
