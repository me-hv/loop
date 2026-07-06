import React, { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'
import { SearchDropdown } from './SearchDropdown'
import { SearchResult } from '@/services/searchService'

interface GlobalSearchProps {
  userId: string | undefined
}

export function GlobalSearch({ userId }: GlobalSearchProps) {
  const router = useRouter()
  const {
    query,
    setQuery,
    results,
    isOpen,
    handleOpenSearch,
    handleCloseSearch,
    selectedIndex,
    setSelectedIndex,
    isSearching,
    searchError,
  } = useGlobalSearch(userId)

  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Handle clicking outside the modal to close it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleCloseSearch()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen, handleCloseSearch])

  // Navigate when selecting an item
  const handleItemSelect = (result: SearchResult) => {
    handleCloseSearch()
    router.push(result.url)

    // For Habit scrolling & highlighting
    if (result.category === 'Habits') {
      setTimeout(() => {
        const id = `habit-${result.id}`
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('bg-accent/15', 'border-accent/30', 'scale-[1.01]')
          setTimeout(() => {
            element.classList.remove('bg-accent/15', 'border-accent/30', 'scale-[1.01]')
          }, 2000)
        }
      }, 500)
    }
  }

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleCloseSearch()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (results.length > 0 && selectedIndex < results.length) {
        handleItemSelect(results[selectedIndex])
      }
    }
  }

  return (
    <>
      {/* Search trigger inside navbar (Desktop) */}
      <div
        onClick={handleOpenSearch}
        className="hidden md:flex items-center gap-2.5 h-10 w-52 md:w-60 px-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 hover:border-border/80 transition-all duration-200 text-sm text-muted-foreground/80 cursor-pointer select-none"
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" />
        <span className="text-xs font-medium">Search...</span>
        <kbd className="ml-auto font-sans text-[10px] font-medium bg-card px-2 py-0.5 rounded border border-border shadow-xs text-muted-foreground/75">
          ⌘K
        </kbd>
      </div>

      {/* Search trigger inside navbar (Mobile) */}
      <button
        onClick={handleOpenSearch}
        type="button"
        className="flex md:hidden h-10 w-10 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 items-center justify-center cursor-pointer transition-all focus:outline-none"
        aria-label="Open search modal"
      >
        <Search className="h-4.5 w-4.5 text-muted-foreground" />
      </button>

      {/* Command Palette Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] md:pt-[15vh] px-4 bg-background/40 backdrop-blur-md transition-all duration-200">
          {/* Modal Container */}
          <div
            ref={modalRef}
            className="w-full max-w-lg overflow-hidden border border-border/60 bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col focus:outline-none animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/10 shrink-0">
              <Search className="h-4.5 w-4.5 text-muted-foreground/80 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search habits, journal, calendar, AI coach..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/45 border-0 focus:outline-none focus:ring-0"
              />
              <button
                onClick={handleCloseSearch}
                className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none transition-colors"
                aria-label="Close search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Results listing */}
            <SearchDropdown
              results={results}
              query={query}
              selectedIndex={selectedIndex}
              isSearching={isSearching}
              searchError={searchError}
              onItemClick={handleItemSelect}
            />
          </div>
        </div>
      )}
    </>
  )
}
