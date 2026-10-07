import { absoluteUrl } from "@/lib/seo";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/search"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
