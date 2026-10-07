import { getChapter, getCourse } from "@/lib/course";
import { ogContentType, ogSize, ogSubtitle, renderOgImage } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;

export async function generateImageMetadata({ params }) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  const courseTitle = getCourse().courseTitle;

  return [
    {
      id: slug,
      alt: chapter ? `${chapter.title} · ${courseTitle}` : "ไม่พบบทเรียน",
      size: ogSize,
      contentType: ogContentType,
    },
  ];
}

export default async function ChapterOpenGraphImage({ params }) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  const courseTitle = getCourse().courseTitle;

  if (!chapter) {
    return renderOgImage({ kicker: courseTitle, title: "ไม่พบบทเรียน" });
  }

  return renderOgImage({
    kicker: `บทที่ ${chapter.id} · ${courseTitle}`,
    title: chapter.title,
    subtitle: ogSubtitle(chapter.summary),
  });
}
