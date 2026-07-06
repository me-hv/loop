import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService } from '../services/ai-service'
import { AIChatMessage } from '../types'
import { useState } from 'react'

export function useAIConversations(userId: string | undefined) {
  const queryClient = useQueryClient()
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  // 1. Fetch Conversations
  const { 
    data: conversations = [], 
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['aiConversations', userId],
    queryFn: () => aiService.getConversations(userId!),
    enabled: !!userId,
    retry: true,
    retryDelay: 5000,
  })

  // Find active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null

  // 2. Create Conversation Mutation
  const createConversationMutation = useMutation({
    mutationFn: ({ message, title }: { message?: string; title?: string }) =>
      aiService.createConversation(userId!, message, title),
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ['aiConversations', userId] })
      setActiveConversationId(newId)
    },
  })

  // 3. Delete Conversation Mutation
  const deleteConversationMutation = useMutation({
    mutationFn: (id: string) => aiService.deleteConversation(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['aiConversations', userId] })
      if (activeConversationId === deletedId) {
        setActiveConversationId(null)
      }
    },
  })

  // 4. Rename Conversation Mutation
  const renameConversationMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      aiService.renameConversation(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiConversations', userId] })
    },
  })

  // 5. Duplicate Conversation Mutation
  const duplicateConversationMutation = useMutation({
    mutationFn: (id: string) =>
      aiService.duplicateConversation(userId!, id),
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ['aiConversations', userId] })
      setActiveConversationId(newId)
    },
  })

  // 6. Archive Conversation Mutation
  const archiveConversationMutation = useMutation({
    mutationFn: (id: string) =>
      aiService.archiveConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiConversations', userId] })
    },
  })

  // 7. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      conversationId,
      existingMessages,
      promptContext,
      newMessage,
      currentTitle,
    }: {
      conversationId: string
      existingMessages: AIChatMessage[]
      promptContext: string
      newMessage: string
      currentTitle?: string
    }) => {
      const userMsg: AIChatMessage = {
        role: 'user',
        content: newMessage,
        createdAt: new Date().toISOString(),
      }

      const tempHistory = [...existingMessages, userMsg]

      // Call API route
      const aiReplyContent = await aiService.callAiApi('chat', promptContext, tempHistory)

      const assistantMsg: AIChatMessage = {
        role: 'assistant',
        content: aiReplyContent,
        createdAt: new Date().toISOString(),
      }

      const finalHistory = [...tempHistory, assistantMsg]

      let generatedTitle: string | undefined = undefined
      if (currentTitle === 'New Coaching Session' || !currentTitle) {
        try {
          const suggestedTitle = await aiService.callAiApi('generate_title', '', finalHistory)
          const cleanedTitle = suggestedTitle.replace(/["']/g, '').trim()
          if (cleanedTitle && cleanedTitle.length > 0) {
            generatedTitle = cleanedTitle.length > 40 ? cleanedTitle.substring(0, 37) + '...' : cleanedTitle
          }
        } catch (titleErr) {
          console.error('Error generating conversation title:', titleErr)
        }
      }

      // Update Firestore
      await aiService.addMessageToConversation(conversationId, finalHistory, generatedTitle)
      return finalHistory
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiConversations', userId] })
    },
  })

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    conversationsLoading,
    conversationsError,
    refetchConversations,
    createConversation: (message?: string, title?: string) =>
      createConversationMutation.mutate({ message, title }),
    createConversationAsync: (message?: string, title?: string) =>
      createConversationMutation.mutateAsync({ message, title }),
    isCreating: createConversationMutation.isPending,
    deleteConversation: deleteConversationMutation.mutate,
    renameConversation: renameConversationMutation.mutate,
    duplicateConversation: duplicateConversationMutation.mutate,
    archiveConversation: archiveConversationMutation.mutate,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    sendError: sendMessageMutation.error,
  }
}
