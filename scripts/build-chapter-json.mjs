/**
 * แปลง learning-1.txt → content/chapters/1.json + index.json
 * node scripts/build-chapter-json.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "learning-1.txt");
const outDir = path.join(root, "content", "chapters");

const FORWARD_CUES = new Set(["ส่วน", "หรือ", "และ", "แต่", "เพราะ", "ถ้า", "เมื่อ", "โดย"]);

const CUE_ONLY = new Set([
  "เช่น",
  "ตัวอย่าง",
  "ตัวอย่างเช่น",
  "หรือ",
  "ส่วน",
  "ได้แก่",
  "คือ",
  "หมายถึง",
  "ที่ควรรู้",
  "ที่พบบ่อย",
  "ได้",
  "ด้วย",
  "และ",
  "แต่",
  "ก็",
  "โดย",
  "จาก",
  "เพราะ",
  "ถ้า",
  "เมื่อ",
  "นี้",
  "นี่",
  "คำว่า",
  "ความหมายคือ",
  "แยกได้ดังนี้",
  "ดังนี้",
  "ได้แก่",
]);

const EXTRA_HEADINGS = new Set([
  "Internet ไม่ใช่ Web",
  "Client–Server Architecture",
  "Client-Server Architecture",
  "HTML Element",
  "HTML Document",
  "Public IP",
  "TCP Three-Way Handshake",
  "Authentication ใน TLS",
  "Session Key",
  "OSI Model",
  "Content Negotiation",
  "SameSite",
  "Session Cookie",
  "ปัญหาของ JWT",
  "Blocked by CORS policy",
  "Reconciliation",
  "DOM Manipulation",
  "Hydration",
  "HTML Validation",
  "Responsive Design",
  "Mobile First",
  "Inheritance",
  "Operator",
  "Truthy และ Falsy",
  "Reference Type",
  "JavaScript กับ TypeScript",
  "Function Declaration Hoisting",
  "Module Scope",
  "Memory Leak",
  "Closure กับ Memory",
  "Execution Flow แบบรวม",
  "Flow Control",
  "Congestion Control",
  "Symmetric Encryption",
  "Asymmetric Encryption",
  "Event Listener",
  "Stacking Context",
  "HttpOnly Cookie",
  "Session Hijacking",
  "CSS Performance เบื้องต้น",
  "Responsive กับ Accessibility",
  "Domain และ Path ของ Cookie",
  "ในความหมายของเครื่อง",
  "ในความหมายของ Software",
  "หลักที่ควรจำจากบทนี้",
]);

const HTTP_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);

function isProse(t) {
  if (!t) return false;
  if (/^1\.\d+\s/.test(t)) return false;
  if (t.length >= 56 && /[ก-๙]/.test(t)) return true;
  if (/หมายถึง|ย่อมาจาก|แปลตรงตัว/.test(t)) return true;
  if (/(ครับ|ค่ะ)/.test(t)) return true;
  if (/สำคัญ/.test(t) && t.length > 8) return true;
  if (/^ไม่/.test(t) && t.length > 8 && !/^ไม่\s*$/.test(t)) return true;
  if (/คือ/.test(t) && !/คืออะไร/.test(t) && /[ก-๙]/.test(t)) return true;
  if (/^(ดังนั้น|เพราะ|แต่|ถ้า|เมื่อ|โดยทั่วไป|สมมติ|แล้ว|อย่างไรก็)/.test(t) && /[ก-๙]/.test(t)) return true;
  if (/[ก-๙]/.test(t) && /(เช่น|ว่า)\s*$/.test(t) && t.length < 42) return true;
  if (/[ก-๙]/.test(t) && /:\s*$/.test(t) && t.length < 52) return true;
  if (/จึง|แสดงผล|ทำหน้าที่|ทำงาน|สามารถ/.test(t) && t.length > 16 && /[ก-๙]/.test(t)) return true;
  const particles = t.match(
    /เป็น|ได้|จะ|ไม่|และ|หรือ|เพื่อ|ถ้า|เมื่อ|เพราะ|แต่|แล้ว|ให้|กับ|จาก|โดย|ซึ่ง|ยัง|ต้อง|เรา|อย่าง|สามารถ|ใช้|มี|จึง/g
  );
  const n = particles ? particles.length : 0;
  if (n >= 2 && t.length > 16) return true;
  if (n >= 1 && t.length > 34) return true;
  if (/[.!?]$/.test(t) && t.length > 22 && /[ก-๙]/.test(t)) return true;
  return false;
}

function isQuestionHeading(t) {
  if (t.length > 46) return false;
  if (/^[-•\d]/.test(t)) return false;
  if (/หมายถึง|ย่อมาจาก/.test(t)) return false;
  if (/^(ใช้|คุณ|Server ต้อง)/.test(t)) return false;
  if (/อะไร$|อย่างไร$|ทำอะไร$/.test(t)) return true;
  return false;
}

function isExampleCue(prev) {
  if (!prev) return false;
  if (/(เช่น|ตัวอย่าง|อาจตอบ|อาจได้)\s*$/.test(prev)) return true;
  if (/:\s*$/.test(prev) && prev.length < 42) return true;
  return false;
}

function isStatusHeading(t, next) {
  if (!/^[1-5]\d{2}\s+[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*$/.test(t)) return false;
  if (!next || /^[1-5]\d{2}\b/.test(next)) return false;
  if (/^(ใช้|หมายถึง|เป็น |มัก|Request|Route|หา |ชื่อ|JSON|Framework)/.test(next)) return true;
  if (isProse(next)) return true;
  return false;
}

function isCodeFragment(t) {
  if (/^[})\]]+;?$/.test(t)) return true;
  if (/^<\?php\b/.test(t)) return true;
  if (/=>/.test(t) && !/[ก-๙]/.test(t)) return true;
  if (/\{\s*$/.test(t) && /[()[\].]/.test(t) && !/[ก-๙]/.test(t)) return true;
  if (/^[\w$.]+(\.[\w$]+)*\(/.test(t) && !/[ก-๙]/.test(t)) return true;
  if (/;\s*$/.test(t) && !/[ก-๙]/.test(t) && /[=(){}[\]]/.test(t)) return true;
  return false;
}

function isSubheading(t, next, prev) {
  if (!t || t.length > 72) return false;
  if (/^1\.\d+\s/.test(t)) return false;
  if (/^\d+\.\s/.test(t)) return false;
  if (/[“"][^”"]*คืออะไร/.test(t)) return false;
  if (isExampleCue(prev)) return false;
  if (prev && /ย่อมาจาก/.test(prev)) return false;
  if (isArrowLine(prev) || isArrowLine(next)) return false;
  if (/[{}<>[\]]/.test(t) && !/อย่างไร/.test(t)) return false;
  if (/คืออะไร/.test(t)) return true;
  if (/^ทำไม/.test(t) && t.length <= 60) return true;
  if (EXTRA_HEADINGS.has(t)) return true;
  if (/^[1-5]xx\s[—–-]/.test(t)) return true;
  if (/^Layer\s+\d+\s[—–-]/.test(t)) return true;
  if (/^ปัญหาของ/.test(t) && t.length <= 40) return true;
  if (isQuestionHeading(t)) return true;
  if (HTTP_METHODS.has(t) && next && /^ใช้/.test(next)) return true;
  if (
    /^[A-Z][A-Za-z0-9.+#][A-Za-z0-9 .+#–—-]{5,46}$/.test(t) &&
    / /.test(t) &&
    !/\//.test(t) &&
    next &&
    /ย่อมาจาก|หมายถึง|^คือ/.test(next) &&
    prev &&
    prev.length >= 28 &&
    !/\b(the|and|with|from|this|that|for|to|of|is|are)\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

function isAsciiArt(t) {
  if (!t || /[ก-๙]/.test(t)) return false;
  if (/\|/.test(t) && /-{2,}|>{2,}|<{2,}/.test(t)) return true;
  if (/^[|.\-+<>\s]+$/.test(t) && /[|<>]/.test(t)) return true;
  return false;
}

function isArrowLine(t) {
  if (!t) return false;
  if (t.length > 60 && isProse(t)) return false;
  if (isAsciiArt(t)) return true;
  if (/[↓↑]/.test(t)) return true;
  if (/^[└├│┌┐┘─┬┴╭╮╯╰→←\s|]+$/.test(t)) return true;
  if (/^(→|←)\s+\S/.test(t) && t.length < 40) return true;
  if (/[└├│┌┐]/.test(t) && t.length < 40) return true;
  return false;
}

function isDefiniteCode(raw) {
  const t = raw.trim();
  if (!t) return false;
  if (isArrowLine(t)) return false;
  if (/^\s+[↓↑←→└├│]/.test(raw)) return false;
  const indented = /^\s{2,}\S/.test(raw);
  if (indented && !isProse(t) && !isArrowLine(t)) return true;
  if (/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\//.test(t)) return true;
  if (/^HTTP\/\d+(\.\d+)?\s+\d{3}\b/.test(t)) return true;
  if (/^HTTP\/\d+(\.\d+)?$/.test(t)) return true;
  if (/^<\/?[a-zA-Z!][^>\n]*>?/.test(t)) return true;
  if (/^(function|const|let|var|class|import|export|return|async|await|if|else|for|while|switch|case|try|catch|throw|new)\b/.test(t))
    return true;
  if (/^[{}\[\]();,]$/.test(t)) return true;
  if (/^"[^"]*"\s*:/.test(t)) return true;
  if (/^\/\/|\/\*/.test(t)) return true;
  if (/^[.#]?[a-zA-Z][\w-]*\s*\{$/.test(t)) return true;
  if (/^@[a-z-]+/.test(t) && t.length < 40) return true;
  if (/^[a-zA-Z_][\w.-]*\s*:\s*\S/.test(t) && t.length < 90 && !/[ก-๙]/.test(t) && !/หมายถึง|ย่อมาจาก/.test(t))
    return true;
  if (/^\$\s?\w+/.test(t)) return true;
  if (/^npm\s|^node\s|^curl\s|^ping\s|^ssh\s/.test(t)) return true;
  return false;
}

function looksLikeUrlToken(t) {
  return (
    /^https?:\/\/\S+$/.test(t) ||
    /^https?:\/\/$/.test(t) ||
    /^www\.[a-z0-9.-]+$/i.test(t) ||
    /^\/[a-z0-9?=&_./{}:-]+$/i.test(t)
  );
}

function classify(raw, next, prev) {
  const t = raw.trim();
  if (isSubheading(t, next, prev)) return "subheading";
  if (!isExampleCue(prev) && isStatusHeading(t, next)) return "subheading";
  if (isArrowLine(t)) return "diagram";
  if (isDefiniteCode(raw) || isCodeFragment(t)) return "code";
  if (isProse(t)) return /[“”]/.test(t) ? "quote" : "paragraph";
  if (CUE_ONLY.has(t.replace(/:$/, ""))) return "cue";
  if (looksLikeUrlToken(t)) return "code";
  return "list";
}

function expandContext(tokens) {
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === "subheading" || t.type === "code") continue;
    const prev = tokens[i - 1];
    const next = tokens[i + 1];
    const prevDiagram = prev && prev.type === "diagram";
    const nextDiagram = next && next.type === "diagram";
    const gluedToPrev = prevDiagram && t.blankBefore === 0;
    const gluedToNext = next && next.type === "diagram" && next.blankBefore === 0;
    if (
      (gluedToPrev || gluedToNext) &&
      t.text.length < 64 &&
      t.type !== "quote" &&
      !isProse(t.text) &&
      !/^ขั้นที่/.test(t.text)
    ) {
      t.type = "diagram";
    }
  }

  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type === "subheading" || t.type === "diagram" || t.type === "quote") continue;
      if (isCodeFragment(t.text)) {
        t.type = "code";
        continue;
      }
      const prev = tokens[i - 1];
      const next = tokens[i + 1];
      if (
        prev &&
        next &&
        prev.type === "code" &&
        next.type === "code" &&
        !isProse(t.text) &&
        t.text.length < 80
      ) {
        t.type = "code";
      }
    }
  }
}

function slugify(title) {
  let s = title
    .replace(/^\d+\.\s*/, "")
    .replace(/^แล้ว\s+/, "")
    .replace(/คืออะไร.*/u, "")
    .trim()
    .toLowerCase();
  s = s.replace(/[“”"'’]/g, "");
  s = s.replace(/\s+/g, "-");
  s = s.replace(/[^a-z0-9ก-๙-]+/gi, "");
  s = s.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return s || "topic";
}

function uniqueAnchor(base, used) {
  let anchor = base;
  let n = 2;
  while (used.has(anchor)) {
    anchor = `${base}-${n}`;
    n += 1;
  }
  used.add(anchor);
  return anchor;
}

function detectLang(text) {
  if (/<\/?[a-zA-Z!]/.test(text)) return "html";
  if (/\b(function|const|let|var|=>|console\.|class\s)/.test(text)) return "javascript";
  if (/^\s*(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|HTTP\/)/m.test(text)) return "http";
  if (/<\?php|->/.test(text)) return "php";
  if (/^\s*(npm|node|curl|ping|ssh|\$)\b/m.test(text)) return "shell";
  if (/[{[]/.test(text) && /["']/.test(text)) return "json";
  if (/[{}]/.test(text) && /(px|rem|em|flex|grid|color|margin|padding|font-)/.test(text)) return "css";
  if (/{\s*$/m.test(text) && /:\s*\S+;/.test(text)) return "css";
  return "text";
}

function dedent(lines) {
  const indents = lines
    .filter((l) => l.trim())
    .map((l) => l.match(/^\s*/)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => (l.trim() ? l.slice(min) : "")).join("\n").replace(/\n+$/g, "");
}

function joinParagraph(parts) {
  return parts
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function blocksFromTokens(tokens, sectionId, usedAnchors) {
  const blocks = [];
  let i = 0;
  let pendingCue = "";

  function takeCue(text) {
    if (!pendingCue) return text;
    const merged = `${pendingCue} ${text}`.replace(/\s+/g, " ").trim();
    pendingCue = "";
    return merged;
  }

  function parkCue() {
    if (!pendingCue) return;
    const prev = blocks[blocks.length - 1];
    if (prev && prev.type === "paragraph") prev.text = `${prev.text} ${pendingCue}`.trim();
    else if (prev && prev.type === "list") prev.items.push(pendingCue);
    else blocks.push({ type: "paragraph", text: pendingCue });
    pendingCue = "";
  }

  function pushParagraph(parts) {
    const text = joinParagraph(parts);
    if (text) blocks.push({ type: "paragraph", text });
  }

  while (i < tokens.length) {
    const tok = tokens[i];

    if (tok.type === "cue") {
      const word = tok.text.replace(/:$/, "");
      if (FORWARD_CUES.has(word)) {
        pendingCue = pendingCue ? `${pendingCue} ${tok.text}` : tok.text;
      } else {
        const prev = blocks[blocks.length - 1];
        if (prev && prev.type === "paragraph") {
          prev.text = `${prev.text} ${tok.text}`.replace(/\s+/g, " ").trim();
        } else {
          pendingCue = pendingCue ? `${pendingCue} ${tok.text}` : tok.text;
        }
      }
      i += 1;
      continue;
    }

    if (tok.type === "subheading") {
      parkCue();
      const slug = slugify(tok.text);
      const anchor = uniqueAnchor(`${sectionId.replace(".", "-")}-${slug}`, usedAnchors);
      blocks.push({
        type: "subheading",
        id: anchor,
        anchor,
        title: tok.text,
      });
      i += 1;
      continue;
    }

    if (tok.type === "diagram") {
      parkCue();
      const lines = [];
      while (i < tokens.length && tokens[i].type === "diagram") {
        if (lines.length && tokens[i].blankBefore > 1) break;
        lines.push(tokens[i].text.trim());
        i += 1;
      }
      blocks.push({ type: "diagram", lines });
      continue;
    }

    if (tok.type === "code") {
      parkCue();
      const rawLines = [];
      while (i < tokens.length && tokens[i].type === "code") {
        if (rawLines.length && tokens[i].blankBefore > 1) break;
        if (rawLines.length && tokens[i].blankBefore === 1) rawLines.push("");
        rawLines.push(tokens[i].raw.replace(/\s+$/g, ""));
        i += 1;
      }
      const text = dedent(rawLines);
      blocks.push({ type: "code", language: detectLang(text), text });
      continue;
    }

    if (tok.type === "list") {
      const items = [];
      while (i < tokens.length && tokens[i].type === "list") {
        items.push(tokens[i].text.trim());
        i += 1;
      }
      parkCue();
      blocks.push({ type: "list", items });
      continue;
    }

    if (tok.type === "quote" || tok.type === "paragraph") {
      const kind = tok.type;
      const parts = [tok.text];
      i += 1;
      while (i < tokens.length && tokens[i].type === kind && tokens[i].blankBefore === 0) {
        parts.push(tokens[i].text);
        i += 1;
      }
      const text = takeCue(joinParagraph(parts));
      if (text) blocks.push({ type: kind, text });
      continue;
    }

    i += 1;
  }

  return mergeLoose(blocks);
}

function mergeLoose(blocks) {
  const out = [];
  for (const block of blocks) {
    const prev = out[out.length - 1];
    if (block.type === "paragraph" && CUE_ONLY.has(block.text.replace(/:$/, "")) && prev && prev.type === "paragraph") {
      prev.text = `${prev.text} ${block.text}`.replace(/\s+/g, " ").trim();
      continue;
    }
    if (block.type === "list" && prev && prev.type === "list") {
      prev.items.push(...block.items);
      continue;
    }
    if (block.type === "diagram" && prev && prev.type === "diagram") {
      prev.lines.push(...block.lines);
      continue;
    }
    out.push(block);
  }
  return out;
}

function neighborText(lines, index, dir) {
  for (let j = index + dir; j >= 0 && j < lines.length; j += dir) {
    if (lines[j].trim()) return lines[j].trim();
  }
  return "";
}

function tokensFromLines(lines) {
  const tokens = [];
  let blank = 0;
  let first = true;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) {
      blank += 1;
      continue;
    }
    const text = raw.trim();
    const next = neighborText(lines, i, 1);
    const prev = neighborText(lines, i, -1);
    const type = classify(raw, next, prev);
    tokens.push({
      raw,
      text,
      type,
      blankBefore: first ? 0 : blank,
    });
    first = false;
    blank = 0;
  }
  expandContext(tokens);
  return tokens;
}

function splitSections(lines) {
  const sections = [];
  let intro = [];
  let current = null;
  for (const line of lines) {
    const m = line.match(/^1\.(\d+)\s+(.+)\s*$/);
    if (m && line.trim().startsWith("1.")) {
      current = { id: `1.${m[1]}`, title: m[2].trim(), lines: [] };
      sections.push(current);
      continue;
    }
    if (!current) intro.push(line);
    else current.lines.push(line);
  }
  return { intro, sections };
}

function summaryFromIntro(introLines) {
  const text = introLines.map((l) => l.trim()).filter(Boolean);
  const goal = text.find((l) => l.startsWith("เป้าหมาย"));
  if (goal) {
    const base = goal.replace(/^เป้าหมายของข้อ 1 คือ\s*/, "").replace(/\s+/g, " ").trim();
    return `${base} ผู้ใช้เปิด Browser แล้วข้อมูลเดินทางผ่าน DNS, Internet, HTTP ไปถึง Server และ Database จน Browser แสดงผล`;
  }
  return text.slice(0, 2).join(" ");
}

function buildChapter(lines) {
  const { intro, sections } = splitSections(lines);
  const usedAnchors = new Set();
  const introTokens = tokensFromLines(intro);
  const builtSections = sections.map((section) => ({
    id: section.id,
    title: section.title,
    blocks: blocksFromTokens(tokensFromLines(section.lines), section.id, usedAnchors),
  }));

  const titleLine = intro.map((l) => l.trim()).find((l) => /^1:\s*/.test(l)) || "";
  const title = titleLine.replace(/^1:\s*/, "").split(/\s+ก่อน/)[0].trim() || "Web & Programming Fundamentals";

  return {
    id: "1",
    slug: "1",
    title,
    summary: summaryFromIntro(intro),
    intro: blocksFromTokens(introTokens, "1-0", usedAnchors),
    sections: builtSections,
  };
}

function countBlocks(blocks, acc) {
  for (const b of blocks) acc[b.type] = (acc[b.type] || 0) + 1;
}

function squash(s) {
  return s.replace(/\s+/g, "");
}

function blockText(block) {
  if (block.type === "list") return block.items.join("\n");
  if (block.type === "diagram") return block.lines.join("\n");
  if (block.type === "subheading") return block.title;
  return block.text;
}

function assertCoverage(lines, chapter) {
  const skip = new Set(
    lines.map((l) => l.trim()).filter((l) => /^1\.\d+\s/.test(l))
  );
  const expected = squash(lines.map((l) => l.trim()).filter((l) => l && !skip.has(l)).join("\n"));
  const parts = [];
  for (const b of chapter.intro) parts.push(blockText(b));
  for (const s of chapter.sections) {
    for (const b of s.blocks) parts.push(blockText(b));
  }
  const got = squash(parts.join("\n"));
  let index = 0;
  const limit = Math.min(expected.length, got.length);
  while (index < limit && expected[index] === got[index]) index += 1;
  return {
    ok: expected === got,
    expected: expected.length,
    got: got.length,
    mismatchAt: expected === got ? null : index,
    expectedSlice: expected.slice(index, index + 80),
    gotSlice: got.slice(index, index + 80),
  };
}

function main() {
  const raw = fs.readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\n/);
  const chapter = buildChapter(lines);
  const index = {
    courseTitle: "Full Stack Developer",
    chapters: [
      {
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        summary: chapter.summary,
        status: "ready",
      },
    ],
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "1.json"), `${JSON.stringify(chapter, null, 2)}\n`);
  fs.writeFileSync(path.join(outDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`);

  const acc = {};
  countBlocks(chapter.intro, acc);
  for (const s of chapter.sections) countBlocks(s.blocks, acc);
  const coverage = assertCoverage(lines, chapter);
  const headings = [];
  for (const s of chapter.sections) {
    const hs = s.blocks.filter((b) => b.type === "subheading");
    headings.push({ id: s.id, title: s.title, count: hs.length, sample: hs.slice(0, 8).map((h) => h.title) });
  }
  console.log(JSON.stringify({ blocks: acc, coverage, sections: headings }, null, 2));
}

main();
