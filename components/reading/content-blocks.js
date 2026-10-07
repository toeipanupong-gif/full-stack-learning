import { CodeBlock, Diagram, ItemList, Paragraph, Quote, Subheading } from "@/components/reading/blocks";

function isQuotedDefinition(text) {
  const value = String(text || "").trim();
  if (!value || value.length > 220 || value.includes("\n")) return false;
  if (!/[“”]/.test(value)) return false;
  if (/[{}<>]|=>|\b(function|const|let|var)\b/.test(value)) return false;
  return /(หมายถึง|แปลตรงตัว|แปลว่า)/.test(value);
}

function presentBlock(block) {
  if ((block.type === "paragraph" || block.type === "code") && isQuotedDefinition(block.text)) {
    return [{ type: "quote", text: block.text.trim() }];
  }

  if (block.type === "list") {
    const items = [];
    const quotes = [];
    for (const item of block.items || []) {
      if (isQuotedDefinition(item)) quotes.push(item);
      else items.push(item);
    }
    const next = [];
    if (items.length) next.push({ type: "list", items });
    for (const text of quotes) next.push({ type: "quote", text });
    return next;
  }

  return [block];
}

export function ContentBlocks({ blocks }) {
  const prepared = (blocks || []).flatMap(presentBlock);
  const nodes = [];
  let index = 0;

  while (index < prepared.length) {
    const block = prepared[index];

    if (block.type === "paragraph") {
      const start = index;
      const group = [];
      while (index < prepared.length && prepared[index].type === "paragraph") {
        group.push(prepared[index]);
        index += 1;
      }
      nodes.push(
        <div key={`prose-${start}`} className="space-y-3">
          {group.map((item, itemIndex) => (
            <Paragraph key={`${start}-${itemIndex}`} continued={itemIndex > 0}>
              {item.text}
            </Paragraph>
          ))}
        </div>,
      );
      continue;
    }

    const key = block.id || `${block.type}-${index}`;
    if (block.type === "subheading") {
      nodes.push(
        <Subheading key={key} id={block.anchor}>
          {block.title}
        </Subheading>,
      );
    } else if (block.type === "quote") {
      nodes.push(<Quote key={key}>{block.text}</Quote>);
    } else if (block.type === "code") {
      nodes.push(<CodeBlock key={key}>{block.text}</CodeBlock>);
    } else if (block.type === "diagram") {
      nodes.push(<Diagram key={key} lines={block.lines || []} />);
    } else if (block.type === "list") {
      nodes.push(<ItemList key={key} items={block.items || []} />);
    }
    index += 1;
  }

  return <div className="space-y-7">{nodes}</div>;
}
