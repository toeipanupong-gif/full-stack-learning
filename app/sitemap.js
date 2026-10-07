import { absoluteUrl, openChapters } from "@/lib/seo";

export default function sitemap() {
  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...openChapters().map((chapter) => ({
      url: absoluteUrl(`/chapters/${chapter.slug}`),
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ];
}
