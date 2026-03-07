import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { genAI, MODELS } from "@/lib/gemini";
import { unauthorized } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

// ============================================================
// 定数
// ============================================================

/** 音声ファイルの最大サイズ（25MB） */
const MAX_FILE_SIZE = 25 * 1024 * 1024;

/** 許可する MIME タイプ */
const ALLOWED_MIME_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
  "audio/mp3",
  "audio/aac",
  "audio/flac",
  "video/webm",
];

// ============================================================
// POST ハンドラ
// ============================================================

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    // 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return unauthorized();
    }

    // FormData から音声ファイルを取得
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "音声ファイルが送信されていません" },
        { status: 400 }
      );
    }

    // MIME タイプチェック（codecs パラメータを除去して比較）
    const baseMimeType = audioFile.type.split(";")[0].trim();
    if (!ALLOWED_MIME_TYPES.includes(baseMimeType)) {
      return NextResponse.json(
        { error: `対応していない音声形式です: ${audioFile.type}` },
        { status: 400 }
      );
    }

    // ファイルサイズチェック
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "音声ファイルが大きすぎます（最大25MB）" },
        { status: 400 }
      );
    }

    // 音声データを Base64 に変換
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    // Gemini でフィラーを含めた文字起こし
    const model = genAI.getGenerativeModel({ model: MODELS.flash });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: baseMimeType,
          data: base64Audio,
        },
      },
      {
        text: `この音声を日本語で文字起こししてください。

【重要なルール】
- フィラー表現（「えーっと」「あの」「えー」「まあ」「なんか」「その」「えっと」「うーん」等）は絶対にカットせず、そのまま忠実に書き起こしてください
- 言い直しや言い淀みもそのまま含めてください
- 句読点を適切に入れてください
- 音声の内容のみを出力し、それ以外の説明やコメントは一切含めないでください
- 音声が聞き取れない場合は空文字を返してください`,
      },
    ]);

    const text = result.response.text().trim();

    // 音声が検出されなかった場合
    if (!text) {
      return NextResponse.json(
        {
          error:
            "音声が検出されませんでした。マイクの設定を確認し、はっきりと話してからもう一度お試しください。",
          code: "NO_SPEECH_DETECTED",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
    });
  } catch (error) {
    const errorId = reportApiError(error, {
      apiRoute: "/api/stt",
      featureArea: "stt",
    });
    return NextResponse.json(
      {
        error:
          "音声の文字起こしに失敗しました。しばらくしてから再度お試しください。",
        error_id: errorId,
      },
      { status: 500 }
    );
  }
}
