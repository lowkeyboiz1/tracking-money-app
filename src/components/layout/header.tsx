"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WalletSelector } from "@/components/wallet/wallet-selector"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { useSidebar } from "@/hooks/use-sidebar"

export function Header() {
  const { setCollapsed } = useSidebar()

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile sidebar trigger */}
        <Sheet
          onOpenChange={(open) => {
            // When the sheet is closed, ensure the sidebar is expanded for mobile view
            if (!open) {
              setCollapsed(false)
            }
          }}
        >
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Wallet selector */}
        <div className="ml-auto">
          <WalletSelector />
        </div>
      </div>
    </header>
  )
}
