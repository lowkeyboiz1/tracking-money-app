import { instance } from "@/services/api/instance"

export interface ChatMessageData {
  message: string
  walletId?: string
}

export const chatbotServices = {
  processMessage: async (messageData: ChatMessageData) => {
    return await instance.post("/api/chatbot/process", messageData)
  },
}
