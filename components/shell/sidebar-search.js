"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SidebarSearch({ onNavigate, children }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const active = query.trim().length > 0;

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setStatus("idle");
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("search-failed");
        const payload = await response.json();
        setResults(Array.isArray(payload.results) ? payload.results : []);
        setStatus("ready");
      } catch (error) {
        if (error?.name === "AbortError") return;
        setResults([]);
        setStatus("error");
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <>
      <form
        role="search"
        className="sticky top-0 z-10 border-b border-rule bg-paper-raised px-3 py-3"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block">
          <span className="sr-only">ค้นหาเนื้อหา</span>
          <input
            type="search"
            value={query}
            placeholder="ค้นหาเนื้อหา"
            autoComplete="off"
            className="w-full rounded-lg border border-rule bg-paper px-3 py-2 font-ui text-sm text-ink outline-none placeholder:text-ink-soft focus:border-ink/40"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </form>
      {active ? (
        <SearchResults query={query.trim()} results={results} status={status} onNavigate={onNavigate} />
      ) : (
        children
      )}
    </>
  );
}

function SearchResults({ query, results, status, onNavigate }) {
  return (
    <div className="px-3 py-4" aria-live="polite">
      <p className="px-3 pb-3 font-ui text-lg font-bold text-ink">ผลการค้นหา</p>
      {status === "loading" && results.length === 0 ? (
        <p className="px-3 font-ui text-sm text-ink-soft">กำลังค้นหา</p>
      ) : null}
      {status === "error" ? <p className="px-3 font-ui text-sm text-ink-soft">ค้นหาไม่สำเร็จ</p> : null}
      {status === "ready" && results.length === 0 ? (
        <p className="px-3 font-reading text-base text-ink-soft">ไม่พบ “{query}” ในเนื้อหา</p>
      ) : null}
      <ul className="space-y-1">
        {results.map((hit) => (
          <li key={hit.key}>
            <Link
              href={hit.href}
              className="block rounded-lg px-3 py-2 hover:bg-quote"
              onClick={onNavigate}
            >
              <span className="font-ui text-xs text-ink-soft">{resultLabel(hit)}</span>
              <span className="mt-0.5 block font-reading text-base font-semibold text-ink">{hit.title}</span>
              {hit.snippet ? (
                <span className="mt-1 block font-reading text-sm leading-relaxed text-ink-soft">{hit.snippet}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function resultLabel(hit) {
  if (hit.kind === "topic" && hit.sectionTitle) return `บทที่ ${hit.chapterId} · ${hit.sectionTitle}`;
  if (hit.kind !== "chapter") return `บทที่ ${hit.chapterId} · ${hit.chapterTitle}`;
  return `บทที่ ${hit.chapterId}`;
}
