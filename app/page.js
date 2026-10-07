import { ChapterCard } from "@/components/home/chapter-card";
import { SiteHeader } from "@/components/home/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { chapterIsOpen, getCourse } from "@/lib/course";
import { buildPageMetadata, courseName, homeJsonLd, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: courseName(),
  description: SITE_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  const course = getCourse();
  const chapters = course.chapters.map((chapter) => ({
    ...chapter,
    openable: chapterIsOpen(chapter),
  }));

  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <SiteHeader
        courseTitle={course.courseTitle}
        chapters={chapters.map(({ id, slug, title, openable }) => ({ id, slug, title, openable }))}
      />
      <main className="mx-auto w-full max-w-[70ch] px-5 py-10 md:px-8 md:py-14 xl:max-w-5xl xl:px-10 xl:py-16">
        <p className="font-ui text-sm text-ink-soft">คอร์ส</p>
        <h1 className="mt-2 font-reading text-[2rem] font-semibold leading-tight text-ink sm:text-4xl">
          {course.courseTitle}
        </h1>
        <p className="mt-4 font-reading text-lg leading-[1.75] text-ink-soft">
          อ่านทีละบท เริ่มจากพื้นฐานของเว็บและการเขียนโปรแกรม จนอธิบายได้ว่าเว็บแอปหนึ่งระบบทำงานอย่างไร
          ตั้งแต่ผู้ใช้เปิดเบราว์เซอร์ จนข้อมูลถึงเซิร์ฟเวอร์และฐานข้อมูล
        </p>

        <h2 className="mt-14 font-reading text-2xl font-semibold text-ink">บทเรียน</h2>
        <ul className="mt-6 space-y-4">
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              <ChapterCard chapter={chapter} openable={chapter.openable} />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
