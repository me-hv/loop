'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useUIStore } from '@/store/use-ui-store'
import { useQuery } from '@tanstack/react-query'
import { useHabitsQuery } from '@/features/habits/hooks/use-habits'
import { useUserCompletions, useHabitProgress } from '@/features/tracking/hooks/use-tracking'
import { journalService } from '@/features/journal/services/journal-service'
import { gamificationService, calculateLevelFromXp } from '@/features/gamification/services/gamification-service'
import { calculateHabitHealth, getHealthBg } from '@/features/ai/utils/health-score'
import { buildDailySummaryPrompt, buildWeeklyReviewPrompt, buildMonthlyReviewPrompt, buildRecommendationsPrompt, serializeUserContext } from '@/features/ai/prompts'
import { useAIConversations } from '@/features/ai/hooks/use-ai'
import { aiService } from '@/features/ai/services/ai-service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { MarkdownRenderer } from '@/components/common/markdown-renderer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sparkles,
  Bot,
  User,
  Trash2,
  Plus,
  Send,
  Flame,
  Trophy,
  Smile,
  Activity,
  X,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Bookmark,
  MoreVertical,
  Edit,
  Copy,
  Archive,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfWeek } from 'date-fns'

const SUGGESTED_QUESTIONS = [
  'How can I stay consistent?',
  'Why am I losing motivation?',
  'Review my habits',
  'What should I improve?',
  'Analyze this week',
  'Help me build discipline',
  'Give me tomorrow\'s plan',
  'What habits should I archive?',
]

export default function AICoachPage() {
  const user = useAuthStore((s) => s.user)
  const addToast = useUIStore((s) => s.addToast)

  // 1. Fetch raw contexts
  const { data: habits = [], isLoading: habitsLoading } = useHabitsQuery(user?.uid)
  const { data: completions = [], isLoading: completionsLoading } = useUserCompletions(user?.uid)
  
  const { data: journals = [], isLoading: journalsLoading } = useQuery({
    queryKey: ['journal-history-ai', user?.uid],
    queryFn: () => journalService.getJournalHistory(user!.uid),
    enabled: !!user?.uid,
  })

  const { currentActiveStreak = 0 } = useHabitProgress(user?.uid)

  // 2. Calculate Level and XP
  const { levelProgress, achievements } = useMemo(() => {
    const { totalXp } = gamificationService.calculateTotalXP(habits, completions, journals)
    const progress = calculateLevelFromXp(totalXp)
    const achs = gamificationService.getAchievementsList(habits, completions, journals)
    return { levelProgress: progress, achievements: achs }
  }, [habits, completions, journals])

  // 3. User Data context bundle
  const contextData = useMemo(() => {
    return {
      displayName: user?.displayName || 'User',
      habits,
      completions,
      journals,
      levelProgress,
      achievements,
      currentStreak: currentActiveStreak,
    }
  }, [user, habits, completions, journals, levelProgress, achievements, currentActiveStreak])

  // 4. AI chat state & conversation hook
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    conversationsLoading,
    createConversationAsync,
    deleteConversation,
    renameConversation,
    duplicateConversation,
    archiveConversation,
    sendMessage,
    isSending,
  } = useAIConversations(user?.uid)

  const [chatInput, setChatInput] = useState('')
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'recommendations'>('daily')
  const [searchQuery, setSearchQuery] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Caching states for summaries
  const [summaries, setSummaries] = useState<Record<string, string>>({})
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [apiMissingKey, setApiMissingKey] = useState(false)

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeConversation?.messages, isSending])

  // Calculate current date keys
  const dateKeys = useMemo(() => {
    const today = new Date()
    return {
      daily: format(today, 'yyyy-MM-dd'),
      weekly: format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-'W'I"),
      monthly: format(today, 'yyyy-MM'),
      recommendations: format(today, 'yyyy-MM-dd'),
    }
  }, [])

  // Load cached summaries on tab change or load
  useEffect(() => {
    if (!user) return
    const checkCache = async () => {
      const key = dateKeys[activeTab]
      const cached = await aiService.getCachedSummary(user.uid, activeTab === 'recommendations' ? 'daily' : activeTab, key)
      if (cached) {
        setSummaries((prev) => ({ ...prev, [activeTab]: cached }))
      }
    }
    checkCache()
  }, [activeTab, user, dateKeys])

  // Calculate health score for each habit
  const habitHealths = useMemo(() => {
    return habits
      .filter((h) => !h.isDeleted && !h.isArchived)
      .map((h) => {
        const health = calculateHabitHealth(h, completions, currentActiveStreak)
        return { habit: h, health }
      })
      .sort((a, b) => a.health.score - b.health.score)
  }, [habits, completions, currentActiveStreak])

  // Handle Summary Generation
  const handleGenerateSummary = async (force = false) => {
    if (!user) return
    const key = dateKeys[activeTab]

    if (!force) {
      const cached = await aiService.getCachedSummary(user.uid, activeTab === 'recommendations' ? 'daily' : activeTab, key)
      if (cached) {
        setSummaries((prev) => ({ ...prev, [activeTab]: cached }))
        return
      }
    }

    try {
      setLoadingSummary(true)
      setApiMissingKey(false)
      
      let promptContext = ''
      if (activeTab === 'daily') promptContext = buildDailySummaryPrompt(contextData)
      else if (activeTab === 'weekly') promptContext = buildWeeklyReviewPrompt(contextData)
      else if (activeTab === 'monthly') promptContext = buildMonthlyReviewPrompt(contextData)
      else if (activeTab === 'recommendations') promptContext = buildRecommendationsPrompt(contextData)

      const result = await aiService.callAiApi(
        activeTab === 'recommendations' ? 'recommendations' : `summary_${activeTab}`,
        promptContext
      )

      setSummaries((prev) => ({ ...prev, [activeTab]: result }))
      await aiService.saveCachedSummary(user.uid, activeTab === 'recommendations' ? 'daily' : activeTab, key, result)
      addToast({ message: 'Summary generated successfully!', type: 'success' })
    } catch (err) {
      console.error(err)
      const errMessage = err instanceof Error ? err.message : 'Failed to generate summary.'
      if (errMessage.includes('API key') || errMessage.includes('missingKey')) {
        setApiMissingKey(true)
      } else {
        addToast({ message: errMessage, type: 'error' })
      }
    } finally {
      setLoadingSummary(false)
    }
  }

  // Handle Send Chat message
  const handleSendChatMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput
    if (!text.trim() || !user) return

    setChatInput('')
    setApiMissingKey(false)

    try {
      const promptContext = serializeUserContext(contextData)
      
      if (!activeConversation) {
        // Create new conversation document
        const newId = await createConversationAsync(undefined, 'New Coaching Session')
        await sendMessage({
          conversationId: newId,
          existingMessages: [],
          promptContext,
          newMessage: text,
          currentTitle: 'New Coaching Session',
        })
      } else {
        await sendMessage({
          conversationId: activeConversation.id,
          existingMessages: activeConversation.messages,
          promptContext,
          newMessage: text,
          currentTitle: activeConversation.title,
        })
      }
    } catch (err) {
      console.error(err)
      const errMessage = err instanceof Error ? err.message : 'Failed to send message.'
      if (errMessage.includes('API key') || errMessage.includes('missingKey')) {
        setApiMissingKey(true)
      } else {
        addToast({ message: errMessage, type: 'error' })
      }
    }
  }

  const handleCreateNewChat = async () => {
    try {
      const newId = await createConversationAsync(undefined, 'New Coaching Session')
      setActiveConversationId(newId)
    } catch (err) {
      console.error('Error starting new coaching session:', err)
      addToast({ message: 'Failed to start new coaching session.', type: 'error' })
    }
  }

  const handleStartCoaching = async () => {
    const active = conversations.filter((c) => !c.isArchived)
    if (active.length > 0) {
      setActiveConversationId(active[0].id)
    } else {
      await handleCreateNewChat()
    }
  }

  const handleStartNewChat = () => {
    setActiveConversationId(null)
  }

  const filteredConversations = useMemo(() => {
    const active = conversations.filter((c) => !c.isArchived)
    if (!searchQuery.trim()) return active

    const query = searchQuery.toLowerCase().trim()
    return active.filter((c) => {
      const matchTitle = c.title.toLowerCase().includes(query)
      const matchContent = c.messages.some((m) => m.content.toLowerCase().includes(query))
      const matchDate = c.createdAt ? format(new Date(c.createdAt), 'yyyy-MM-dd').includes(query) : false
      return matchTitle || matchContent || matchDate
    })
  }, [conversations, searchQuery])

  const isLoading = habitsLoading || completionsLoading || journalsLoading || conversationsLoading

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-4 select-none animate-pulse">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl md:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none relative">
      {/* Gemini API Key Missing Alert */}
      {apiMissingKey && (
        <Card className="border-destructive/30 bg-destructive/5 text-destructive p-5 flex items-start gap-4">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider">Gemini API Key Required</h4>
            <p className="text-[11px] leading-normal text-muted-foreground max-w-2xl">
              To enable AI Coaching summaries and interactive chats, you must add a Gemini API key.
              Create/update `GEMINI_API_KEY=your_key` in your <code className="bg-destructive/10 px-1 rounded">.env.local</code> file in the project root and restart the Next.js development server.
            </p>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent animate-pulse" /> Loop AI Coach
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Understand your routine patterns, track habit health metrics, and chat with your supportive AI coach.
          </p>
        </div>
        
        {activeConversationId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartNewChat}
            className="h-8 text-[10px] font-black cursor-pointer"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Dashboard View
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Sidebar past chats */}
        <div className="space-y-4">
          <Card className="border-border/40 bg-card/60 backdrop-blur-md flex flex-col max-h-[420px]">
            <CardHeader className="pb-2 flex flex-row items-center justify-between shrink-0">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  AI Conversations
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground">
                  History of past reflections
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCreateNewChat}
                className="h-7 w-7 rounded-full cursor-pointer hover:bg-muted"
                aria-label="New chat"
              >
                <Plus className="h-4 w-4 text-foreground" />
              </Button>
            </CardHeader>

            <div className="px-4 pb-2.5 shrink-0">
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-[11px] placeholder:text-muted-foreground/45 border-border/30 rounded-lg"
              />
            </div>

            <CardContent className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar px-4 pb-4">
              {filteredConversations.length === 0 ? (
                searchQuery.trim() ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <MessageSquare className="h-7 w-7 mx-auto opacity-35 mb-1.5" />
                    <span className="text-[10px] font-bold">No search results found.</span>
                  </div>
                ) : (
                  <div className="text-center py-6 px-3 border border-dashed border-border/30 rounded-xl space-y-2.5">
                    <Bot className="h-7 w-7 mx-auto text-accent animate-pulse" />
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-black text-foreground">Start your first session</h4>
                      <p className="text-[9px] text-muted-foreground leading-relaxed max-w-[170px] mx-auto">
                        Your AI Coach will analyze your habits, identify patterns, and help you improve every day.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateNewChat}
                      className="h-7 text-[9px] font-black w-full cursor-pointer"
                    >
                      Start Coaching
                    </Button>
                  </div>
                )
              ) : (
                filteredConversations.map((c) => {
                  const isActive = activeConversationId === c.id
                  return (
                    <div
                      key={c.id}
                      className={`group flex items-center justify-between p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        isActive
                          ? 'bg-accent/15 border-accent/20 text-accent'
                          : 'border-transparent hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setActiveConversationId(c.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Bookmark className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-[11px] font-bold truncate max-w-[130px]">{c.title}</span>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-all cursor-pointer focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Conversation actions"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32" sideOffset={4}>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              const newTitle = window.prompt('Rename Conversation', c.title)
                              if (newTitle && newTitle.trim()) {
                                renameConversation({ id: c.id, title: newTitle.trim() })
                              }
                            }}
                            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-[10px] font-bold"
                          >
                            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Rename</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateConversation(c.id)
                            }}
                            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-[10px] font-bold"
                          >
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              archiveConversation(c.id)
                            }}
                            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-[10px] font-bold"
                          >
                            <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Archive</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              const confirmDelete = window.confirm('Are you sure you want to delete this conversation?')
                              if (confirmDelete) {
                                deleteConversation(c.id)
                              }
                            }}
                            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-[10px] font-bold text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Summary Widget */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardContent className="p-4 space-y-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">
                Progress Status
              </span>
              <div className="flex items-center justify-between border-b border-border/10 pb-2">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-500" /> Active Streak
                </span>
                <span className="text-xs font-black">{currentActiveStreak} Days</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/10 pb-2">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-yellow-500" /> Achievements
                </span>
                <span className="text-xs font-black">{achievements.filter((a) => a.unlocked).length} Earned</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Smile className="h-4 w-4 text-purple-500" /> Reflection Logs
                </span>
                <span className="text-xs font-black">{journals.length} Entries</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Active Chat OR Summaries Dashboard */}
        <div className="md:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeConversationId ? (
              /* ACTIVE COACH CHAT */
              <motion.div
                key="chat-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <Card className="border-border/40 bg-card/60 backdrop-blur-md flex flex-col h-[520px]">
                  <CardHeader className="pb-3 border-b border-border/10 flex flex-row items-center justify-between shrink-0">
                    <div>
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Bot className="h-4.5 w-4.5 text-accent" /> AI Coach Chat
                      </CardTitle>
                      <CardDescription className="text-[10px] text-muted-foreground">
                        Structured suggestions grounded in your data logs.
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleStartNewChat}
                      className="h-7 w-7 rounded-full cursor-pointer hover:bg-muted"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </CardHeader>
                  
                  {/* Chat Timeline message content */}
                  <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    {activeConversation?.messages.map((m, idx) => {
                      const isAi = m.role === 'assistant'
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border ${
                              isAi
                                ? 'bg-accent/15 border-accent/20 text-accent animate-in zoom-in-50 duration-200'
                                : 'bg-muted/80 border-border/40 text-muted-foreground'
                            }`}
                          >
                            {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </div>

                          <div
                            className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed border shadow-sm ${
                              isAi
                                ? 'bg-card border-border/30 text-foreground'
                                : 'bg-accent/10 border-accent/20 text-foreground font-semibold'
                            }`}
                          >
                            <MarkdownRenderer content={m.content} />
                          </div>
                        </div>
                      )
                    })}

                    {/* Chat loading typing indicator */}
                    {isSending && (
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 border bg-accent/15 border-accent/20 text-accent">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="p-3.5 rounded-2xl border border-border/30 bg-card text-xs flex gap-1 items-center">
                          <span className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </CardContent>

                  {/* Suggestion Prompts */}
                  {(!activeConversation || activeConversation.messages.length === 0) && (
                    <div className="px-4 pb-2 pt-1 border-t border-border/5 flex flex-wrap gap-1.5 shrink-0 justify-center">
                      {SUGGESTED_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleSendChatMessage(q)}
                          className="px-2.5 py-1.5 rounded-full border border-border/30 hover:border-accent bg-muted/40 hover:bg-accent/5 text-[10px] font-bold text-muted-foreground hover:text-accent transition-all cursor-pointer select-none"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Chat inputs footer */}
                  <div className="p-4 border-t border-border/10 bg-muted/20 shrink-0 flex items-center gap-2">
                    <textarea
                      placeholder="Ask your AI Coach..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendChatMessage()
                        }
                      }}
                      disabled={isSending}
                      rows={1}
                      className="flex-1 min-h-[38px] max-h-32 resize-none bg-background border border-border/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent/40 text-foreground custom-scrollbar"
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => handleSendChatMessage()}
                      disabled={isSending || !chatInput.trim()}
                      className="h-9.5 w-9.5 shrink-0 cursor-pointer rounded-xl flex items-center justify-center"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              /* SUMMARIES & REVIEW INTERFACE */
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Tabs selection */}
                <div className="flex border-b border-border/10 gap-4 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'daily', label: "Today's Summary" },
                    { id: 'weekly', label: 'Weekly Review' },
                    { id: 'monthly', label: 'Monthly Review' },
                    { id: 'recommendations', label: 'AI Recommendations' },
                  ].map((tab) => {
                    const active = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setApiMissingKey(false)
                          setActiveTab(tab.id as 'daily' | 'weekly' | 'monthly' | 'recommendations')
                        }}
                        className={`pb-2.5 text-xs font-black border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                          active
                            ? 'border-accent text-accent'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* Tab content wrapper */}
                <Card className="border-border/40 bg-card/60 backdrop-blur-md min-h-[220px]">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                        {activeTab === 'daily' && "Today's Summary"}
                        {activeTab === 'weekly' && 'Weekly Review'}
                        {activeTab === 'monthly' && 'Monthly Review'}
                        {activeTab === 'recommendations' && 'AI Recommendations'}
                      </CardTitle>
                      <CardDescription className="text-[10px] text-muted-foreground">
                        {activeTab === 'daily' && 'Track XP, completed habits, and streaks logged today.'}
                        {activeTab === 'weekly' && 'Detailed consistency audit, mood patterns, and adjustments.'}
                        {activeTab === 'monthly' && 'Overall monthly trend analysis and focus suggestions.'}
                        {activeTab === 'recommendations' && 'Routines optimization tips and habit stack recommendations.'}
                      </CardDescription>
                    </div>

                    {summaries[activeTab] && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGenerateSummary(true)}
                        disabled={loadingSummary}
                        className="h-7 w-7 rounded-full cursor-pointer hover:bg-muted"
                        aria-label="Refresh summary"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 text-foreground ${loadingSummary && 'animate-spin'}`} />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    {loadingSummary ? (
                      <div className="space-y-3 py-4">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-4 w-1/2 rounded" />
                        <Skeleton className="h-4 w-5/6 rounded" />
                      </div>
                    ) : summaries[activeTab] ? (
                      <div className="whitespace-pre-line text-xs leading-relaxed prose prose-invert max-w-none">
                        {summaries[activeTab]}
                      </div>
                    ) : (
                      <div className="text-center py-10 space-y-4">
                        <Bot className="h-10 w-10 text-muted-foreground opacity-30 mx-auto" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-foreground">No review generated.</h4>
                          <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">
                            Generate your review based on your completions and reflection logs.
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleGenerateSummary(false)}
                          className="h-9 text-xs font-bold cursor-pointer"
                        >
                          Generate AI Review
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Habit Health scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Health score list card */}
                  <Card className="border-border/40 bg-card/60 backdrop-blur-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-accent" /> Habit Health Indicators
                      </CardTitle>
                      <CardDescription className="text-[10px] text-muted-foreground">
                        Evaluates habit consistency and streaks.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {habitHealths.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-[10px] font-bold">
                          No active habits to rate. Create some habits to see scores!
                        </div>
                      ) : (
                        habitHealths.map(({ habit, health }) => (
                          <div key={habit.id} className="flex items-center justify-between border-b border-border/10 pb-2.5 last:border-0 last:pb-0">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-foreground">{habit.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-muted-foreground font-semibold">
                                  Streak: {health.streak}d
                                </span>
                                <span className="text-[9px] text-muted-foreground font-semibold">
                                  Consistency: {health.consistency}%
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-black">{health.score}</span>
                                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-lg border ${getHealthBg(health.status)}`}>
                                  {health.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Coach Chat quick start card */}
                  <Card className="border-border/40 bg-card/60 backdrop-blur-md flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Bot className="h-4 w-4 text-accent" /> Chat with AI Coach
                      </CardTitle>
                      <CardDescription className="text-[10px] text-muted-foreground">
                        Ask questions about your habit barriers and mood trends.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center text-center py-6 space-y-3">
                      <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-normal">
                        &quot;How does my stress level affect my habits?&quot; or &quot;Which routines should I archive next?&quot;
                      </p>
                      <Button
                        type="button"
                        onClick={handleStartCoaching}
                        className="h-9 text-xs font-bold cursor-pointer mx-auto flex items-center gap-1.5"
                      >
                        <MessageSquare className="h-4 w-4" /> Start Coaching Session
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
