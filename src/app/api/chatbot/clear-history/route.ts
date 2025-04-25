import { NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/schema"
import { ObjectId } from "mongodb"

export async function DELETE(req: NextRequest) {
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
    const result = await chatCollection.deleteMany({ walletId: new ObjectId(walletId) })

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error clearing chat history:", error)
    return NextResponse.json({ error: "Failed to clear chat history" }, { status: 500 })
  }
}
