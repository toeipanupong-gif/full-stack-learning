"use client";

import Link from "next/link";
import { SidebarFrame } from "@/components/shell/sidebar-frame";

const PAGE_CONTAINER = "mx-auto w-full max-w-[70ch] px-5 md:px-8 xl:max-w-5xl xl:px-10";

export function SiteHeader({ courseTitle, chapters }) {
  return (
    <SidebarFrame
      containerClassName={PAGE_CONTAINER}
      title={courseTitle}
      titleClassName="tracking-wide"
      menuId="course-menu"
      navLabel="รายการบท"
      openLabel="เปิดเมนูบทเรียน"
      closeLabel="ปิดเมนู"
    >
      {(close) => (
        <div className="px-3 py-4">
          <p className="px-3 pb-3 font-ui text-lg font-bold text-ink">บทเรียน</p>
          <ul className="space-y-1">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <ChapterLink chapter={chapter} onNavigate={close} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </SidebarFrame>
  );
}

function ChapterLink({ chapter, onNavigate }) {
  if (!chapter.openable) {
    return (
      <div className="rounded-lg px-3 py-2" aria-disabled="true" data-chapter-status="locked">
        <span className="font-ui text-xs text-ink-soft">บทที่ {chapter.id}</span>
        <span className="mt-0.5 block font-reading text-base text-ink-soft">{chapter.title}</span>
        <span className="mt-1 inline-block font-ui text-xs text-ink-soft">ยังไม่เปิด</span>
      </div>
    );
  }

  return (
    <Link
      href={`/chapters/${chapter.slug}`}
      data-chapter-status="ready"
      className="block rounded-lg px-3 py-2 hover:bg-quote"
      onClick={onNavigate}
    >
      <span className="font-ui text-xs text-ink-soft">บทที่ {chapter.id}</span>
      <span className="mt-0.5 block font-reading text-base font-semibold text-ink">{chapter.title}</span>
    </Link>
  );
}
