"use client"

import { Home, Wallet, PieChart, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/use-sidebar"

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
}

const navItems: NavItem[] = [
  {
    href: "/",
    icon: Home,
    label: "Dashboard",
  },
  {
    href: "/wallets",
    icon: Wallet,
    label: "Wallets",
  },
  {
    href: "/transactions",
    icon: PieChart,
    label: "Transactions",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggleSidebar } = useSidebar()

  return (
    <div className={cn("h-screen border-r bg-card transition-all duration-300 ease-in-out hidden md:block relative", collapsed ? "w-16" : "w-64")}>
      <div className={cn("mb-8 p-4", collapsed && "flex justify-center")}>{!collapsed && <h1 className="text-xl font-bold">Finance Tracker</h1>}</div>

      <button onClick={toggleSidebar} className="absolute -right-3 top-6 bg-background border rounded-full p-1 shadow-md hover:bg-accent">
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className={cn("space-y-2", collapsed && "px-2")}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-lg py-2 text-base transition-colors",
              collapsed ? "justify-center px-2" : "px-3 gap-3",
              pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  )
}
