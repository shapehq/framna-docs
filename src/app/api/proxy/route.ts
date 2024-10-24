import { NextRequest, NextResponse } from "next/server"
import { makeAPIErrorResponse, makeUnauthenticatedAPIErrorResponse } from "@/common"
import { session } from "@/composition"
import { env } from "@/common"

const ErrorName = {
  MAX_FILE_SIZE_EXCEEDED: "MaxFileSizeExceededError",
  TIMEOUT: "TimeoutError"
}

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
    const maxMegabytes = Number(env.getOrThrow("PROXY_API_MAXIMUM_FILE_SIZE_IN_MEGABYTES"))
    const timeoutInSeconds = Number(env.getOrThrow("PROXY_API_TIMEOUT_IN_SECONDS"))
    const maxBytes = maxMegabytes * 1024 * 1024
    const file = await downloadFile({ url, maxBytes, timeoutInSeconds })
    return new NextResponse(file, { status: 200 })
  } catch (error) {
    console.log(error)
    if (error instanceof Error == false) {
      return makeAPIErrorResponse(500, "An unknown error occurred.")
    }
    if (error.name === ErrorName.MAX_FILE_SIZE_EXCEEDED) {
      return makeAPIErrorResponse(413, "The operation was aborted.")
    } else if (error.name === ErrorName.TIMEOUT) {
      return makeAPIErrorResponse(408, "The operation timed out.")
    } else {
      return makeAPIErrorResponse(500, error.message)
    }
  }
}

async function downloadFile(params: {
  url: URL,
  maxBytes: number,
  timeoutInSeconds: number
}): Promise<Blob> {
  const { url, maxBytes, timeoutInSeconds } = params
  const abortController = new AbortController()
  const timeoutSignal = AbortSignal.timeout(timeoutInSeconds * 1000)
  const response = await fetch(url, {
    signal: AbortSignal.any([abortController.signal, timeoutSignal])
  })
  if (!response.body) {
    throw new Error("Response body unavailable")
  }
  let totalBytes = 0
  let didExceedMaxBytes = false
  const reader = response.body.getReader()
  let chunks: Uint8Array[] = []
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    totalBytes += value.length
    chunks.push(value)
    if (totalBytes >= maxBytes) {
      didExceedMaxBytes = true
      abortController.abort()
      break
    }
  }
  if (didExceedMaxBytes) {
    const error = new Error("Maximum file size exceeded")
    error.name = ErrorName.MAX_FILE_SIZE_EXCEEDED
    throw error
  }
  return new Blob(chunks)
}
