import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getCollection } from "@/lib/mongodb"
import { COLLECTIONS, Transaction } from "@/lib/schema"

// Helper function to determine if an ID is a mock ID
function isMockId(id: string): boolean {
  return id.includes("65f987d5") || id.startsWith("mock-id-")
}

// GET /api/transactions - Get transactions with optional walletId filter
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const walletId = url.searchParams.get("walletId")

    if (!walletId) {
      return NextResponse.json({ error: "Wallet ID is required" }, { status: 400 })
    }

    if (!ObjectId.isValid(walletId)) {
      return NextResponse.json({ error: "Invalid wallet ID" }, { status: 400 })
    }

    const transactionsCollection = await getCollection(COLLECTIONS.TRANSACTIONS)
    const transactions = await transactionsCollection
      .find({ walletId: new ObjectId(walletId) })
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate required fields
    if (!body.walletId) {
      return NextResponse.json({ error: "Wallet ID is required" }, { status: 400 })
    }

    if (!body.amount || isNaN(body.amount) || body.amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    if (!body.type || !["credit", "debit"].includes(body.type)) {
      return NextResponse.json({ error: "Valid transaction type (credit/debit) is required" }, { status: 400 })
    }

    // Validate walletId format if not mock ID
    if (!isMockId(body.walletId)) {
      try {
        new ObjectId(body.walletId)
      } catch {
        return NextResponse.json({ error: "Invalid wallet ID format" }, { status: 400 })
      }
    }

    // Get wallet to update balance
    const walletCollection = await getCollection(COLLECTIONS.WALLETS)
    const walletQuery = isMockId(body.walletId) ? { _id: body.walletId } : { _id: new ObjectId(body.walletId) }

    const wallet = await walletCollection.findOne(walletQuery)

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Prepare transaction data - use Transaction interface now that it supports string walletId
    const transaction: Omit<Transaction, "_id"> = {
      walletId: isMockId(body.walletId) ? body.walletId : new ObjectId(body.walletId),
      type: body.type,
      amount: Number(body.amount),
      category: body.category || "Other",
      description: body.description || "",
      date: body.date ? new Date(body.date) : new Date(),
      createdAt: new Date(),
    }

    // Create transaction
    const transactionCollection = await getCollection(COLLECTIONS.TRANSACTIONS)
    const result = await transactionCollection.insertOne(transaction)

    // Update wallet balance
    const balanceChange = body.type === "credit" ? body.amount : -body.amount
    await walletCollection.updateOne(walletQuery, {
      $inc: { balance: balanceChange },
      $set: { updatedAt: new Date() },
    })

    // Return the created transaction with the generated ID
    return NextResponse.json({ ...transaction, _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
