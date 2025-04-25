"use client"

import { format } from "date-fns"
import { Menu, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MessageItem } from "@/components/chat/message-item"
import { Message } from "ai"
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

interface ChatHistoryProps {
  messages: Message[]
  onSelectMessage?: (messageId: string) => void
  onClearHistory?: () => void
  isClearing?: boolean
}

export function ChatHistory({ messages, onSelectMessage, onClearHistory, isClearing = false }: ChatHistoryProps) {
  // Group messages by date for better organization
  const groupedMessages: Record<string, Message[]> = {}

  messages.forEach((message) => {
    if (message.role === "system") return

    const date = message.createdAt ? new Date(message.createdAt) : new Date()
    const dateKey = format(date, "yyyy-MM-dd")

    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = []
    }

    groupedMessages[dateKey].push(message)
  })

  // Sort dates newest first
  const sortedDates = Object.keys(groupedMessages).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="View chat history">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Chat History</SheetTitle>

          {sortedDates.length > 0 && onClearHistory && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={isClearing} aria-label="Clear chat history">
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
                  <AlertDialogAction onClick={onClearHistory}>{isClearing ? "Clearing..." : "Clear history"}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          {sortedDates.length === 0 ? (
            <div className="flex justify-center items-center h-20 text-muted-foreground">No chat history available</div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((dateKey) => (
                <div key={dateKey} className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{format(new Date(dateKey), "EEEE, MMMM d, yyyy")}</h3>
                  <div className="space-y-2">
                    {groupedMessages[dateKey].map((message, idx) => (
                      <div key={`msg-${dateKey}-${idx}`} className="relative group" onClick={() => onSelectMessage?.(message.id || "")}>
                        <MessageItem message={message} compact />
                        <div className="text-xs text-muted-foreground mt-1 opacity-70">{message.createdAt && format(new Date(message.createdAt), "HH:mm")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
