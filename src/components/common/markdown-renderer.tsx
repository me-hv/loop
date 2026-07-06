import React from 'react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // 1. Split content by code blocks: ```[lang]\n[code]\n```
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-3 text-xs leading-relaxed max-w-none text-foreground select-text">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/)
          const lang = match ? match[1] : ''
          const code = match ? match[2] : part.slice(3, -3)

          return (
            <div key={index} className="my-3 overflow-hidden rounded-lg border border-border/40 bg-zinc-950 font-mono text-[11px] text-zinc-200">
              {lang && (
                <div className="flex items-center justify-between border-b border-border/20 bg-zinc-900/80 px-3 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground select-none">
                  <span>{lang}</span>
                </div>
              )}
              <pre className="overflow-x-auto p-3.5 custom-scrollbar">
                <code>{code.trim()}</code>
              </pre>
            </div>
          )
        }

        // Parse paragraphs, lists, tables, headers, and links
        const lines = part.split('\n')
        const elements: React.ReactNode[] = []
        let currentTableRows: string[][] = []

        const flushTable = (key: string) => {
          if (currentTableRows.length === 0) return
          
          elements.push(
            <div key={key} className="my-4 overflow-x-auto rounded-lg border border-border/30">
              <table className="min-w-full divide-y divide-border/30 text-left text-[11px]">
                <tbody className="divide-y divide-border/20 bg-card/40">
                  {currentTableRows.map((row, rIdx) => {
                    const isHeader = rIdx === 0
                    return (
                      <tr key={rIdx} className={isHeader ? 'bg-muted/30 font-bold' : ''}>
                        {row.map((cell, cIdx) => {
                          const CellTag = isHeader ? 'th' : 'td'
                          return (
                            <CellTag key={cIdx} className="px-3.5 py-2 border-r border-border/10 last:border-0">
                              {parseInlineMarkdown(cell.trim())}
                            </CellTag>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
          currentTableRows = []
        }

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          const trimmed = line.trim()

          // Table Row Parser
          if (trimmed.startsWith('|')) {
            // Check if it's separator row (e.g. |---|---|)
            if (trimmed.match(/^\|[\s\:-|]+$/)) {
              continue
            }
            const cells = trimmed.split('|').slice(1, -1) // remove leading and trailing empty cells
            currentTableRows.push(cells)
            continue
          } else {
            flushTable(`table-${i}`)
          }

          // Headers
          if (trimmed.startsWith('### ')) {
            elements.push(
              <h3 key={i} className="text-sm font-black text-foreground pt-3 pb-1 flex items-center gap-1.5">
                {parseInlineMarkdown(trimmed.substring(4))}
              </h3>
            )
            continue
          }
          if (trimmed.startsWith('## ')) {
            elements.push(
              <h2 key={i} className="text-base font-black text-foreground pt-4 pb-1 border-b border-border/10">
                {parseInlineMarkdown(trimmed.substring(3))}
              </h2>
            )
            continue
          }
          if (trimmed.startsWith('# ')) {
            elements.push(
              <h1 key={i} className="text-lg font-black text-foreground pt-4 pb-1.5 border-b border-border/20">
                {parseInlineMarkdown(trimmed.substring(2))}
              </h1>
            )
            continue
          }

          // Lists
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.substring(2)
            elements.push(
              <ul key={i} className="list-disc pl-5 my-1 space-y-1">
                <li className="text-foreground">
                  {parseInlineMarkdown(bulletText)}
                </li>
              </ul>
            )
            continue
          }

          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
          if (numMatch) {
            const numText = numMatch[2]
            elements.push(
              <ol key={i} className="list-decimal pl-5 my-1 space-y-1">
                <li className="text-foreground">
                  {parseInlineMarkdown(numText)}
                </li>
              </ol>
            )
            continue
          }

          // Empty spaces
          if (trimmed === '') {
            elements.push(<div key={i} className="h-1.5" />)
            continue
          }

          // Normal line
          elements.push(
            <p key={i} className="text-foreground/95">
              {parseInlineMarkdown(line)}
            </p>
          )
        }

        // Flush any remaining tables
        flushTable(`table-end-${index}`)

        return <div key={index} className="space-y-1.5">{elements}</div>
      })}
    </div>
  )
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g
  const parts = text.split(regex)

  return parts.map((part, index) => {
    // Bold
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold text-foreground">{part.slice(2, -2)}</strong>
    }
    // Inline Code
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="bg-zinc-800/60 px-1.5 py-0.5 rounded font-mono text-[10px] text-accent border border-border/20">{part.slice(1, -1)}</code>
    }
    // Links
    if (part.startsWith('[') && part.includes('](')) {
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/)
      if (linkMatch) {
        const linkText = linkMatch[1]
        const linkUrl = linkMatch[2]
        return (
          <a key={index} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-accent font-bold hover:underline">
            {linkText}
          </a>
        )
      }
    }
    return part
  })
}
