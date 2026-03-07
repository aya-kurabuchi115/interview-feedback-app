/**
 * 既存webp画像の背景を除去してPNGに変換するスクリプト
 */
import { fal } from "@fal-ai/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("ERROR: FAL_KEY が .env.local に設定されていません");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

interface BiRefNetResult {
  image: { url: string };
}

const dir = path.resolve(__dirname, "../public/images/personality");

async function processOne(type: string): Promise<void> {
  const webpPath = path.join(dir, `${type}.webp`);
  const pngPath = path.join(dir, `${type}.png`);

  if (fs.existsSync(pngPath)) {
    console.log(`  SKIP: ${type}.png は既に存在`);
    return;
  }

  console.log(`\n[${type.toUpperCase()}] アップロード中...`);
  const webpBuffer = fs.readFileSync(webpPath);
  const blob = new Blob([webpBuffer], { type: "image/webp" });
  const file = new File([blob], `${type}.webp`, { type: "image/webp" });
  const imageUrl = await fal.storage.upload(file);
  console.log(`  URL: ${imageUrl}`);

  console.log(`  背景除去中...`);
  const result = await fal.subscribe("fal-ai/birefnet", {
    input: { image_url: imageUrl },
  });

  const data = result.data as BiRefNetResult;
  if (!data.image?.url) {
    console.error(`  ERROR: ${type} の背景除去に失敗`);
    return;
  }

  const response = await fetch(data.image.url);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(pngPath, buffer);
  console.log(`  OK: ${type}.png (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".webp"));
  console.log(`=== 背景除去（webp → PNG） ===`);
  console.log(`対象: ${files.length}枚\n`);

  for (const file of files) {
    const type = file.replace(".webp", "");
    try {
      await processOne(type);
    } catch (err) {
      console.error(`  ERROR [${type}]:`, err);
    }
  }

  console.log("\n=== 完了 ===");
}

main();
