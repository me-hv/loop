import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService } from '../services/ai-service'
import { AIChatMessage } from '../types'
import { useState } from 'react'

export function useAIConversations(userId: string | undefined) {
  const queryClient = useQueryClient()
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  // 1. Fetch Conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['aiConversations', userId],
    queryFn: () => aiService.getConversations(userId!),
    enabled: !!userId,
  })

  // Find active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null

  // 2. Create Conversation Mutation
  const createConversationMutation = useMutation({
    mutationFn: ({ message }: { message: string }) =>
      aiService.createConversation(userId!, message),
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

  // 4. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      conversationId,
      existingMessages,
      promptContext,
      newMessage,
    }: {
      conversationId: string
      existingMessages: AIChatMessage[]
      promptContext: string
      newMessage: string
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

      // Update Firestore
      await aiService.addMessageToConversation(conversationId, finalHistory)
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
    createConversation: createConversationMutation.mutate,
    isCreating: createConversationMutation.isPending,
    deleteConversation: deleteConversationMutation.mutate,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    sendError: sendMessageMutation.error,
  }
}
