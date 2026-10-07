import Link from "next/link";

export function ChapterCard({ chapter, openable }) {
  const label = (
    <>
      <p className="font-ui text-xs font-medium tracking-wide text-ink-soft">บทที่ {chapter.id}</p>
      <h3 className="mt-2 font-reading text-2xl font-semibold leading-snug text-ink">{chapter.title}</h3>
      {chapter.summary ? (
        <p className="mt-3 font-reading text-base leading-[1.75] text-ink-soft">{chapter.summary}</p>
      ) : null}
      <p className="mt-5 font-ui text-sm font-medium">{openable ? "เข้าเรียน" : "ยังไม่เปิด"}</p>
    </>
  );

  if (!openable) {
    return (
      <article
        aria-disabled="true"
        data-chapter-status="locked"
        className="rounded-2xl border border-dashed border-rule bg-paper px-6 py-6 text-ink-soft"
      >
        {label}
      </article>
    );
  }

  return (
    <Link
      href={`/chapters/${chapter.slug}`}
      data-chapter-status="ready"
      className="block rounded-2xl border border-rule bg-paper-raised px-6 py-6 text-ink transition hover:border-ink/30"
    >
      {label}
    </Link>
  );
}
