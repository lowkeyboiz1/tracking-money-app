import { NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { COLLECTIONS, Wallet } from "@/lib/schema"
import { ObjectId } from "mongodb"

// Define the params type
type Params = Promise<{ id: string }>

// GET /api/wallets/[id] - Get a specific wallet
export async function GET(request: NextRequest, context: { params: Params }) {
  try {
    const params = await context.params
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Wallet ID is required" }, { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid wallet ID" }, { status: 400 })
    }

    const walletCollection = await getCollection(COLLECTIONS.WALLETS)
    const wallet = await walletCollection.findOne({ _id: new ObjectId(id) })

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    return NextResponse.json(wallet)
  } catch (error) {
    console.error("Error fetching wallet:", error)
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 })
  }
}

// PATCH /api/wallets/[id] - Update a wallet
export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    const params = await context.params
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid wallet ID" }, { status: 400 })
    }

    const body = await req.json()
    const updateData: Partial<Wallet> = {}

    // Only allow updating certain fields
    if (body.name !== undefined) updateData.name = body.name
    if (body.balance !== undefined) updateData.balance = body.balance
    if (body.currency !== undefined) updateData.currency = body.currency

    // Always update the updatedAt field
    updateData.updatedAt = new Date()

    // Don't proceed if there's nothing to update
    if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
      return NextResponse.json({ error: "No valid update fields provided" }, { status: 400 })
    }

    const collection = await getCollection(COLLECTIONS.WALLETS)
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Get the updated wallet
    const updatedWallet = await collection.findOne({ _id: new ObjectId(id) })

    return NextResponse.json(updatedWallet, { status: 200 })
  } catch (error) {
    console.error("Error updating wallet:", error)
    return NextResponse.json({ error: "Failed to update wallet" }, { status: 500 })
  }
}

// DELETE /api/wallets/[id] - Delete a wallet
export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    const params = await context.params
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid wallet ID" }, { status: 400 })
    }

    const collection = await getCollection(COLLECTIONS.WALLETS)
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Also delete all transactions associated with this wallet
    const transactionsCollection = await getCollection(COLLECTIONS.TRANSACTIONS)
    await transactionsCollection.deleteMany({ walletId: new ObjectId(id) })

    return NextResponse.json({ message: "Wallet and associated transactions deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting wallet:", error)
    return NextResponse.json({ error: "Failed to delete wallet" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: Params }) {
  try {
    const params = await context.params
    const id = params.id
    const body = await req.json()
    const { name, balance, currency } = body

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid wallet ID" }, { status: 400 })
    }

    const collection = await getCollection(COLLECTIONS.WALLETS)
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { name, balance, currency } })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    const updatedWallet = await collection.findOne({ _id: new ObjectId(id) })

    return NextResponse.json(updatedWallet, { status: 200 })
  } catch (error) {
    console.error("Error updating wallet:", error)
    return NextResponse.json({ error: "Failed to update wallet" }, { status: 500 })
  }
}
