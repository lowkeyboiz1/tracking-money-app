import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { walletServices, WalletData } from "@/services/api"
import { Wallet } from "@/lib/schema"
import { useJotaiSync } from "@/hooks/useJotaiSync"

export const useWallets = () => {
  const { updateWallets } = useJotaiSync()

  return useQuery<Wallet[]>({
    queryKey: ["wallets"],
    queryFn: async () => {
      const response = await walletServices.getWallets()
      // Sync with Jotai store
      updateWallets(response.data)
      return response.data
    },
  })
}

export const useWallet = (walletId: string | null) => {
  const { upsertWallet } = useJotaiSync()

  return useQuery<Wallet>({
    queryKey: ["wallet", walletId],
    queryFn: async () => {
      if (!walletId) return null
      const response = await walletServices.getWalletById(walletId)
      // Sync with Jotai store
      if (response.data) {
        upsertWallet(response.data)
      }
      return response.data
    },
    enabled: !!walletId,
  })
}

export const useCreateWallet = () => {
  const queryClient = useQueryClient()
  const { upsertWallet } = useJotaiSync()

  return useMutation({
    mutationFn: async (walletData: WalletData) => {
      const response = await walletServices.createWallet(walletData)
      return response.data
    },
    onSuccess: (data) => {
      // Update Jotai store immediately
      upsertWallet(data)

      // Invalidate queries to update data from server
      queryClient.invalidateQueries({ queryKey: ["wallets"] })
    },
  })
}

export const useUpdateWallet = () => {
  const queryClient = useQueryClient()
  const { upsertWallet } = useJotaiSync()

  return useMutation({
    mutationFn: async ({ walletId, walletData }: { walletId: string; walletData: Partial<WalletData> }) => {
      const response = await walletServices.updateWallet(walletId, walletData)
      return response.data
    },
    onSuccess: (data) => {
      // Update Jotai store immediately
      upsertWallet(data)

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["wallets"] })
    },
  })
}

export const useDeleteWallet = () => {
  const queryClient = useQueryClient()
  const { removeWallet } = useJotaiSync()

  return useMutation({
    mutationFn: async (walletId: string) => {
      const response = await walletServices.deleteWallet(walletId)
      return response.data
    },
    onSuccess: (_, variables) => {
      // Update Jotai store immediately
      removeWallet(variables)

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["wallets"] })
    },
  })
}
