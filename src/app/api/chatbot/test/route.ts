import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test the chatbot API directly
    const response = await fetch("http://localhost:3000/api/chatbot/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "tôi ăn sáng hết 50k vnd",
          },
        ],
        walletId: "680a7b26a0be9d8647bee319",
      }),
    })

    const data = await response.text()

    return NextResponse.json({
      status: response.status,
      response: data,
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
