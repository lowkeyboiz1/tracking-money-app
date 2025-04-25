"use client"

import { useState } from "react"
import { useAtom } from "jotai"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { currentWalletIdAtom, transactionsAtom } from "@/lib/store/atoms"
import { TransactionForm } from "@/components/transaction/transaction-form"
import { TransactionFilters } from "@/components/transaction/transaction-filters"
import { useTransactions } from "@/services/query"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FilterValues {
  startDate: string | null
  endDate: string | null
  type: "all" | "credit" | "debit"
  category: string
}

export function TransactionsList() {
  const [currentWalletId] = useAtom(currentWalletIdAtom)
  const [transactions] = useAtom(transactionsAtom) // Use Jotai for real-time updates
  const [filters, setFilters] = useState<FilterValues>({
    startDate: null,
    endDate: null,
    type: "all",
    category: "All Categories",
  })

  // Fetch transactions for the current wallet (will sync with Jotai atoms)
  const { isLoading, error } = useTransactions(currentWalletId)

  // Apply filters to transactions
  const filteredTransactions = transactions
    .filter((transaction) => transaction.walletId === currentWalletId) // Filter for current wallet
    .filter((transaction) => {
      // Filter by transaction type
      if (filters.type !== "all" && transaction.type !== filters.type) {
        return false
      }

      // Filter by category
      if (filters.category !== "All Categories" && transaction.category !== filters.category) {
        return false
      }

      // Filter by date range
      if (filters.startDate) {
        const transactionDate = new Date(transaction.date)
        const startDate = new Date(filters.startDate)
        if (transactionDate < startDate) {
          return false
        }
      }

      if (filters.endDate) {
        const transactionDate = new Date(transaction.date)
        const endDate = new Date(filters.endDate)
        // Add one day to include the end date fully
        endDate.setDate(endDate.getDate() + 1)
        if (transactionDate > endDate) {
          return false
        }
      }

      return true
    })

  // Format currency
  const formatCurrency = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
    }).format(amount)
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
  }

  if (!currentWalletId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Select a wallet to view transactions</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Loading transactions...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription className="text-destructive">Error loading transactions</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your most recent transactions</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <TransactionFilters onFilterChange={handleFilterChange} />
          <TransactionForm variant="outline" />
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length > 0 ? (
          <div className="relative">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction._id?.toString()}>
                      <TableCell>{transaction.date ? format(new Date(transaction.date), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className={`text-right font-medium ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "credit" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">{transactions.some((t) => t.walletId === currentWalletId) ? "No transactions match your filters" : "No transactions found"}</div>
        )}
      </CardContent>
    </Card>
  )
}
