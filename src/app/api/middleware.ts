import { NextRequest, NextResponse } from "next/server"

export interface ApiError extends Error {
  status?: number
}

export function createApiError(message: string, status: number = 500): ApiError {
  const error = new Error(message) as ApiError
  error.status = status
  return error
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error)

  if (error instanceof Error) {
    const apiError = error as ApiError
    const status = apiError.status || 500

    return NextResponse.json({ error: apiError.message || "An unexpected error occurred" }, { status })
  }

  return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
}

export function withErrorHandling(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(req, ...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}
