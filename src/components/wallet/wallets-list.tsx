"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useAtom } from "jotai"
import { AlertCircle } from "lucide-react"
import { currentWalletIdAtom, walletsAtom } from "@/lib/store/atoms"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { WalletForm } from "@/components/wallet/wallet-form"
import { useWallets, useDeleteWallet } from "@/services/query"

export function WalletsList() {
  const [currentWalletId, setCurrentWalletId] = useAtom(currentWalletIdAtom)
  const [wallets] = useAtom(walletsAtom) // Use Jotai for real-time updates
  const queryClient = useQueryClient()

  // Fetch all wallets (will sync with Jotai atoms)
  const { isLoading, error } = useWallets()

  // Delete wallet mutation
  const deleteWalletMutation = useDeleteWallet()

  // Handle delete wallet
  const handleDeleteWallet = (walletId: string) => {
    if (confirm("Are you sure you want to delete this wallet? All associated transactions will also be deleted.")) {
      deleteWalletMutation.mutate(walletId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["wallets"] })
          if (wallets && wallets.length > 0 && currentWalletId) {
            // If we deleted the current wallet, set another one as current
            const deletedCurrentWallet = !wallets.some((w) => w._id?.toString() === currentWalletId)
            if (deletedCurrentWallet && wallets.length > 1) {
              // Find a different wallet to set as current
              const newCurrentWallet = wallets.find((w) => w._id?.toString() !== currentWalletId)
              if (newCurrentWallet) {
                setCurrentWalletId(newCurrentWallet._id?.toString() || null)
              }
            } else if (wallets.length === 1) {
              // If we deleted the only wallet, clear the current wallet
              setCurrentWalletId(null)
            }
          }
        },
      })
    }
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
    }).format(amount)
  }

  if (isLoading) {
    return <div>Loading wallets...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load wallets. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Wallets</h2>
        <WalletForm buttonLabel="New Wallet" />
      </div>

      {wallets && wallets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <Card key={wallet._id?.toString()} className={wallet._id?.toString() === currentWalletId ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <CardTitle>{wallet.name}</CardTitle>
                <CardDescription>{wallet._id?.toString() === currentWalletId ? "Current wallet" : ""}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(wallet.balance, wallet.currency)}</div>
                <p className="text-sm text-muted-foreground mt-1">Currency: {wallet.currency}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" disabled={wallet._id?.toString() === currentWalletId} onClick={() => setCurrentWalletId(wallet._id?.toString() || null)}>
                  Set as Current
                </Button>
                <div className="flex gap-2">
                  <WalletForm
                    initialData={{
                      id: wallet._id?.toString() || "",
                      name: wallet.name,
                      balance: wallet.balance,
                      currency: wallet.currency,
                    }}
                    buttonLabel="Edit"
                    variant="outline"
                    size="icon"
                  />
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteWallet(wallet._id?.toString() || "")}>
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Wallets</AlertTitle>
          <AlertDescription>You don&apos;t have any wallets yet. Create your first wallet to get started.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
