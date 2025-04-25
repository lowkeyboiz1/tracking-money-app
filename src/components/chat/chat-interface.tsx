"use client"

import { useRef, useEffect, useState } from "react"
import { useAtom } from "jotai"
import { Send, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { currentWalletIdAtom } from "@/lib/store/atoms"
import { MessageItem } from "@/components/chat/message-item"
import { ChatHistory } from "@/components/chat/chat-history"
import { useWallet } from "@/services/query"
import { useChat } from "@/services/query/useChatbotQueries"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ChatInterface() {
  const [currentWalletId] = useAtom(currentWalletIdAtom)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch current wallet
  const { data: wallet } = useWallet(currentWalletId)

  // Use the AI SDK chat hook directly
  const { messages, input, handleInputChange, handleSubmit, isLoading, isClearing, error, clearChatHistory, refreshTransactionsAndWallet } = useChat({
    walletId: currentWalletId || undefined,
  })

  // Handle manual refresh
  const handleRefresh = async () => {
    if (!currentWalletId) return

    setRefreshing(true)
    await refreshTransactionsAndWallet(currentWalletId)
    setRefreshing(false)
  }

  // Auto-scroll to bottom when chat history changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Refresh transactions when messages change (a new message was received)
  useEffect(() => {
    if (currentWalletId && messages.length > 0) {
      // Small delay to ensure the server has completed processing
      const timer = setTimeout(() => {
        refreshTransactionsAndWallet(currentWalletId)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [messages, currentWalletId, refreshTransactionsAndWallet])

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="flex flex-row items-center">
        <div className="flex-1">
          <CardTitle>Chat with your Finance Assistant</CardTitle>
          <CardDescription>
            {wallet
              ? `Currently using: ${wallet.name} (${new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: wallet.currency,
                }).format(wallet.balance)})`
              : "Select a wallet to get started"}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {currentWalletId && (
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          )}
          {currentWalletId && messages.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" disabled={isClearing} aria-label="Clear chat history">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. This will permanently delete all your chat history for this wallet.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearChatHistory}>{isClearing ? "Clearing..." : "Clear history"}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {currentWalletId && <ChatHistory messages={messages} onClearHistory={clearChatHistory} isClearing={isClearing} />}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error.toString()}</AlertDescription>
            </Alert>
          )}

          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Start a conversation by typing a message.</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => (
                <MessageItem key={index} message={message} />
              ))}
              {isLoading && (
                <div className="flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted animate-pulse">
                  <div className="flex gap-2">
                    <span className="font-semibold">Finance Assistant</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words">Thinking...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={currentWalletId ? "Type 'Spent 50k on lunch' or 'Received 100k from Mom'" : "Please select a wallet first"}
            disabled={!currentWalletId || isLoading}
          />
          <Button type="submit" size="icon" disabled={!currentWalletId || isLoading || !input.trim()}>
            <Send className={`h-4 w-4 ${isLoading ? "animate-ping" : ""}`} />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
