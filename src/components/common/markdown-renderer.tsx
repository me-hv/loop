import React from 'react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Split content by code blocks: ```[lang]\n[code]\n```
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-2 text-xs leading-relaxed max-w-none">
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

        const lines = part.split('\n')
        return (
          <div key={index} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim()
              
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const bulletText = trimmed.substring(2)
                return (
                  <ul key={lineIdx} className="list-disc pl-5 my-1 space-y-1">
                    <li className="text-foreground">
                      {parseInlineMarkdown(bulletText)}
                    </li>
                  </ul>
                )
              }

              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
              if (numMatch) {
                const numText = numMatch[2]
                return (
                  <ol key={lineIdx} className="list-decimal pl-5 my-1 space-y-1">
                    <li className="text-foreground">
                      {parseInlineMarkdown(numText)}
                    </li>
                  </ol>
                )
              }

              if (trimmed === '') {
                return <div key={lineIdx} className="h-2" />
              }

              return (
                <p key={lineIdx} className="text-foreground">
                  {parseInlineMarkdown(line)}
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|`.*?`)/g
  const parts = text.split(regex)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold text-foreground">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="bg-zinc-800/80 px-1.5 py-0.5 rounded font-mono text-[10px] text-accent border border-border/20">{part.slice(1, -1)}</code>
    }
    return part
  })
}
