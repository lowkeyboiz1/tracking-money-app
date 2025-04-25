import { NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { COLLECTIONS, Wallet } from "@/lib/schema"

// GET /api/wallets - Get all wallets
export async function GET() {
  try {
    console.log("Getting wallets API route called")
    const collection = await getCollection(COLLECTIONS.WALLETS)
    console.log("Got collection:", COLLECTIONS.WALLETS)
    const wallets = await collection.find().toArray()
    console.log("Wallets fetched:", wallets)
    return NextResponse.json(wallets, { status: 200 })
  } catch (error) {
    console.error("Error fetching wallets:", error)
    return NextResponse.json({ error: "Failed to fetch wallets" }, { status: 500 })
  }
}

// POST /api/wallets - Create a new wallet
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Creating wallet with data:", body)

    // Validate request body
    if (!body.name) {
      return NextResponse.json({ error: "Wallet name is required" }, { status: 400 })
    }

    const newWallet: Wallet = {
      name: body.name,
      balance: body.balance || 0,
      currency: body.currency || "VND",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const collection = await getCollection(COLLECTIONS.WALLETS)
    const result = await collection.insertOne(newWallet)
    console.log("Wallet created with ID:", result.insertedId)

    // Return the created wallet with the generated ID
    return NextResponse.json({ ...newWallet, _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating wallet:", error)
    return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 })
  }
}
