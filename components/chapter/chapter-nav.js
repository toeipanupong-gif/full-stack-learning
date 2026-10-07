"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { SidebarFrame } from "@/components/shell/sidebar-frame";

const PAGE_CONTAINER = "mx-auto w-full max-w-[70ch] px-5 md:px-8 xl:max-w-5xl xl:px-10";
const READING_LINE = 96;

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
      {(close, open) => <ChapterMenu toc={toc} open={open} onNavigate={close} />}
    </SidebarFrame>
  );
}

function ChapterMenu({ toc, open, onNavigate }) {
  const activeAnchor = useActiveAnchor(toc);
  const rootRef = useRef(null);
  const wasOpenRef = useRef(false);

  useLayoutEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!justOpened || !activeAnchor || !rootRef.current) return;

    const menu = rootRef.current.closest("nav");
    const link = [...rootRef.current.querySelectorAll("[data-toc-anchor]")].find(
      (node) => node.getAttribute("data-toc-anchor") === activeAnchor,
    );
    if (!menu || !link) return;

    const menuRect = menu.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    menu.scrollTop = Math.max(0, menu.scrollTop + linkRect.top - menuRect.top - 12);
  }, [open, activeAnchor]);

  return (
    <div ref={rootRef} className="px-3 py-4">
      <p className="px-3 pb-3 font-ui text-lg font-bold text-ink">หัวข้อในบทนี้</p>
      <ul className="space-y-4">
        {toc.map((section) => (
          <li key={section.id}>
            <TocLink
              anchor={section.anchor}
              active={activeAnchor === section.anchor}
              className="px-3 py-2 font-reading text-base font-semibold leading-snug"
              onNavigate={onNavigate}
            >
              <span className="font-ui text-xs font-medium text-ink-soft">{section.id}</span>
              <span className="mt-0.5 block">{section.title}</span>
            </TocLink>
            <ul className="mt-1 space-y-0.5">
              {section.topics.map((topic) => (
                <li key={topic.anchor}>
                  <TocLink
                    anchor={topic.anchor}
                    active={activeAnchor === topic.anchor}
                    muted
                    className="px-3 py-1.5 pl-6 font-reading text-[0.95rem] leading-snug"
                    onNavigate={onNavigate}
                  >
                    {topic.title}
                  </TocLink>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TocLink({ anchor, active, muted = false, className, onNavigate, children }) {
  const tone = active ? "bg-quote font-semibold text-ink" : muted ? "text-ink-soft hover:text-ink" : "text-ink";

  return (
    <a
      href={`#${anchor}`}
      data-toc-anchor={anchor}
      aria-current={active ? "location" : undefined}
      className={`block rounded-lg hover:bg-quote ${tone} ${className}`}
      onClick={onNavigate}
    >
      {children}
    </a>
  );
}

function useActiveAnchor(toc) {
  const anchors = useMemo(
    () => toc.flatMap((section) => [section.anchor, ...section.topics.map((topic) => topic.anchor)]),
    [toc],
  );
  const [activeAnchor, setActiveAnchor] = useState("");

  useLayoutEffect(() => {
    const elements = anchors.map((id) => document.getElementById(id)).filter(Boolean);

    function update() {
      let current = "";
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= READING_LINE) current = element.id;
      }
      setActiveAnchor((previous) => (previous === current ? previous : current));
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [anchors]);

  return activeAnchor;
}
