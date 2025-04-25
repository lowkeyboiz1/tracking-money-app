import { MainLayout } from "@/components/layout/main-layout"
import { WalletsList } from "@/components/wallet/wallets-list"

export default function WalletsPage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
          <p className="text-muted-foreground">Manage your wallets and track your balances</p>
        </div>
        <WalletsList />
      </div>
    </MainLayout>
  )
}
