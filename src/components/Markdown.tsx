import type { ReactNode } from "react"
import { publicUrl } from "../publicUrl.ts"

function resolveHref(href: string): string {
  if (href.startsWith("/") && !href.startsWith("//")) return publicUrl(href)
  return href
}

function inline(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))/g
  const nodes: ReactNode[] = []
  let last = 0
  let index = 0
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > last) nodes.push(text.slice(last, start))
    const token = match[0]
    const key = `${keyPrefix}-${index}`
    if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>)
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    } else {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token)
      if (link) {
        const href = resolveHref(link[2])
        const external = href.startsWith("http://") || href.startsWith("https://")
        nodes.push(
          <a
            key={key}
            href={href}
            {...(external ? { rel: "noreferrer", target: "_blank" } : {})}
          >
            {link[1]}
          </a>,
        )
      }
    }
    last = start + token.length
    index += 1
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

type Block =
  | { type: "h"; level: number; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; text: string }
  | { type: "quote"; text: string }
  | { type: "hr" }

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === "") {
      i += 1
      continue
    }
    if (line.startsWith("```")) {
      const body: string[] = []
      i += 1
      while (i < lines.length && !lines[i].startsWith("```")) {
        body.push(lines[i])
        i += 1
      }
      i += 1
      blocks.push({ type: "code", text: body.join("\n") })
      continue
    }
    const heading = /^(#{1,3}) (.+)$/.exec(line)
    if (heading) {
      blocks.push({ type: "h", level: heading[1].length, text: heading[2] })
      i += 1
      continue
    }
    if (line.trim() === "---") {
      blocks.push({ type: "hr" })
      i += 1
      continue
    }
    if (line.startsWith("> ")) {
      const body = [line.slice(2)]
      i += 1
      while (i < lines.length && lines[i].startsWith("> ")) {
        body.push(lines[i].slice(2))
        i += 1
      }
      blocks.push({ type: "quote", text: body.join(" ") })
      continue
    }
    if (line.startsWith("- ")) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2))
        i += 1
      }
      blocks.push({ type: "ul", items })
      continue
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""))
        i += 1
      }
      blocks.push({ type: "ol", items })
      continue
    }
    const para = [line]
    i += 1
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,3} |- |\d+\. |> |```|---)/.test(lines[i])) {
      para.push(lines[i])
      i += 1
    }
    blocks.push({ type: "p", text: para.join(" ") })
  }
  return blocks
}

export function Markdown({ source }: { source: string }) {
  const blocks = parseBlocks(source)
  return (
    <div className="prose">
      {blocks.map((block, index) => {
        const key = `b${index}`
        if (block.type === "h") {
          const Tag = block.level === 1 ? "h2" : block.level === 2 ? "h3" : "h4"
          return <Tag key={key}>{inline(block.text, key)}</Tag>
        }
        if (block.type === "ul") {
          return (
            <ul key={key}>
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>{inline(item, `${key}-${itemIndex}`)}</li>
              ))}
            </ul>
          )
        }
        if (block.type === "ol") {
          return (
            <ol key={key}>
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>{inline(item, `${key}-${itemIndex}`)}</li>
              ))}
            </ol>
          )
        }
        if (block.type === "code") return <pre key={key}><code>{block.text}</code></pre>
        if (block.type === "quote") return <blockquote key={key}>{inline(block.text, key)}</blockquote>
        if (block.type === "hr") return <hr key={key} />
        return <p key={key}>{inline(block.text, key)}</p>
      })}
    </div>
  )
}
