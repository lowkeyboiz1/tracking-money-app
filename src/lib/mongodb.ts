import { MongoClient, ServerApiVersion, Collection, Document } from "mongodb"

// Replace the placeholder with your MongoDB connection string
const uri = process.env.NEXT_PUBLIC_MONGODB_URI
console.log("MongoDB URI (first 20 chars):", uri ? uri.substring(0, 20) + "..." : "undefined")

// For development without MongoDB, set this to true if no MongoDB URI is provided
let useMockData = !uri
console.log("Using mock data:", useMockData)

// MongoDB client options
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

// Create a MongoClient with a MongoClientOptions object
let client: MongoClient
let clientPromise: Promise<MongoClient> = Promise.resolve({} as MongoClient) // Default placeholder

if (!useMockData && uri) {
  try {
    client = new MongoClient(uri, options)
    // In development mode, use a global variable so that the connection
    // is reused between hot reloads
    if (process.env.NODE_ENV === "development") {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
      }

      if (!globalWithMongo._mongoClientPromise) {
        globalWithMongo._mongoClientPromise = client.connect()
      }
      clientPromise = globalWithMongo._mongoClientPromise
    } else {
      // In production mode, it's best to not use a global variable.
      clientPromise = client.connect()
    }
    console.log("MongoDB client initialized successfully")
  } catch (error) {
    console.error("Error initializing MongoDB client:", error)
    useMockData = true
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

// Mock data collections
const mockWallets = [
  {
    _id: "65f987d5a8d834a71f6e7b1a",
    name: "Ví tiêu hàng ngày",
    balance: 2000000,
    currency: "VND",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "65f987d5a8d834a71f6e7b1b",
    name: "Ví tiết kiệm",
    balance: 10000000,
    currency: "VND",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockTransactions = [
  {
    _id: "65f987d5a8d834a71f6e7b1c",
    walletId: "65f987d5a8d834a71f6e7b1a",
    type: "credit",
    amount: 1500000,
    category: "Income",
    description: "Received salary 1.5M",
    date: new Date(),
    createdAt: new Date(),
  },
  {
    _id: "65f987d5a8d834a71f6e7b1d",
    walletId: "65f987d5a8d834a71f6e7b1a",
    type: "debit",
    amount: 35000,
    category: "Food",
    description: "Spent 35k on breakfast",
    date: new Date(),
    createdAt: new Date(),
  },
]

// Helper function to get the database
export async function getDatabase() {
  if (useMockData) {
    console.log("Using mock data instead of MongoDB connection")
    return null
  }
  try {
    const client = await clientPromise
    return client.db()
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
    console.log("Falling back to mock data due to connection error")
    useMockData = true
    return null
  }
}

// Type for the mock collection to match MongoDB Collection interface
type MockCollection = {
  find: () => {
    toArray: () => Promise<Document[]>
    sort: () => {
      toArray: () => Promise<Document[]>
    }
  }
  findOne: (query: Record<string, unknown>) => Promise<Document | null>
  insertOne: (doc: Document) => Promise<{ insertedId: string }>
  updateOne: (query: Record<string, unknown>, update: Record<string, unknown>) => Promise<{ modifiedCount: number }>
  deleteOne: (query: Record<string, unknown>) => Promise<{ deletedCount: number }>
  deleteMany: () => Promise<{ deletedCount: number }>
  insertMany: (docs: Document[]) => Promise<{ insertedCount: number }>
}

// Helper function to get a collection
export async function getCollection(collectionName: string): Promise<Collection | MockCollection> {
  console.log(`Getting collection: ${collectionName}, useMockData: ${useMockData}`)

  if (useMockData) {
    console.log(`Returning mock collection for ${collectionName}`)
    return {
      find: () => {
        console.log(`Mock find() called for ${collectionName}`)
        return {
          toArray: async () => {
            console.log(`Mock toArray() called for ${collectionName}`)
            if (collectionName === "wallets") {
              console.log("Returning mock wallets:", mockWallets)
              return mockWallets
            }
            if (collectionName === "transactions") {
              console.log("Returning mock transactions:", mockTransactions)
              return mockTransactions
            }
            console.log(`No mock data for collection: ${collectionName}`)
            return []
          },
          sort: () => ({
            toArray: async () => {
              console.log(`Mock sort().toArray() called for ${collectionName}`)
              if (collectionName === "transactions") {
                console.log("Returning sorted mock transactions:", mockTransactions)
                return mockTransactions
              }
              console.log(`No mock data for sorted collection: ${collectionName}`)
              return []
            },
          }),
        }
      },
      findOne: async (query) => {
        console.log(`Mock findOne() called for ${collectionName} with query:`, query)
        if (collectionName === "wallets") {
          const wallet = mockWallets.find((w) => w._id === query._id)
          console.log("Found wallet:", wallet)
          return wallet || null
        }
        return null
      },
      insertOne: async (data: Document) => {
        console.log(`Mock insertOne() called for ${collectionName}:`, data)
        const newId = "mock-id-" + Date.now()
        console.log(`Generated new ID: ${newId}`)
        return { insertedId: newId }
      },
      updateOne: async (query: Record<string, unknown>, update: Record<string, unknown>) => {
        console.log(`Mock updateOne() called for ${collectionName}:`, { query, update })
        return { modifiedCount: 1 }
      },
      deleteOne: async (query: Record<string, unknown>) => {
        console.log(`Mock deleteOne() called for ${collectionName}:`, query)
        return { deletedCount: 1 }
      },
      deleteMany: async () => {
        console.log(`Mock deleteMany() called for ${collectionName}`)
        return { deletedCount: 5 }
      },
      insertMany: async (docs: Document[]) => {
        console.log(`Mock insertMany() called for ${collectionName} with ${docs.length} documents`)
        return { insertedCount: docs.length }
      },
    } as MockCollection
  }

  try {
    const db = await getDatabase()
    if (!db) {
      console.error("Database connection failed")
      throw new Error("Database connection failed")
    }
    return db.collection(collectionName)
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error)
    throw error
  }
}
