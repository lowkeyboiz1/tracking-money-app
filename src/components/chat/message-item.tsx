"use client"

import { ChatMessage } from "@/lib/store/atoms"
import { cn } from "@/lib/utils"
import { Message } from "ai"

interface MessageItemProps {
  message: ChatMessage | Message
  compact?: boolean
}

export function MessageItem({ message, compact = false }: MessageItemProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn("flex w-full max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm", isUser ? "ml-auto w-fit bg-primary text-primary-foreground" : "bg-muted", compact && "w-full max-w-full")}
    >
      <div className="flex gap-2">
        <span className={cn("font-semibold", isUser && "text-primary-foreground")}>{isUser ? "You" : "Finance Assistant"}</span>
      </div>
      <p className="whitespace-pre-wrap break-words">{message.content}</p>
    </div>
  )
}
