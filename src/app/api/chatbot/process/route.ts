import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextRequest } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/schema"
import { ObjectId } from "mongodb"

// Giới hạn thời gian xử lý tối đa 30 giây
export const maxDuration = 30

// Store message in database
async function saveMessage(message: Omit<{ walletId: ObjectId; role: string; content: string; createdAt: Date }, "_id">) {
  try {
    const chatCollection = await getCollection(COLLECTIONS.CHATMESSAGES)
    await chatCollection.insertOne({
      ...message,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Error saving chat message:", error)
  }
}

// Use AI to detect transaction
async function detectTransaction(message: string) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a transaction analyzer. Analyze if the message describes one or more financial transactions. " +
              "A user might describe multiple transactions in a single message (e.g., 'I received 100k and spent 50k'). " +
              "Extract all transactions and return them in an array. " +
              "Respond in JSON format with the following structure: " +
              '{"transactions": [{"type": "income" or "expense", "amount": number, "category": string}]}. ' +
              "For Vietnamese currency, handle 'k' as thousands, 'm' or 'tr' as millions. " +
              "Examples: " +
              '"ăn sáng hết 10k" → {"transactions": [{"type": "expense", "amount": 10000, "category": "Food"}]}, ' +
              '"nhận lương 5tr" → {"transactions": [{"type": "income", "amount": 5000000, "category": "Income"}]}, ' +
              '"mẹ tôi cho tôi 100k và tôi cho ba 10k" → {"transactions": [{"type": "income", "amount": 100000, "category": "Income"}, {"type": "expense", "amount": 10000, "category": "Personal"}]}',
          },
          {
            role: "user",
            content: message,
          },
        ],
        response_format: { type: "json_object" },
      }),
    })

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  } catch (error) {
    console.error("Error detecting transaction:", error)
    return { transactions: [] }
  }
}

// Define transaction type
interface Transaction {
  type: "income" | "expense"
  amount: number
  category: string
}

interface DetectedTransactions {
  transactions: Transaction[]
}

// Process transactions from user message
async function processTransactions(detectedTransactions: DetectedTransactions, walletId: string, userMessage: string) {
  try {
    if (!detectedTransactions.transactions || detectedTransactions.transactions.length === 0) {
      return {
        success: false,
        error: "No valid transactions detected",
      }
    }

    const transactionCollection = await getCollection(COLLECTIONS.TRANSACTIONS)
    const walletCollection = await getCollection(COLLECTIONS.WALLETS)
    let totalBalanceChange = 0
    const processedTransactions = []

    // Process each transaction
    for (const transaction of detectedTransactions.transactions) {
      // Map AI transaction type to database transaction type
      const type = transaction.type === "income" ? "credit" : "debit"

      // Create transaction with userMessage as context
      const transactionData = {
        walletId: new ObjectId(walletId),
        type,
        amount: transaction.amount,
        category: transaction.category || (type === "credit" ? "Income" : "Expense"),
        description: userMessage, // Use the original user message as context
        date: new Date(),
        createdAt: new Date(),
      }

      const result = await transactionCollection.insertOne(transactionData)

      // Calculate balance change
      const balanceChange = type === "credit" ? transaction.amount : -transaction.amount
      totalBalanceChange += balanceChange

      processedTransactions.push({
        ...transactionData,
        _id: result.insertedId,
      })
    }

    // Update wallet balance once with the total change
    await walletCollection.updateOne(
      { _id: new ObjectId(walletId) },
      {
        $inc: { balance: totalBalanceChange },
        $set: { updatedAt: new Date() },
      }
    )

    return {
      success: true,
      transactions: processedTransactions,
      totalBalanceChange,
    }
  } catch (error) {
    console.error("Error processing transactions:", error instanceof Error ? error.message : String(error))
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error processing transactions",
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json()
    const { messages, walletId } = body

    console.log({ messages, walletId })

    if (!messages) {
      return new Response(JSON.stringify({ error: "Tin nhắn không được để trống" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!walletId) {
      return new Response(JSON.stringify({ error: "WalletId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!ObjectId.isValid(walletId)) {
      return new Response(JSON.stringify({ error: "Invalid wallet ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get wallet information
    const walletCollection = await getCollection(COLLECTIONS.WALLETS)
    let wallet = await walletCollection.findOne({ _id: new ObjectId(walletId) })

    if (!wallet) {
      return new Response(JSON.stringify({ error: "Wallet not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Ensure wallet has necessary properties if null
    const walletCurrency = wallet.currency || "VND"

    // Save the user message to database
    const lastUserMessage = messages[messages.length - 1]
    if (lastUserMessage.role === "user") {
      await saveMessage({
        walletId: new ObjectId(walletId),
        role: lastUserMessage.role,
        content: lastUserMessage.content,
        createdAt: new Date(),
      })

      // Use AI to detect transactions
      const transactionResult = await detectTransaction(lastUserMessage.content)

      if (transactionResult.transactions && transactionResult.transactions.length > 0) {
        // Process all detected transactions
        const processResult = await processTransactions(transactionResult, walletId, lastUserMessage.content)

        // If transactions were processed successfully
        if (processResult.success && processResult.transactions) {
          // Get updated wallet information - this is critical for accurate balance
          const updatedWallet = await walletCollection.findOne({ _id: new ObjectId(walletId) })

          // Use updated wallet if available, otherwise use the existing one
          if (updatedWallet) {
            wallet = updatedWallet
          }

          // Format transaction summary for the system message
          let transactionSummary = ""
          if (processResult.transactions.length === 1) {
            const tx = processResult.transactions[0]
            const transactionType = tx.type === "credit" ? "được cộng" : "bị trừ"
            const formattedAmount = new Intl.NumberFormat("vi-VN").format(tx.amount)
            transactionSummary = `Giao dịch đã được xử lý: ${transactionType} ${formattedAmount} ${walletCurrency}.`
          } else {
            // Multiple transactions
            const incomeTransactions = processResult.transactions.filter((tx) => tx.type === "credit")
            const expenseTransactions = processResult.transactions.filter((tx) => tx.type === "debit")

            if (incomeTransactions.length > 0) {
              const totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0)
              const formattedIncome = new Intl.NumberFormat("vi-VN").format(totalIncome)
              transactionSummary += `Được cộng tổng cộng ${formattedIncome} ${walletCurrency}. `
            }

            if (expenseTransactions.length > 0) {
              const totalExpense = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0)
              const formattedExpense = new Intl.NumberFormat("vi-VN").format(totalExpense)
              transactionSummary += `Bị trừ tổng cộng ${formattedExpense} ${walletCurrency}. `
            }
          }

          // Create a fresh copy of messages without system messages
          const userMessages = messages.filter((m: { role: string }) => m.role !== "system")

          // Transaction response system prompt
          const responseMessages = [
            {
              role: "system",
              content: `You are a helpful finance assistant. Reply in Vietnamese.

IMPORTANT INSTRUCTIONS:
1. The wallet balance has ALREADY been updated in our system after processing the transactions.
2. Current wallet balance is now: ${wallet.balance} ${walletCurrency}.
3. DO NOT do any mathematical operations or calculations.
4. DO NOT try to add/subtract transaction amounts to/from the balance.
5. DO NOT show any calculations like "X + Y - Z = W".

Your response should follow this EXACT template:
"Tôi đã xử lý các giao dịch của bạn. ${transactionSummary}

Số dư mới trong ví của bạn là: ${wallet.balance} ${walletCurrency}.

Bạn cần hỗ trợ gì khác không?"
`,
            },
            ...userMessages,
          ]

          // Use streamText to handle the OpenAI streaming
          const result = await streamText({
            model: openai.chat("gpt-3.5-turbo"),
            messages: responseMessages,
          })

          return result.toDataStreamResponse()
        }
      }
    }

    // Make sure we have the latest wallet data
    const freshWallet = await walletCollection.findOne({ _id: new ObjectId(walletId) })
    if (freshWallet) {
      wallet = freshWallet
    }

    // Always create a fresh system message with current balance
    const systemMessage = {
      role: "system",
      content: `You are a helpful finance assistant. Reply in Vietnamese.

IMPORTANT INSTRUCTIONS:
1. The wallet balance is: ${wallet.balance} ${walletCurrency}.
2. DO NOT do any mathematical operations or calculations.
3. If the user asks about their balance, your answer should be EXACTLY:
   "Số dư hiện tại của bạn là ${wallet.balance} ${walletCurrency}."

You can process and respond to other Vietnamese or English commands normally.`,
    }

    // Remove any existing system messages and add our fresh one
    const userMessages = messages.filter((m: { role: string }) => m.role !== "system")
    const augmentedMessages = [systemMessage, ...userMessages]

    // Use streamText to handle the OpenAI streaming
    const result = await streamText({
      model: openai.chat("gpt-3.5-turbo"),
      messages: augmentedMessages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Lỗi OpenAI:", error)
    return new Response(JSON.stringify({ error: "Lỗi xử lý yêu cầu" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
