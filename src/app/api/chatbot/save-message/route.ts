import { NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/schema"
import { ObjectId } from "mongodb"

export async function POST(req: NextRequest) {
  try {
    const { message, walletId } = await req.json()

    if (!message || !walletId) {
      return NextResponse.json({ error: "Message and walletId are required" }, { status: 400 })
    }

    if (!ObjectId.isValid(walletId)) {
      return NextResponse.json({ error: "Invalid wallet ID" }, { status: 400 })
    }

    const chatCollection = await getCollection(COLLECTIONS.CHATMESSAGES)
    await chatCollection.insertOne({
      walletId: new ObjectId(walletId),
      role: "assistant",
      content: message,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving assistant message:", error)
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}
