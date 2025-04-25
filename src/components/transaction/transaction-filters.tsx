"use client"

import { useState } from "react"
import { Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const categories = ["All Categories", "Food", "Transportation", "Shopping", "Entertainment", "Bills", "Income", "Gifts", "Other"]

interface TransactionFiltersProps {
  onFilterChange: (filters: FilterValues) => void
}

interface FilterValues {
  startDate: string | null
  endDate: string | null
  type: "all" | "credit" | "debit"
  category: string
}

export function TransactionFilters({ onFilterChange }: TransactionFiltersProps) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({
    startDate: null,
    endDate: null,
    type: "all",
    category: "All Categories",
  })

  const handleChange = (name: keyof FilterValues, value: string | null) => {
    const newFilters = {
      ...filters,
      [name]: value,
    } as FilterValues
    setFilters(newFilters)
  }

  const handleApply = () => {
    onFilterChange(filters)
    setOpen(false)
  }

  const handleReset = () => {
    const resetFilters: FilterValues = {
      startDate: null,
      endDate: null,
      type: "all",
      category: "All Categories",
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Transactions</SheetTitle>
          <SheetDescription>Narrow down transactions by date, type, or category.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="dateRange">Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startDate" className="text-xs">
                  From
                </Label>
                <Input id="startDate" type="date" value={filters.startDate || ""} onChange={(e) => handleChange("startDate", e.target.value || null)} />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs">
                  To
                </Label>
                <Input id="endDate" type="date" value={filters.endDate || ""} onChange={(e) => handleChange("endDate", e.target.value || null)} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select onValueChange={(value) => handleChange("type", value as "all" | "credit" | "debit")} value={filters.type}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Income</SelectItem>
                <SelectItem value="debit">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => handleChange("category", value)} value={filters.category}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
