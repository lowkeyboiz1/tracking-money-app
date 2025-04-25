import { useSetAtom } from "jotai"
import { transactionsAtom, walletsAtom } from "@/lib/store/atoms"
import { Transaction, Wallet } from "@/lib/schema"

/**
 * Custom hook to sync React Query data with Jotai atoms
 */
export function useJotaiSync() {
  const setTransactions = useSetAtom(transactionsAtom)
  const setWallets = useSetAtom(walletsAtom)

  /**
   * Update transactions in the Jotai store
   */
  const updateTransactions = (transactions: Transaction[]) => {
    setTransactions(transactions)
  }

  /**
   * Update wallets in the Jotai store
   */
  const updateWallets = (wallets: Wallet[]) => {
    setWallets(wallets)
  }

  /**
   * Add or update a single transaction in the Jotai store
   */
  const upsertTransaction = (transaction: Transaction) => {
    setTransactions((prev) => {
      const exists = prev.some((t) => t._id?.toString() === transaction._id?.toString())
      if (exists) {
        return prev.map((t) => (t._id?.toString() === transaction._id?.toString() ? transaction : t))
      } else {
        return [...prev, transaction]
      }
    })
  }

  /**
   * Remove a transaction from the Jotai store
   */
  const removeTransaction = (transactionId: string) => {
    setTransactions((prev) => prev.filter((t) => t._id?.toString() !== transactionId))
  }

  /**
   * Add or update a single wallet in the Jotai store
   */
  const upsertWallet = (wallet: Wallet) => {
    setWallets((prev) => {
      const exists = prev.some((w) => w._id?.toString() === wallet._id?.toString())
      if (exists) {
        return prev.map((w) => (w._id?.toString() === wallet._id?.toString() ? wallet : w))
      } else {
        return [...prev, wallet]
      }
    })
  }

  /**
   * Remove a wallet from the Jotai store
   */
  const removeWallet = (walletId: string) => {
    setWallets((prev) => prev.filter((w) => w._id?.toString() !== walletId))
  }

  return {
    updateTransactions,
    updateWallets,
    upsertTransaction,
    removeTransaction,
    upsertWallet,
    removeWallet,
  }
}
