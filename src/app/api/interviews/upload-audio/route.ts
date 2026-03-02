import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unauthorized, badRequest, serverError } from "@/lib/api/error-response";
import { reportApiError } from "@/lib/error-reporting";

const ASSEMBLYAI_BASE = "https://api.assemblyai.com/v2";
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
];

export async function POST(request: Request) {
  try {
    // 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    const assemblyKey = process.env.ASSEMBLYAI_API_KEY;
    if (!assemblyKey) {
      return serverError(
        "音声処理サービスの設定に問題があります。しばらくしてから再度お試しください。"
      );
    }

    // FormData から音声ファイルを取得
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return badRequest("音声ファイルが必要です");
    }

    if (audioFile.size > MAX_AUDIO_SIZE) {
      return badRequest("音声ファイルは50MB以内にしてください");
    }

    // MIME タイプチェック（WebM は codecs パラメータ付きの場合もある）
    const baseMime = audioFile.type.split(";")[0].trim();
    if (!ALLOWED_MIME_TYPES.includes(baseMime)) {
      return badRequest(
        `対応していない音声形式です: ${audioFile.type}。WebM, MP4, MP3, WAV 形式に対応しています。`
      );
    }

    // 音声データを取得
    const audioBuffer = await audioFile.arrayBuffer();

    // AssemblyAI にアップロード
    const uploadRes = await fetch(`${ASSEMBLYAI_BASE}/upload`, {
      method: "POST",
      headers: {
        authorization: assemblyKey,
        "content-type": "application/octet-stream",
      },
      body: audioBuffer,
    });

    if (!uploadRes.ok) {
      throw new Error(
        `AssemblyAI upload failed: ${uploadRes.status} ${uploadRes.statusText}`
      );
    }

    const uploadData = (await uploadRes.json()) as { upload_url: string };

    if (!uploadData.upload_url) {
      throw new Error("AssemblyAI upload did not return upload_url");
    }

    // Supabase Storage にもバックアップ保存
    const ext = baseMime === "audio/webm" ? "webm" : baseMime.split("/")[1];
    const storagePath = `${user.id}/${Date.now()}.${ext}`;

    await supabase.storage
      .from("interviews")
      .upload(storagePath, audioBuffer, {
        contentType: audioFile.type,
        upsert: false,
      });

    return NextResponse.json({
      audio_url: uploadData.upload_url,
      storage_path: storagePath,
    });
  } catch (error) {
    reportApiError(error, {
      apiRoute: "/api/interviews/upload-audio",
      featureArea: "interview",
    });
    return serverError(
      "音声ファイルのアップロードに失敗しました。しばらくしてから再度お試しください。"
    );
  }
}
