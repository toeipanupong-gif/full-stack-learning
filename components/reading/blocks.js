export function Paragraph({ children, continued = false }) {
  return (
    <p
      className={`font-reading text-[1.0625rem] leading-[1.9] text-ink sm:text-[1.125rem] ${
        continued ? "indent-[1.5em]" : ""
      }`}
    >
      {children}
    </p>
  );
}

export function Subheading({ id, children }) {
  return (
    <h3
      id={id}
      className="scroll-mt-24 pt-2 font-reading text-[1.45rem] font-semibold leading-snug text-ink md:text-[1.65rem] xl:scroll-mt-8 xl:text-[1.85rem]"
    >
      {children}
    </h3>
  );
}

export function Quote({ children }) {
  return (
    <blockquote className="border-l-2 border-ink/35 pl-5 font-reading text-[1.2rem] leading-[1.8] text-ink italic sm:text-[1.28rem]">
      {children}
    </blockquote>
  );
}

export function CodeBlock({ children }) {
  return (
    <pre className="max-w-full overflow-x-auto rounded-xl bg-code-bg px-4 py-4 font-code text-[0.82rem] leading-relaxed text-code-fg md:px-5 md:text-[0.9rem]">
      <code>{children}</code>
    </pre>
  );
}

function isArrowOnly(line) {
  return /^[↓↑]+$/.test(line.trim());
}

function isSideNote(line) {
  return /^[→←]/.test(line.trim());
}

function isAsciiArt(line) {
  return /[|┌┐└┘├┤┬┴╭╮╯╰]/.test(line) || /-{3,}|={3,}|>{2,}/.test(line);
}

export function Diagram({ lines }) {
  const rows = lines || [];
  const ascii = rows.some(isAsciiArt);

  return (
    <figure
      className={`mx-auto flex w-full max-w-md flex-col items-center text-center text-diagram ${
        ascii ? "overflow-x-auto font-code text-[0.9rem] leading-relaxed" : "font-reading text-[1.05rem] leading-snug"
      }`}
    >
      {rows.map((line, index) => {
        const text = line.trim();
        if (!text) return null;

        if (isArrowOnly(text)) {
          return (
            <div key={`${index}-${text}`} className="py-1 text-xl leading-none text-ink-soft" aria-hidden="true">
              {text}
            </div>
          );
        }

        if (isSideNote(text)) {
          return (
            <div key={`${index}-${text}`} className="pb-2 text-[0.98rem] leading-relaxed text-ink-soft">
              {text}
            </div>
          );
        }

        return (
          <div key={`${index}-${text}`} className={ascii ? undefined : "font-medium"}>
            {text}
          </div>
        );
      })}
    </figure>
  );
}

export function ItemList({ items }) {
  return (
    <ul className="list-disc space-y-1.5 pl-6 font-reading text-[1.0625rem] leading-[1.75] text-ink marker:text-ink-soft sm:text-[1.125rem]">
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}
