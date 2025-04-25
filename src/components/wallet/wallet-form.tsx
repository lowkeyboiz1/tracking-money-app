"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PlusCircle, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateWallet, useUpdateWallet } from "@/services/query"

const walletFormSchema = z.object({
  name: z.string().min(1, "Wallet name is required"),
  balance: z.coerce.number().min(0, "Balance must be 0 or greater"),
  currency: z.string().min(1, "Currency is required"),
})

type WalletFormValues = z.infer<typeof walletFormSchema>

interface WalletFormProps {
  initialData?: {
    id: string
    name: string
    balance: number
    currency: string
  }
  buttonLabel?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  icon?: "plus" | "edit"
}

export function WalletForm({ initialData, buttonLabel = "Create Wallet", variant = "default", size = "default", className = "", icon = initialData ? "edit" : "plus" }: WalletFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const createWallet = useCreateWallet()
  const updateWallet = useUpdateWallet()

  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: initialData || {
      name: "",
      balance: 0,
      currency: "USD",
    },
  })

  const onSubmit = async (values: WalletFormValues) => {
    try {
      setLoading(true)

      if (initialData) {
        await updateWallet.mutateAsync({ walletId: initialData.id, walletData: values })
      } else {
        await createWallet.mutateAsync(values)
      }

      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Failed to save wallet:", error)
    } finally {
      setLoading(false)
    }
  }

  // Determine which icon to use
  const IconComponent = icon === "edit" ? Pencil : PlusCircle

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`gap-2 ${className}`} variant={variant} size={size}>
          <IconComponent className="h-4 w-4" />
          {size !== "icon" && buttonLabel}
          {size === "icon" && <span className="sr-only">{buttonLabel}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Wallet" : "Create Wallet"}</DialogTitle>
          <DialogDescription>{initialData ? "Make changes to your wallet" : "Add a new wallet to track your finances"}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Account" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Balance</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="VND">VND</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : initialData ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
