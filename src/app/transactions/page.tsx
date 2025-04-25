import { MainLayout } from "@/components/layout/main-layout"
import { TransactionsList } from "@/components/transactions/transactions-list"
import { TransactionForm } from "@/components/transaction/transaction-form"

export default function TransactionsPage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">Manage and track your income and expenses</p>
          </div>
          <TransactionForm size="default" />
        </div>
        <TransactionsList />
      </div>
    </MainLayout>
  )
}
