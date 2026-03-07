import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { genAI, MODELS } from "@/lib/gemini";
import type {
  Database,
  Json,
  MockInterviewMessage,
} from "@/types/database";
import { getUserSubscription, getModelForPlan } from "@/lib/subscription";
import { PERSONALITY_DATA, isValidPersonalityType } from "@/lib/personality/types";
import type { PersonalityType } from "@/lib/personality/types";
import { unauthorized } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

const MAX_RETRIES = 3;

interface MockInterviewRow {
  id: string;
  user_id: string;
  company_name: string | null;
  industry: string | null;
  category: string;
  round: string;
  duration_minutes: number;
  difficulty: string;
  messages: MockInterviewMessage[];
  status: string;
  total_questions: number;
  feedback_id: string | null;
}

interface QuestionEvaluation {
  question: string;
  answer: string;
  good_points: string[];
  improvement_points: string[];
  model_answer: string;
  score: number;
}

interface MockFeedbackResponse {
  overall_score: number;
  category_scores: {
    logic: number;
    specificity: number;
    expression: number;
    impression: number;
  };
  question_evaluations: QuestionEvaluation[];
  filler_words: {
    total_count: number;
    filler_rate: number;
    details: { word: string; count: number }[];
    assessment: string;
  };
  overall_good_points: string[];
  overall_improvement_points: string[];
  overall_advice: string;
  summary: string;
}

function buildConversationText(messages: MockInterviewMessage[]): string {
  const lines: string[] = [];
  for (const msg of messages) {
    const speaker = msg.role === "interviewer" ? "面接官" : "候補者";
    lines.push(`[${speaker}] ${msg.content}`);
  }
  return lines.join("\n\n");
}

function extractQAPairs(
  messages: MockInterviewMessage[]
): { question: string; answer: string }[] {
  const pairs: { question: string; answer: string }[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "interviewer") {
      const nextUser = messages[i + 1];
      if (nextUser && nextUser.role === "user") {
        pairs.push({ question: msg.content, answer: nextUser.content });
      }
    }
  }
  return pairs;
}

function buildFeedbackPrompt(
  conversationText: string,
  qaPairs: { question: string; answer: string }[],
  category: string,
  companyName: string | null,
  difficulty: string,
  personalityType: string | null
): string {
  const categoryLabels: Record<string, string> = {
    general: "人物面接（総合）",
    behavioral: "行動面接",
    technical: "技術面接",
    case: "ケース面接",
  };

  const difficultyLabels: Record<string, string> = {
    easy: "やさしい",
    normal: "標準",
    hard: "厳しい",
  };

  const qaPairsText = qaPairs
    .map((qa, i) => `質問${i + 1}: ${qa.question}\n回答${i + 1}: ${qa.answer}`)
    .join("\n\n");

  let personalitySection = "";
  if (personalityType && isValidPersonalityType(personalityType)) {
    const pData = PERSONALITY_DATA[personalityType.toUpperCase() as PersonalityType];
    personalitySection = `
【候補者のパーソナリティタイプ: ${pData.type}（${pData.name}）】
このタイプの話し方の特徴: ${pData.talkStyle}
面接での強み: ${pData.interviewStrengths.join("、")}
面接での弱み: ${pData.interviewWeaknesses.join("、")}
相性の良い企業文化: ${pData.compatibleCultures.join("、")}
パーソナリティに基づくアドバイス: ${pData.adviceTip}

以下の観点もフィードバックに含めてください:
- このタイプの話し方の特徴が回答にどう表れているか
- パーソナリティの強みを活かせている部分と、弱みが出ている部分
- このタイプ特有の面接戦略アドバイス（具体的なアクション付き）
`;
  }

  return `あなたは就活面接のエキスパートコーチです。AI模擬面接の会話内容を分析し、構造化されたフィードバックを提供してください。

あなたの役割:
- 面接の受け答えを客観的に評価する
- 具体的かつ実用的な改善アドバイスを提供する
- 良い点を積極的に見つけて褒める（モチベーション向上のため）
- 改善点は建設的に、次のアクションが明確になるように伝える
- 各質問に対する模範回答を提示する

以下のAI模擬面接の会話を分析し、フィードバックを生成してください。

【面接情報】
- 企業名: ${companyName || "指定なし"}
- 面接タイプ: ${categoryLabels[category] || "その他"}
- 難易度: ${difficultyLabels[difficulty] || "標準"}
${personalitySection}
【質問と回答のペア】
${qaPairsText}

【面接全体の会話】
${conversationText}

以下のJSON形式で回答してください。JSON以外のテキストは一切含めないでください:
{
  "overall_score": <1-100の整数。面接全体の総合評価>,
  "category_scores": {
    "logic": <0-100: 論理性。結論ファースト、構造化、一貫性>,
    "specificity": <0-100: 具体性。エピソードの深さ、数字やデータの使用>,
    "expression": <0-100: 表現力。語彙の豊かさ、分かりやすさ、簡潔さ>,
    "impression": <0-100: 印象/態度。礼儀正しさ、熱意、誠実さ>
  },
  "question_evaluations": [
    {
      "question": "面接官の質問（原文）",
      "answer": "候補者の回答（原文）",
      "good_points": ["良かった点1", "良かった点2"],
      "improvement_points": ["改善点1", "改善点2"],
      "model_answer": "この質問に対する模範回答（200-300文字程度）",
      "score": <1-100の個別スコア>
    }
  ],
  "filler_words": {
    "total_count": <検出されたフィラー表現の総出現回数>,
    "filler_rate": <フィラー率(%)。小数点第1位まで>,
    "details": [
      { "word": "フィラー表現", "count": <出現回数> }
    ],
    "assessment": "フィラー使用に関する評価コメント"
  },
  "overall_good_points": ["良かった点1", "良かった点2", "良かった点3"],
  "overall_improvement_points": ["改善点1", "改善点2", "改善点3"],
  "overall_advice": "次回の面接に向けた具体的なアドバイス（200-400文字程度）",
  "summary": "面接全体の要約（200文字程度）"
}

【重要ルール】
- question_evaluations は質問と回答のペアの数と一致させてください（${qaPairs.length}件）
- model_answer は面接の文脈に沿った現実的な模範回答にしてください
- フィラーワード（えっと、まあ、なんか等）は検出してください`;
}

async function callGeminiWithRetry(
  prompt: string,
  modelName: string
): Promise<MockFeedbackResponse> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // フィードバック生成は常に Pro モデルを使用
      const model = genAI.getGenerativeModel({
        model: MODELS.pro,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`AI応答からJSONを抽出できませんでした（試行 ${attempt}/${MAX_RETRIES}）`);
      }

      const parsed = JSON.parse(jsonMatch[0]) as MockFeedbackResponse;

      if (
        typeof parsed.overall_score !== "number" ||
        parsed.overall_score < 0 ||
        parsed.overall_score > 100
      ) {
        throw new Error("overall_score が不正です");
      }
      if (!Array.isArray(parsed.question_evaluations)) {
        throw new Error("question_evaluations が配列ではありません");
      }
      if (!parsed.category_scores || typeof parsed.category_scores !== "object") {
        throw new Error("category_scores が不正です");
      }

      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Gemini API の呼び出しに失敗しました");
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "面接IDが必要です" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorized();
    }

    const { data: mockData, error: fetchError } = await supabase
      .from("mock_interviews")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !mockData) {
      return NextResponse.json({ error: "模擬面接データが見つかりません" }, { status: 404 });
    }

    const mockInterview = mockData as unknown as MockInterviewRow;

    if (mockInterview.feedback_id) {
      return NextResponse.json(
        { error: "フィードバックは既に生成済みです", feedback_id: mockInterview.feedback_id },
        { status: 409 }
      );
    }

    // 面接が完了していない場合は自動で完了にする（結果ページからのアクセス時）
    if (mockInterview.status !== "completed") {
      const { error: statusUpdateError } = await supabase
        .from("mock_interviews")
        .update({ status: "completed", completed_at: new Date().toISOString() } as Database["public"]["Tables"]["mock_interviews"]["Update"])
        .eq("id", id)
        .eq("user_id", user.id);

      if (statusUpdateError) {
        console.error("[mock-interview/feedback] Status update error:", statusUpdateError.message);
        return NextResponse.json({ error: "面接ステータスの更新に失敗しました" }, { status: 500 });
      }
    }

    const messages: MockInterviewMessage[] = Array.isArray(mockInterview.messages)
      ? mockInterview.messages
      : [];

    if (messages.length < 2) {
      return NextResponse.json({ error: "会話データが不足しています" }, { status: 400 });
    }

    const sub = await getUserSubscription(user.id);
    const modelName = getModelForPlan(sub.plan);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("personality_type")
      .eq("user_id", user.id)
      .single();

    const personalityType = (profileData as { personality_type?: string | null } | null)?.personality_type ?? null;

    const conversationText = buildConversationText(messages);
    const qaPairs = extractQAPairs(messages);

    const prompt = buildFeedbackPrompt(
      conversationText,
      qaPairs,
      mockInterview.category,
      mockInterview.company_name,
      mockInterview.difficulty,
      personalityType
    );

    const feedback = await callGeminiWithRetry(prompt, modelName);

    // interviews テーブルにレコード作成
    type InterviewInsert = Database["public"]["Tables"]["interviews"]["Insert"];
    const interviewTitle = mockInterview.company_name
      ? `模擬面接: ${mockInterview.company_name}`
      : "模擬面接";

    const interviewInsert: InterviewInsert = {
      user_id: user.id,
      title: interviewTitle,
      status: "completed",
      company_name_snapshot: mockInterview.company_name || "模擬面接",
      interview_category: "other",
      transcript: conversationText,
      transcript_char_count: conversationText.length,
    };

    const { data: interviewData, error: interviewInsertError } = await supabase
      .from("interviews")
      .insert(interviewInsert)
      .select("id")
      .single();

    if (interviewInsertError || !interviewData) {
      console.error("[mock-interview/feedback] Interview insert error:", interviewInsertError?.message);
      return NextResponse.json({ error: "面接レコードの作成に失敗しました" }, { status: 500 });
    }

    const interviewRecord = interviewData as { id: string };

    type FeedbackInsert = Database["public"]["Tables"]["feedbacks"]["Insert"];

    const categoryScoresForDb = {
      logic: feedback.category_scores.logic,
      content: feedback.category_scores.specificity,
      manner: feedback.category_scores.impression,
      communication: feedback.category_scores.expression,
    };

    const feedbackInsert: FeedbackInsert = {
      interview_id: interviewRecord.id,
      user_id: user.id,
      overall_score: feedback.overall_score,
      summary: feedback.summary,
      good_points: feedback.overall_good_points as Json,
      improvement_points: feedback.overall_improvement_points as Json,
      overall_comment: feedback.overall_advice,
      category_scores: categoryScoresForDb,
      filler_words: feedback.filler_words as unknown as Json,
      suggestions: feedback.question_evaluations.map((qe) => ({
        original: qe.answer,
        improved: qe.model_answer,
        reason: qe.improvement_points.join("、"),
      })) as unknown as Json,
      strengths: feedback.overall_good_points as Json,
      improvements: feedback.overall_improvement_points as Json,
      annotations: [] as Json,
      raw_response: {
        ...feedback,
        source: "mock_interview",
        mock_interview_id: id,
      } as unknown as Json,
      model_version: modelName,
    };

    const { data: feedbackData, error: feedbackInsertError } = await supabase
      .from("feedbacks")
      .insert(feedbackInsert)
      .select("id")
      .single();

    if (feedbackInsertError || !feedbackData) {
      console.error("[mock-interview/feedback] Feedback insert error:", feedbackInsertError?.message);
      return NextResponse.json({ error: "フィードバックの保存に失敗しました" }, { status: 500 });
    }

    const feedbackRecord = feedbackData as { id: string };

    type MockInterviewUpdate = Database["public"]["Tables"]["mock_interviews"]["Update"];
    const updatePayload: MockInterviewUpdate = { feedback_id: feedbackRecord.id };

    await supabase
      .from("mock_interviews")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      feedback_id: feedbackRecord.id,
      interview_id: interviewRecord.id,
    });
  } catch (error) {
    const errorId = reportApiError(error, {
      apiRoute: "/api/mock-interview/[id]/feedback",
      featureArea: "mock-interview",
    });
    return NextResponse.json(
      { error: "フィードバック生成中にエラーが発生しました。しばらくしてから再度お試しください。", error_id: errorId },
      { status: 500 }
    );
  }
}
