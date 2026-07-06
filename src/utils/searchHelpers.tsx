import React from 'react'

/**
 * Split text by query matches and wrap matching sequences inside a styled <mark> tag.
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !query.trim()) return text

  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-accent/25 text-accent font-extrabold rounded-xs px-0.5 select-text">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}
