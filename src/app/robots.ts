import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/profile",
        "/onboarding",
        "/settings",
        "/api",
      ],
    },
    sitemap: "https://interview-ai-coach.com/sitemap.xml",
  };
}
