import { useState, useEffect, useCallback } from 'react'
  import { useQueryClient } from '@tanstack/react-query'
  import { searchService, SearchResult } from '@/services/searchService'
  
  export function useGlobalSearch(userId: string | undefined) {
    const queryClient = useQueryClient()
    const [query, setQueryInternal] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)

    const setQuery = useCallback((val: string) => {
      setQueryInternal(val)
      if (val.trim()) {
        setIsSearching(true)
      }
    }, [])
  
    // Debounce search text input
    useEffect(() => {
      if (!query.trim()) {
        const timer = setTimeout(() => {
          setDebouncedQuery('')
          setResults([])
          setIsSearching(false)
        }, 0)
        return () => clearTimeout(timer)
      }
      
      const timer = setTimeout(() => {
        setDebouncedQuery(query)
        setIsSearching(false)
      }, 250)
  
      return () => clearTimeout(timer)
    }, [query])
  
    // Fetch and search local TanStack cache
    useEffect(() => {
      if (!debouncedQuery.trim() || !userId) {
        const timer = setTimeout(() => {
          setResults([])
        }, 0)
        return () => clearTimeout(timer)
      }
  
      const timer = setTimeout(() => {
        try {
          setSearchError(null)
          const matchResults = searchService.searchLocalData(userId, queryClient, debouncedQuery)
          setResults(matchResults)
          setSelectedIndex(0)
        } catch (err) {
          console.error(err)
          setSearchError('Unable to search right now. Please try again.')
        }
      }, 0)

      return () => clearTimeout(timer)
    }, [debouncedQuery, userId, queryClient])
  
    // Trigger pre-fetch cache population when search opens
    const handleOpenSearch = useCallback(() => {
      setIsOpen(true)
      if (userId) {
        searchService.prefetchSearchData(queryClient, userId)
      }
    }, [userId, queryClient])
  
    const handleCloseSearch = useCallback(() => {
      setIsOpen(false)
      setQuery('')
    }, [setQuery])
  
    // Listen for Ctrl+K / Cmd+K focus shortcut
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault()
          handleOpenSearch()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleOpenSearch])
  
    return {
      query,
      setQuery,
      results,
      isOpen,
      setIsOpen,
      handleOpenSearch,
      handleCloseSearch,
      selectedIndex,
      setSelectedIndex,
      isSearching,
      searchError,
    }
  }
