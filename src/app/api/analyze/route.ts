import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { interview_id } = await request.json();
    if (!interview_id) {
      return NextResponse.json({ error: "interview_id is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ステータスを analyzing に更新
    await supabase
      .from("interviews")
      .update({ status: "analyzing" } as never)
      .eq("id", interview_id);

    // 文字起こしデータを取得
    const { data: transcripts } = await supabase
      .from("transcripts")
      .select("*")
      .eq("interview_id", interview_id)
      .order("start_time", { ascending: true });

    if (!transcripts || transcripts.length === 0) {
      throw new Error("No transcripts found");
    }

    // 文字起こしをテキストに変換
    const transcriptText = (transcripts as Array<Record<string, unknown>>)
      .map((t) => `[${t.speaker}] ${t.content}`)
      .join("\n");

    // Claude API でフィードバック生成
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `あなたは面接コーチです。以下の面接の文字起こしを分析し、JSON形式でフィードバックを生成してください。

文字起こし:
${transcriptText}

以下のJSON形式で回答してください（日本語で）:
{
  "overall_score": <1-100の整数>,
  "summary": "<面接全体の要約（200文字程度）>",
  "suggestions": [
    {
      "original": "<元の回答>",
      "improved": "<改善案>",
      "reason": "<改善理由>"
    }
  ],
  "filler_words": [
    {
      "word": "<フィラーワード>",
      "count": <回数>
    }
  ],
  "strengths": ["<強み1>", "<強み2>"],
  "improvements": ["<改善点1>", "<改善点2>"]
}

JSONのみを出力してください。`,
        },
      ],
    });

    // レスポンスからJSONを抽出
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const feedback = JSON.parse(jsonMatch[0]);

    // feedbacks テーブルに保存
    await supabase.from("feedbacks").insert({
      interview_id,
      overall_score: feedback.overall_score,
      summary: feedback.summary,
      filler_words: feedback.filler_words,
      suggestions: feedback.suggestions,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
    } as never);

    // ステータスを completed に更新
    await supabase
      .from("interviews")
      .update({ status: "completed" } as never)
      .eq("id", interview_id);

    return NextResponse.json({ success: true });
  } catch (error) {
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
