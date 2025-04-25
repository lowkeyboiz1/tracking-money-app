import { instance } from "@/services/api/instance"

export interface WalletData {
  name: string
  balance: number
  currency?: string
  color?: string
  description?: string
}

export const walletServices = {
  getWallets: async () => {
    return await instance.get("/api/wallets")
  },
  getWalletById: async (walletId: string) => {
    return await instance.get(`/api/wallets/${walletId}`)
  },
  createWallet: async (walletData: WalletData) => {
    return await instance.post("/api/wallets", walletData)
  },
  updateWallet: async (walletId: string, walletData: Partial<WalletData>) => {
    return await instance.put(`/api/wallets/${walletId}`, walletData)
  },
  deleteWallet: async (walletId: string) => {
    return await instance.delete(`/api/wallets/${walletId}`)
  },
}
