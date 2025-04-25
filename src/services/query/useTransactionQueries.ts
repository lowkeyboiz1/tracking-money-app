import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { transactionServices, TransactionData } from "@/services/api"
import { Transaction } from "@/lib/schema"
import { useJotaiSync } from "@/hooks/useJotaiSync"

export const useTransactions = (walletId: string | null) => {
  const { updateTransactions } = useJotaiSync()

  return useQuery<Transaction[]>({
    queryKey: ["transactions", walletId],
    queryFn: async () => {
      if (!walletId) return []
      const response = await transactionServices.getTransactions(walletId)
      // Sync with Jotai store
      updateTransactions(response.data)
      return response.data
    },
    enabled: !!walletId,
  })
}

export const useTransaction = (transactionId: string | null) => {
  return useQuery<Transaction>({
    queryKey: ["transaction", transactionId],
    queryFn: async () => {
      if (!transactionId) return null
      const response = await transactionServices.getTransactionById(transactionId)
      return response.data
    },
    enabled: !!transactionId,
  })
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()
  const { upsertTransaction } = useJotaiSync()

  return useMutation({
    mutationFn: async (transactionData: TransactionData) => {
      const response = await transactionServices.createTransaction(transactionData)
      return response.data
    },
    onSuccess: (data, variables) => {
      // Update Jotai store immediately
      upsertTransaction(data)

      // Invalidate queries to update data from server
      queryClient.invalidateQueries({ queryKey: ["transactions", variables.walletId] })
      queryClient.invalidateQueries({ queryKey: ["wallet", variables.walletId] })
      queryClient.invalidateQueries({ queryKey: ["wallets"] })
    },
  })
}

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()
  const { upsertTransaction } = useJotaiSync()

  return useMutation({
    mutationFn: async ({ transactionId, transactionData }: { transactionId: string; transactionData: Partial<TransactionData> }) => {
      const response = await transactionServices.updateTransaction(transactionId, transactionData)
      return response.data
    },
    onSuccess: (data, variables) => {
      // Update Jotai store immediately
      upsertTransaction(data)

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["transaction", variables.transactionId] })
      // Also invalidate the wallet to update the balance if walletId is provided
      if (variables.transactionData.walletId) {
        queryClient.invalidateQueries({ queryKey: ["wallet", variables.transactionData.walletId] })
        queryClient.invalidateQueries({ queryKey: ["wallets"] })
      }
    },
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()
  const { removeTransaction } = useJotaiSync()

  return useMutation({
    mutationFn: async ({ transactionId, walletId }: { transactionId: string; walletId: string }) => {
      const response = await transactionServices.deleteTransaction(transactionId)
      return { ...response.data, walletId }
    },
    onSuccess: (_, variables) => {
      // Update Jotai store immediately
      removeTransaction(variables.transactionId)

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["transactions", variables.walletId] })
      // Also invalidate the wallet to update the balance
      queryClient.invalidateQueries({ queryKey: ["wallet", variables.walletId] })
      queryClient.invalidateQueries({ queryKey: ["wallets"] })
    },
  })
}
