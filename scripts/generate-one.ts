/**
 * 1枚だけ生成+背景除去するスクリプト
 * Usage: npx tsx scripts/generate-one.ts "prompt" output-filename.png
 */
import { fal } from "@fal-ai/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
fal.config({ credentials: process.env.FAL_KEY! });

async function main() {
  const prompt = process.argv[2];
  const outputName = process.argv[3] || "test.png";

  if (!prompt) {
    console.error("Usage: npx tsx scripts/generate-one.ts \"prompt\" output.png");
    process.exit(1);
  }

  const outputPath = path.resolve(__dirname, "../public/images/personality", outputName);

  console.log("Generating...");
  console.log("Prompt:", prompt);

  const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
    input: {
      prompt,
      image_size: "square",
      num_images: 1,
      safety_tolerance: "2",
    },
  });

  const data = result.data as { images: { url: string }[] };
  if (!data.images?.[0]?.url) {
    console.error("Generation failed");
    process.exit(1);
  }

  console.log("Removing background...");
  const bgResult = await fal.subscribe("fal-ai/birefnet", {
    input: { image_url: data.images[0].url },
  });

  const bgData = bgResult.data as { image: { url: string } };
  if (!bgData.image?.url) {
    console.error("BG removal failed");
    process.exit(1);
  }

  const response = await fetch(bgData.image.url);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  console.log(`OK: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
