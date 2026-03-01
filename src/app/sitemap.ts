import type { MetadataRoute } from "next";
import { questions } from "@/lib/questions/data";

const siteUrl = "https://interviewcoach.jp";

export default function sitemap(): MetadataRoute.Sitemap {
  const questionPages: MetadataRoute.Sitemap = questions.map((q) => ({
    url: `${siteUrl}/questions/${q.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/questions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...questionPages,
    {
      url: `${siteUrl}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/legal/tokushoho`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
