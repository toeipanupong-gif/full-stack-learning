import { chapterIsOpen, getCourse } from "@/lib/course";

export const SITE_DESCRIPTION =
  "อ่านทีละบท ตั้งแต่พื้นฐานเว็บและการเขียนโปรแกรม จนอธิบายได้ว่าเว็บแอปทำงานอย่างไร ตั้งแต่เบราว์เซอร์ถึงเซิร์ฟเวอร์และฐานข้อมูล";

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (fromEnv || "http://localhost:3000").replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata({ title, description, path, type = "website", absoluteTitle = false }) {
  const name = courseName();
  const desc = metaDescription(description);
  const fullTitle = absoluteTitle ? title : `${title} · ${name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: "th_TH",
      siteName: name,
      title: fullTitle,
      description: desc,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
    },
  };
}

export function courseName() {
  return getCourse().courseTitle;
}

export function openChapters() {
  return getCourse().chapters.filter((chapter) => chapterIsOpen(chapter));
}

export function metaDescription(text, fallback = SITE_DESCRIPTION) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  const value = clean || fallback;
  if (value.length <= 160) return value;
  return `${value.slice(0, 159).trimEnd()}…`;
}

export function homeJsonLd() {
  const name = courseName();
  const url = absoluteUrl("/");
  const chapters = openChapters();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        name,
        url,
        description: SITE_DESCRIPTION,
        inLanguage: "th",
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name,
        description: SITE_DESCRIPTION,
        isPartOf: { "@id": `${url}#website` },
        inLanguage: "th",
      },
      {
        "@type": "Course",
        "@id": `${url}#course`,
        name,
        description: SITE_DESCRIPTION,
        url,
        inLanguage: "th",
        provider: { "@type": "Organization", name },
        hasPart: chapters.map((chapter) => ({
          "@type": "LearningResource",
          name: chapter.title,
          description: chapter.summary,
          url: absoluteUrl(`/chapters/${chapter.slug}`),
          learningResourceType: "Lesson",
        })),
      },
      {
        "@type": "ItemList",
        itemListElement: chapters.map((chapter, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: chapter.title,
          url: absoluteUrl(`/chapters/${chapter.slug}`),
        })),
      },
    ],
  };
}

export function chapterJsonLd(chapter) {
  const name = courseName();
  const pageUrl = absoluteUrl(`/chapters/${chapter.slug}`);
  const home = absoluteUrl("/");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${pageUrl}#lesson`,
        name: chapter.title,
        headline: chapter.title,
        description: chapter.summary || SITE_DESCRIPTION,
        url: pageUrl,
        inLanguage: "th",
        learningResourceType: "Lesson",
        isPartOf: { "@id": `${home}#course` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name, item: home },
          {
            "@type": "ListItem",
            position: 2,
            name: `บทที่ ${chapter.id} ${chapter.title}`,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${chapter.title} · ${name}`,
        description: metaDescription(chapter.summary),
        isPartOf: { "@id": `${home}#website` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        inLanguage: "th",
      },
    ],
  };
}
