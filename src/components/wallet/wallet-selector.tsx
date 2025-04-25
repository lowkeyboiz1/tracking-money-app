"use client"

import { useEffect } from "react"
import { Wallet as WalletIcon } from "lucide-react"
import { useAtom } from "jotai"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { currentWalletIdAtom } from "@/lib/store/atoms"
import { WalletForm } from "@/components/wallet/wallet-form"
import { useWallets } from "@/services/query"

export function WalletSelector() {
  const [currentWalletId, setCurrentWalletId] = useAtom(currentWalletIdAtom)

  // Fetch all wallets
  const { data: wallets, isLoading, error } = useWallets()

  // Set the first wallet as default if none is selected
  useEffect(() => {
    if (wallets && wallets.length > 0 && !currentWalletId) {
      setCurrentWalletId(wallets[0]._id?.toString() || null)
    }
  }, [wallets, currentWalletId, setCurrentWalletId])

  // Handle wallet selection
  const handleWalletChange = (value: string) => {
    setCurrentWalletId(value)
  }

  // Format currency to display
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(amount)
  }

  // Get current wallet
  const currentWallet = wallets?.find((wallet) => wallet._id?.toString() === currentWalletId)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <WalletIcon className="h-5 w-5" /> Loading wallets...
      </div>
    )
  }

  if (error) {
    return <div className="text-destructive">Error loading wallets</div>
  }

  return (
    <div className="flex items-center gap-2">
      {wallets && wallets.length > 0 ? (
        <>
          <Select value={currentWalletId || undefined} onValueChange={handleWalletChange}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select a wallet" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet._id?.toString()} value={wallet._id?.toString() || ""}>
                  <div className="flex items-center justify-between w-full">
                    <span>{wallet.name}</span>
                    <span className="ml-2 text-muted-foreground">{formatCurrency(wallet.balance, wallet.currency)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {currentWallet && <div className="hidden md:block text-sm font-medium">{formatCurrency(currentWallet.balance, currentWallet.currency)}</div>}
        </>
      ) : (
        <div className="text-muted-foreground">No wallets available</div>
      )}

      <WalletForm buttonLabel="Add" variant="outline" size="icon" />
    </div>
  )
}
