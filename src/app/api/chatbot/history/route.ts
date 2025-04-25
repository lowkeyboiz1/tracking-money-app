import { NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/schema"
import { ObjectId } from "mongodb"

// GET /api/chatbot/history?walletId=xxx
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const walletId = url.searchParams.get("walletId")

    if (!walletId) {
      return NextResponse.json({ error: "WalletId is required" }, { status: 400 })
    }

    if (!ObjectId.isValid(walletId)) {
      return NextResponse.json({ error: "Invalid wallet ID" }, { status: 400 })
    }

    const chatCollection = await getCollection(COLLECTIONS.CHATMESSAGES)
    const messages = await chatCollection
      .find({ walletId: new ObjectId(walletId) })
      .sort({ createdAt: 1 })
      .toArray()

    // Format messages to be compatible with the Vercel AI SDK message format
    const formattedMessages = messages.map((msg) => ({
      id: msg._id.toString(),
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 })
  }
}
