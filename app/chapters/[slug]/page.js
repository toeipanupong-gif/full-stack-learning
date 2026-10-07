import { ChapterNav } from "@/components/chapter/chapter-nav";
import { ContentBlocks } from "@/components/reading/content-blocks";
import { ReadingColumn } from "@/components/reading/reading-column";
import { JsonLd } from "@/components/seo/json-ld";
import { chapterIsOpen, getChapter, getChapterToc, getCourse, sectionAnchor } from "@/lib/course";
import { buildPageMetadata, chapterJsonLd } from "@/lib/seo";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourse()
    .chapters.filter((chapter) => chapterIsOpen(chapter))
    .map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) {
    return {
      title: "ไม่พบบทเรียน",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    title: chapter.title,
    description: chapter.summary,
    path: `/chapters/${chapter.slug}`,
    type: "article",
  });
}

export default async function ChapterPage({ params }) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const toc = getChapterToc(chapter);

  return (
    <>
      <JsonLd data={chapterJsonLd(chapter)} />
      <ChapterNav chapterTitle={chapter.title} toc={toc} />
      <main>
        <ReadingColumn>
          <p className="font-ui text-sm text-ink-soft">บทที่ {chapter.id}</p>
          <h1 className="mt-2 font-reading text-[2rem] font-semibold leading-tight text-ink sm:text-4xl">
            {chapter.title}
          </h1>
          {chapter.summary ? (
            <p className="mt-4 font-reading text-lg leading-[1.75] text-ink-soft">{chapter.summary}</p>
          ) : null}
          {chapter.intro?.length ? (
            <div className="mt-8">
              <ContentBlocks blocks={chapter.intro} />
            </div>
          ) : null}

          {chapter.sections.map((section) => (
            <section key={section.id} className="mt-14">
              <h2
                id={sectionAnchor(section.id)}
                className="scroll-mt-24 font-reading text-[1.7rem] font-semibold leading-snug text-ink md:text-[1.85rem] xl:text-[2rem]"
              >
                <span className="mr-[0.35em]">{section.id}</span>
                {section.title}
              </h2>
              <div className="mt-6">
                <ContentBlocks blocks={section.blocks} />
              </div>
            </section>
          ))}
        </ReadingColumn>
      </main>
    </>
  );
}
