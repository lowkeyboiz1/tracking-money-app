import { useChat as useVercelChat } from "ai/react"
import { useCallback, useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useJotaiSync } from "@/hooks/useJotaiSync"

export interface UseChatOptions {
  walletId?: string
}

export const useChat = (options: UseChatOptions = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const queryClient = useQueryClient()
  const { updateTransactions, upsertWallet } = useJotaiSync()

  const { walletId } = options

  // Function to refresh transactions and wallet data
  const refreshTransactionsAndWallet = useCallback(
    async (walletId: string) => {
      try {
        // Invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: ["transactions", walletId] })
        queryClient.invalidateQueries({ queryKey: ["wallet", walletId] })
        queryClient.invalidateQueries({ queryKey: ["wallets"] })

        // Fetch latest data for Jotai
        const [transactionsResponse, walletResponse] = await Promise.all([axios.get(`/api/transactions?walletId=${walletId}`), axios.get(`/api/wallets/${walletId}`)])

        // Update Jotai state
        if (transactionsResponse.data) {
          updateTransactions(transactionsResponse.data)
        }

        if (walletResponse.data) {
          upsertWallet(walletResponse.data)
          //tesst
        }
      } catch (error) {
        console.error("Error refreshing data after chat:", error)
      }
    },
    [queryClient, updateTransactions, upsertWallet]
  )

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: vercelHandleSubmit,
    isLoading: vercelIsLoading,
    error: vercelError,
    setMessages,
  } = useVercelChat({
    api: "/api/chatbot/process",
    body: {
      walletId,
    },
    headers: {
      "Content-Type": "application/json",
    },
    onFinish: (message) => {
      // Save assistant message after streaming completes
      if (walletId) {
        axios
          .post("/api/chatbot/save-message", {
            message: message.content,
            walletId,
          })
          .catch((error) => {
            console.error("Error saving assistant message:", error)
          })

        // Update Jotai state after chat completion
        refreshTransactionsAndWallet(walletId)
      }
    },
  })

  // Load chat history when wallet changes
  useEffect(() => {
    if (!walletId) return

    const fetchChatHistory = async () => {
      try {
        setIsLoadingHistory(true)
        const response = await axios.get(`/api/chatbot/history?walletId=${walletId}`)
        setMessages(response.data)
      } catch (error) {
        console.error("Error loading chat history:", error)
        setApiError("Failed to load chat history")
      } finally {
        setIsLoadingHistory(false)
      }
    }

    fetchChatHistory()

    // Also refresh transactions when wallet changes
    if (walletId) {
      refreshTransactionsAndWallet(walletId)
    }
  }, [walletId, setMessages, refreshTransactionsAndWallet])

  // Function to clear chat history
  const clearChatHistory = useCallback(async () => {
    if (!walletId) return

    try {
      setIsClearing(true)
      await axios.delete(`/api/chatbot/clear-history?walletId=${walletId}`)
      setMessages([]) // Clear messages from UI
      toast.success("Chat history cleared successfully")
    } catch (error) {
      console.error("Error clearing chat history:", error)
      setApiError("Failed to clear chat history")
      toast.error("Failed to clear chat history")
    } finally {
      setIsClearing(false)
    }
  }, [walletId, setMessages])

  // Custom submit handler to properly handle the loading state
  const handleChatSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input.trim() || isSubmitting) return

      setIsSubmitting(true)

      // Submit to the Vercel AI SDK - wrap in Promise.resolve for catch
      Promise.resolve(vercelHandleSubmit(e))
        .catch((error: Error) => {
          console.error("Error submitting chat:", error)
          setApiError("Failed to send message")
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [input, vercelHandleSubmit, isSubmitting]
  )

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    isLoading: isSubmitting || vercelIsLoading || isLoadingHistory,
    isClearing,
    error: apiError || vercelError,
    setMessages,
    clearChatHistory,
    refreshTransactionsAndWallet,
  }
}
