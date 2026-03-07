/**
 * 16パーソナリティアイコン一括生成スクリプト
 * Flux 1.1 Pro で生成 → BiRefNet で背景除去 → PNG 保存
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

interface TypeDef {
  type: string;
  animal: string;
  animalEn: string;
  color: string;
  colorLight: string;
  colorName: string;
}

// 分析家（紫）
const analysts: TypeDef[] = [
  { type: "intj", animal: "フクロウ", animalEn: "owl", color: "#9B72CF", colorLight: "#EDE7F6", colorName: "purple" },
  { type: "intp", animal: "ネコ", animalEn: "cat", color: "#7986CB", colorLight: "#EDE7F6", colorName: "purple" },
  { type: "entj", animal: "ライオン", animalEn: "lion", color: "#AB47BC", colorLight: "#EDE7F6", colorName: "purple" },
  { type: "entp", animal: "キツネ", animalEn: "fox", color: "#CE93D8", colorLight: "#EDE7F6", colorName: "purple" },
];

// 外交官（緑）
const diplomats: TypeDef[] = [
  { type: "infj", animal: "シカ", animalEn: "deer", color: "#66BB6A", colorLight: "#E8F5E9", colorName: "green" },
  { type: "infp", animal: "ウサギ", animalEn: "rabbit", color: "#81C784", colorLight: "#E8F5E9", colorName: "green" },
  { type: "enfj", animal: "イルカ", animalEn: "dolphin", color: "#4CAF50", colorLight: "#E8F5E9", colorName: "green" },
  { type: "enfp", animal: "コアラ", animalEn: "koala", color: "#A5D6A7", colorLight: "#E8F5E9", colorName: "green" },
];

// 番人（青）
const sentinels: TypeDef[] = [
  { type: "istj", animal: "ペンギン", animalEn: "penguin", color: "#42A5F5", colorLight: "#E3F2FD", colorName: "blue" },
  { type: "isfj", animal: "クマ", animalEn: "bear", color: "#64B5F6", colorLight: "#E3F2FD", colorName: "blue" },
  { type: "estj", animal: "ワシ", animalEn: "eagle", color: "#1E88E5", colorLight: "#E3F2FD", colorName: "blue" },
  { type: "esfj", animal: "イヌ", animalEn: "dog", color: "#90CAF9", colorLight: "#E3F2FD", colorName: "blue" },
];

// 探検家（オレンジ）
const explorers: TypeDef[] = [
  { type: "istp", animal: "ネコ", animalEn: "cat", color: "#FF7043", colorLight: "#FBE9E7", colorName: "orange" },
  { type: "isfp", animal: "ハリネズミ", animalEn: "hedgehog", color: "#FF8A65", colorLight: "#FBE9E7", colorName: "orange" },
  { type: "estp", animal: "ヒョウ", animalEn: "leopard", color: "#F4511E", colorLight: "#FBE9E7", colorName: "orange" },
  { type: "esfp", animal: "オウム", animalEn: "parrot", color: "#FFAB91", colorLight: "#FBE9E7", colorName: "orange" },
];

const allTypes = [...analysts, ...diplomats, ...sentinels, ...explorers];

function buildPrompt(t: TypeDef): string {
  return `A cute kawaii ${t.animalEn} character icon, flat vector illustration style, minimal geometric shapes, simple ${t.colorName} and pastel ${t.colorName} color palette, no gradients, no shadows, solid white background, centered, mascot icon for web app, adorable big round eyes, very simple and clean, modern flat design, isolated character`;
}

interface FluxResult {
  images: { url: string }[];
  seed: number;
}

interface BiRefNetResult {
  image: { url: string };
}

async function removeBackground(imageUrl: string): Promise<Buffer> {
  console.log("  背景除去中...");
  const result = await fal.subscribe("fal-ai/birefnet", {
    input: {
      image_url: imageUrl,
    },
  });

  const data = result.data as BiRefNetResult;
  if (!data.image?.url) {
    throw new Error("背景除去に失敗しました");
  }

  const response = await fetch(data.image.url);
  return Buffer.from(await response.arrayBuffer());
}

async function generateOne(t: TypeDef, outputDir: string): Promise<void> {
  const prompt = buildPrompt(t);
  console.log(`\n[${t.type.toUpperCase()}] ${t.animal}（${t.animalEn}）を生成中...`);

  const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
    input: {
      prompt,
      image_size: "square",
      num_images: 1,
      safety_tolerance: "2",
    },
  });

  const data = result.data as FluxResult;
  if (!data.images || data.images.length === 0) {
    console.error(`  ERROR: ${t.type} の画像生成に失敗`);
    return;
  }

  // 背景除去
  const buffer = await removeBackground(data.images[0].url);

  const outputPath = path.resolve(outputDir, `${t.type}.png`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`  OK: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  const skipIntj = process.argv.includes("--skip-intj");
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const onlyType = onlyArg?.split("=")[1]?.toLowerCase();

  let targets = allTypes;
  if (onlyType) {
    targets = allTypes.filter((t) => t.type === onlyType);
  } else if (skipIntj) {
    targets = allTypes.filter((t) => t.type !== "intj");
  }

  const outputDir = path.resolve(__dirname, "../public/images/personality");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`=== 16パーソナリティアイコン生成（フラットデザイン+背景除去） ===`);
  console.log(`対象: ${targets.length}枚`);
  console.log(`出力先: ${outputDir}`);
  console.log(`推定コスト: ~$${(targets.length * 0.05).toFixed(2)}（生成+背景除去）\n`);

  for (const t of targets) {
    try {
      await generateOne(t, outputDir);
    } catch (err) {
      console.error(`  ERROR [${t.type}]:`, err);
    }
  }

  console.log("\n=== 完了 ===");
}

main();
