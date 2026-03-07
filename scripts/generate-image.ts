/**
 * 画像生成スクリプト（fal.ai Flux 1.1 Pro）
 *
 * 使い方:
 *   npx tsx scripts/generate-image.ts "プロンプト" [出力ファイル名]
 *
 * 例:
 *   npx tsx scripts/generate-image.ts "A professional Japanese businessman" hero-person.webp
 */

import { fal } from "@fal-ai/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// .env.local を読み込み
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("ERROR: FAL_KEY が .env.local に設定されていません");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

interface FluxResult {
  images: { url: string; content_type: string }[];
  seed: number;
  prompt: string;
}

async function generateImage(prompt: string, outputFileName: string) {
  console.log("=== fal.ai Flux 1.1 Pro 画像生成 ===");
  console.log(`プロンプト: ${prompt}`);
  console.log(`出力先: public/images/${outputFileName}`);
  console.log("生成中...\n");

  const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
    input: {
      prompt,
      image_size: "landscape_16_9",
      num_images: 1,
      safety_tolerance: "2",
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS" && update.logs) {
        for (const log of update.logs) {
          console.log(`  [進捗] ${log.message}`);
        }
      }
    },
  });

  const data = result.data as FluxResult;

  if (!data.images || data.images.length === 0) {
    console.error("ERROR: 画像が生成されませんでした");
    process.exit(1);
  }

  const imageUrl = data.images[0].url;
  console.log(`\n画像URL: ${imageUrl}`);

  // 画像をダウンロードして保存
  const outputDir = path.resolve(__dirname, "../public/images");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.resolve(outputDir, outputFileName);
  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);

  console.log(`\n保存完了: ${outputPath}`);
  console.log(`ファイルサイズ: ${(buffer.length / 1024).toFixed(1)} KB`);
  console.log(`Seed: ${data.seed}`);
}

// --- CLI ---
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("使い方: npx tsx scripts/generate-image.ts \"プロンプト\" [出力ファイル名]");
  console.log("例: npx tsx scripts/generate-image.ts \"A professional person\" hero.webp");
  process.exit(0);
}

const prompt = args[0];
const outputFileName = args[1] || "generated.webp";

generateImage(prompt, outputFileName).catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
