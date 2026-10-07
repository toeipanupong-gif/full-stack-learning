"use client";

import Link from "next/link";
import { SidebarFrame } from "@/components/shell/sidebar-frame";

const PAGE_CONTAINER = "mx-auto w-full max-w-[70ch] px-5 md:px-8 xl:max-w-5xl xl:px-10";

export function ChapterNav({ chapterTitle, toc }) {
  return (
    <SidebarFrame
      containerClassName={PAGE_CONTAINER}
      title={chapterTitle}
      titleClassName="text-center"
      menuId="chapter-menu"
      navLabel="หัวข้อในบทนี้"
      openLabel="เปิดสารบัญ"
      closeLabel="ปิดสารบัญ"
      leading={
        <Link
          href="/"
          className="inline-flex h-10 shrink-0 items-center rounded-lg border border-rule px-3 font-ui text-sm font-medium text-ink"
        >
          <span className="md:hidden">กลับ</span>
          <span className="hidden md:inline">กลับหน้าแรก</span>
        </Link>
      }
    >
      {(close) => <ChapterMenu toc={toc} onNavigate={close} />}
    </SidebarFrame>
  );
}

function ChapterMenu({ toc, onNavigate }) {
  return (
    <div className="px-3 py-4">
      <p className="px-3 pb-3 font-ui text-lg font-bold text-ink">หัวข้อในบทนี้</p>
      <ul className="space-y-4">
        {toc.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.anchor}`}
              className="block rounded-lg px-3 py-2 font-reading text-base font-semibold leading-snug text-ink hover:bg-quote"
              onClick={onNavigate}
            >
              <span className="font-ui text-xs font-medium text-ink-soft">{section.id}</span>
              <span className="mt-0.5 block">{section.title}</span>
            </a>
            <ul className="mt-1 space-y-0.5">
              {section.topics.map((topic) => (
                <li key={topic.anchor}>
                  <a
                    href={`#${topic.anchor}`}
                    className="block rounded-lg px-3 py-1.5 pl-6 font-reading text-[0.95rem] leading-snug text-ink-soft hover:bg-quote hover:text-ink"
                    onClick={onNavigate}
                  >
                    {topic.title}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
