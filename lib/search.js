import { chapterIsOpen, getChapter, getCourse, sectionAnchor } from "@/lib/course";

const RESULT_LIMIT = 30;

let cachedEntries;

export function searchCourse(query) {
  const words = normalizeQuery(query);
  if (!words.length) return [];

  const hits = [];
  for (const entry of getSearchEntries()) {
    const haystack = entry.text.toLowerCase();
    if (!words.every((word) => haystack.includes(word))) continue;
    const titleHit = words.every((word) => entry.title.toLowerCase().includes(word));
    hits.push({
      key: entry.key,
      chapterId: entry.chapterId,
      chapterTitle: entry.chapterTitle,
      sectionTitle: entry.sectionTitle,
      title: entry.title,
      kind: entry.kind,
      href: entry.href,
      snippet: makeSnippet(entry.text, words),
      titleHit,
    });
  }

  hits.sort((left, right) => Number(right.titleHit) - Number(left.titleHit));
  return hits.slice(0, RESULT_LIMIT).map(({ titleHit, ...hit }) => hit);
}

function getSearchEntries() {
  if (!cachedEntries) cachedEntries = buildEntries();
  return cachedEntries;
}

function buildEntries() {
  const entries = [];

  for (const item of getCourse().chapters) {
    if (!chapterIsOpen(item)) continue;
    const chapter = getChapter(item.slug);
    if (!chapter) continue;

    entries.push({
      key: `${chapter.slug}:top`,
      chapterId: String(chapter.id),
      chapterTitle: chapter.title,
      sectionTitle: "",
      title: chapter.title,
      kind: "chapter",
      href: `/chapters/${chapter.slug}`,
      text: [chapter.title, chapter.summary, ...blockTexts(chapter.intro)].filter(Boolean).join("\n"),
    });

    for (const section of chapter.sections || []) {
      const anchor = sectionAnchor(section.id);
      let current = startEntry({
        key: `${chapter.slug}:${anchor}`,
        chapter,
        sectionTitle: section.title,
        title: section.title,
        kind: "section",
        href: `/chapters/${chapter.slug}#${anchor}`,
      });

      for (const block of section.blocks || []) {
        if (block.type === "subheading" && block.anchor) {
          entries.push(finishEntry(current));
          current = startEntry({
            key: `${chapter.slug}:${block.anchor}`,
            chapter,
            sectionTitle: section.title,
            title: block.title || section.title,
            kind: "topic",
            href: `/chapters/${chapter.slug}#${block.anchor}`,
          });
          continue;
        }
        const text = blockText(block);
        if (text) current.parts.push(text);
      }

      entries.push(finishEntry(current));
    }
  }

  return entries;
}

function startEntry({ key, chapter, sectionTitle, title, kind, href }) {
  return {
    key,
    chapterId: String(chapter.id),
    chapterTitle: chapter.title,
    sectionTitle,
    title,
    kind,
    href,
    parts: [title],
  };
}

function finishEntry(entry) {
  const { parts, ...rest } = entry;
  return { ...rest, text: parts.filter(Boolean).join("\n") };
}

function blockTexts(blocks) {
  return (blocks || []).map(blockText).filter(Boolean);
}

function blockText(block) {
  if (!block) return "";
  if (block.type === "list") return (block.items || []).filter(Boolean).join("\n");
  if (block.type === "diagram") return (block.lines || []).filter(Boolean).join("\n");
  return [block.title, block.text].filter(Boolean).join("\n");
}

function normalizeQuery(query) {
  return String(query || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
}

function makeSnippet(text, words) {
  const flat = String(text || "").replace(/\s+/g, " ").trim();
  const lower = flat.toLowerCase();
  let index = -1;
  let word = words[0] || "";

  for (const item of words) {
    const found = lower.indexOf(item);
    if (found !== -1 && (index === -1 || found < index)) {
      index = found;
      word = item;
    }
  }

  if (index < 0) return flat.slice(0, 120);
  const start = Math.max(0, index - 36);
  const end = Math.min(flat.length, index + word.length + 80);
  const slice = flat.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${slice}${end < flat.length ? "…" : ""}`;
}
