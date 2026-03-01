import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/interview",
        "/profile",
        "/onboarding",
        "/settings",
        "/api",
      ],
    },
    sitemap: "https://interviewcoach.jp/sitemap.xml",
  };
}
