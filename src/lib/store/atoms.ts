import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { Wallet, Transaction } from "../schema"

// Current wallet selection
export const currentWalletIdAtom = atomWithStorage<string | null>("currentWalletId", null)

// Wallets list
export const walletsAtom = atom<Wallet[]>([])

// Transactions for the current wallet
export const transactionsAtom = atom<Transaction[]>([])

// Derived atom that returns transactions for the current wallet
export const currentWalletTransactionsAtom = atom((get) => {
  const transactions = get(transactionsAtom)
  const currentWalletId = get(currentWalletIdAtom)

  if (!currentWalletId) return []
  return transactions.filter((transaction) => transaction.walletId === currentWalletId)
})

// Derived atom that returns the current wallet
export const currentWalletAtom = atom((get) => {
  const wallets = get(walletsAtom)
  const currentWalletId = get(currentWalletIdAtom)

  if (!currentWalletId) return null
  return wallets.find((wallet) => wallet._id?.toString() === currentWalletId) || null
})

// Loading states
export const isLoadingWalletsAtom = atom<boolean>(false)
export const isLoadingTransactionsAtom = atom<boolean>(false)

// Chatbot conversation history
export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export const chatHistoryAtom = atomWithStorage<ChatMessage[]>("chatHistory", [])
