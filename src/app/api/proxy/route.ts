import { NextRequest, NextResponse } from "next/server"
import { makeAPIErrorResponse, makeUnauthenticatedAPIErrorResponse } from "@/common"
import { session } from "@/composition"

export async function GET(req: NextRequest) {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return makeUnauthenticatedAPIErrorResponse()
  }
  const rawURL = req.nextUrl.searchParams.get("url")
  if (!rawURL) {
    return makeAPIErrorResponse(400, "Missing \"url\" query parameter.")
  }
  let url: URL
  try {
    url = new URL(rawURL)
  } catch {
    return makeAPIErrorResponse(400, "Invalid \"url\" query parameter.")
  }
  try {
    const maxBytes = 10 * 1024 * 1024 // 10 MB
    const file = await downloadFile({ url, maxBytes })
    console.log("Downloaded")
    return new NextResponse(file, { status: 200 })
  } catch (error) {
    if (error instanceof Error == false) {
      return makeAPIErrorResponse(500, "An unknown error occurred.")
    }
    if (error.name === "AbortError") {
      return makeAPIErrorResponse(413, "The operation was aborted.")
    } else if (error.name === "TimeoutError") {
      return makeAPIErrorResponse(408, "The operation timed out.")
    } else {
      return makeAPIErrorResponse(500, error.message)
    }
  }
}

async function downloadFile(params: { url: URL, maxBytes: number }): Promise<Blob> {
  const { url, maxBytes } = params
  const abortController = new AbortController()
  const timeoutSignal = AbortSignal.timeout(30 * 1000)
  const response = await fetch(url, {
    signal: AbortSignal.any([abortController.signal, timeoutSignal])
  })
  if (!response.body) {
    throw new Error("Response body unavailable")
  }
  let totalBytes = 0
  const reader = response.body.getReader()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    totalBytes += value.length
    if (totalBytes >= maxBytes) {
      abortController.abort()
      break
    }
  }
  return await response.blob()
}
