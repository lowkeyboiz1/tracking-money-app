import { instance } from "@/services/api/instance"

export interface TransactionData {
  amount: number
  category: string
  description?: string
  date?: string
  walletId: string
  type: "income" | "expense"
}

export const transactionServices = {
  getTransactions: async (walletId?: string) => {
    const url = walletId ? `/api/transactions?walletId=${walletId}` : "/api/transactions"
    return await instance.get(url)
  },
  getTransactionById: async (transactionId: string) => {
    return await instance.get(`/api/transactions/${transactionId}`)
  },
  createTransaction: async (transactionData: TransactionData) => {
    return await instance.post("/api/transactions", transactionData)
  },
  updateTransaction: async (transactionId: string, transactionData: Partial<TransactionData>) => {
    return await instance.put(`/api/transactions/${transactionId}`, transactionData)
  },
  deleteTransaction: async (transactionId: string) => {
    return await instance.delete(`/api/transactions/${transactionId}`)
  },
}
