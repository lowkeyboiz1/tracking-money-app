import { ChatInterface } from "@/components/chat/chat-interface"
import { MainLayout } from "@/components/layout/main-layout"
import { TransactionsList } from "@/components/transactions/transactions-list"

export default function Home() {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChatInterface />
        <TransactionsList />
      </div>
    </MainLayout>
  )
}
