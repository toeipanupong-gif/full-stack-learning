import fs from "node:fs";
import path from "node:path";
import course from "@/content/chapters/index.json";

export function getCourse() {
  return course;
}

export function chapterIsOpen(chapter) {
  if (chapter?.status !== "ready" || !chapter.slug) return false;

  return fs.existsSync(chapterFile(chapter.slug));
}

export function getChapter(slug) {
  const chapter = getCourse().chapters.find((item) => item.slug === slug);
  if (!chapter || !chapterIsOpen(chapter)) return null;

  return JSON.parse(fs.readFileSync(chapterFile(slug), "utf8"));
}

export function sectionAnchor(sectionId) {
  return `section-${String(sectionId).replace(/\./g, "-")}`;
}

export function getChapterToc(chapter) {
  return (chapter?.sections || []).map((section) => ({
    id: section.id,
    title: section.title,
    anchor: sectionAnchor(section.id),
    topics: (section.blocks || [])
      .filter((block) => block.type === "subheading" && block.anchor)
      .map((block) => ({
        id: block.id,
        title: block.title,
        anchor: block.anchor,
      })),
  }));
}

function chapterFile(slug) {
  return path.join(process.cwd(), "content", "chapters", `${slug}.json`);
}
