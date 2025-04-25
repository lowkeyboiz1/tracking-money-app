import { ObjectId } from "mongodb"

// Wallet Schema
export interface Wallet {
  _id?: ObjectId
  userId?: string // if implementing auth
  name: string
  balance: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

// Transaction Schema
export interface Transaction {
  _id?: ObjectId | string
  walletId: ObjectId | string
  type: "credit" | "debit"
  amount: number
  category: string
  description: string
  date: Date
  createdAt: Date
}

// User Schema (Optional - for Auth)
export interface User {
  _id?: ObjectId
  email: string
  name: string
  image?: string // for OAuth profile pictures
  createdAt: Date
  updatedAt: Date
}

// Transaction request body from Chatbot
export interface ParsedTransaction {
  type: "credit" | "debit"
  amount: number
  category?: string
  description: string
}

// ChatMessage Schema
export interface ChatMessage {
  _id?: ObjectId | string
  walletId: ObjectId | string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: Date
}

// Collection Names
export const COLLECTIONS = {
  WALLETS: "wallets",
  TRANSACTIONS: "transactions",
  USERS: "users",
  CHATMESSAGES: "chatmessages",
}
