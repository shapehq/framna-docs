import { NextRequest, NextResponse } from "next/server"
import { env, makeAPIErrorResponse, makeUnauthenticatedAPIErrorResponse } from "@/common"
import { session } from "@/composition"
import { parse as parseYaml } from "yaml"

const ErrorName = {
  MAX_FILE_SIZE_EXCEEDED: "MaxFileSizeExceededError",
  TIMEOUT: "TimeoutError",
  NOT_JSON_OR_YAML: "NotJsonOrYamlError",
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
    const fileText = await downloadFile({ url, maxBytes, timeoutInSeconds })
    checkIfJsonOrYaml(fileText)
    return new NextResponse(fileText, { status: 200, headers: { "Content-Type": "text/plain" } })
  } catch (error) {
    if (error instanceof Error == false) {
      return makeAPIErrorResponse(500, "An unknown error occurred.")
    }
    if (error.name === ErrorName.MAX_FILE_SIZE_EXCEEDED) {
      return makeAPIErrorResponse(413, "The operation was aborted.")
    } else if (error.name === ErrorName.TIMEOUT) {
      return makeAPIErrorResponse(408, "The operation timed out.")
    } else if (error.name === ErrorName.NOT_JSON_OR_YAML) {
      return makeAPIErrorResponse(400, "Url does not point to a JSON or YAML file.")
    } else {
      return makeAPIErrorResponse(500, error.message)
    }
  }
}

async function downloadFile(params: {
  url: URL,
  maxBytes: number,
  timeoutInSeconds: number
}): Promise<string> {
  const { url, maxBytes, timeoutInSeconds } = params
  const abortController = new AbortController()
  const timeoutSignal = AbortSignal.timeout(timeoutInSeconds * 1000)
  const headers: {[key: string]: string} = {}
  // Extract basic auth from URL and construct an Authorization header instead.
  if ((url.username && url.username.length > 0) || (url.password && url.password.length > 0)) {
    const username = decodeURIComponent(url.username)
    const password = decodeURIComponent(url.password)
    headers["Authorization"] = "Basic " + btoa(`${username}:${password}`)
  }
  // Make sure basic auth is removed from URL.
  const urlWithoutAuth = url
  urlWithoutAuth.username = ""
  urlWithoutAuth.password = ""
  const response = await fetch(urlWithoutAuth, {
    method: "GET",
    headers,
    signal: AbortSignal.any([abortController.signal, timeoutSignal])
  })
  if (!response.body) {
    throw new Error("Response body unavailable")
  }
  let totalBytes = 0
  let didExceedMaxBytes = false
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
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
  const blob = new Blob(chunks)
  const arrayBuffer = await blob.arrayBuffer()
  const decoder = new TextDecoder()
  return decoder.decode(arrayBuffer)
}

function checkIfJsonOrYaml(fileText: string) {
  try {
    parseYaml(fileText) // will also parse JSON as it is a subset of YAML
  } catch {
    const error = new Error("File is not JSON or YAML")
    error.name = ErrorName.NOT_JSON_OR_YAML
    throw error
  }
}
