import { useEffect, useCallback } from "react"
import { useJotaiSync } from "./useJotaiSync"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"

/**
 * Hook to sync transactions from chat with Jotai state
 * This is needed because the chat interface creates transactions in a different way than the regular transaction form
 */
export function useSyncChatTransactions(walletId: string | null) {
  const { updateTransactions, upsertWallet } = useJotaiSync()
  const queryClient = useQueryClient()

  // Function to fetch latest transactions for a wallet
  const fetchLatestTransactions = useCallback(
    async (walletId: string) => {
      try {
        const response = await axios.get(`/api/transactions?walletId=${walletId}`)
        if (response.data) {
          updateTransactions(response.data)
        }
      } catch (error) {
        console.error("Error fetching latest transactions:", error)
      }
    },
    [updateTransactions]
  )

  // Function to fetch latest wallet data
  const fetchLatestWallet = useCallback(
    async (walletId: string) => {
      try {
        const response = await axios.get(`/api/wallets/${walletId}`)
        if (response.data) {
          upsertWallet(response.data)
        }
      } catch (error) {
        console.error("Error fetching latest wallet:", error)
      }
    },
    [upsertWallet]
  )

  useEffect(() => {
    if (!walletId) return

    // Create an event source for SSE updates
    const eventSource = new EventSource(`/api/sync-state?walletId=${walletId}`)

    // Listen for transaction updates
    eventSource.addEventListener("transaction-update", (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.walletId === walletId) {
          // Invalidate queries and refresh data
          queryClient.invalidateQueries({ queryKey: ["transactions", walletId] })
          queryClient.invalidateQueries({ queryKey: ["wallet", walletId] })
          queryClient.invalidateQueries({ queryKey: ["wallets"] })

          // Fetch latest transactions and update Jotai store
          fetchLatestTransactions(walletId)
          fetchLatestWallet(walletId)
        }
      } catch (error) {
        console.error("Error processing transaction update:", error)
      }
    })

    // Clean up the event source on unmount
    return () => {
      eventSource.close()
    }
  }, [walletId, queryClient, fetchLatestTransactions, fetchLatestWallet])

  // Initial sync
  useEffect(() => {
    if (walletId) {
      fetchLatestTransactions(walletId)
      fetchLatestWallet(walletId)
    }
  }, [walletId, fetchLatestTransactions, fetchLatestWallet])
}
