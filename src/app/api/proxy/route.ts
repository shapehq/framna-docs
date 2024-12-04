import { NextRequest, NextResponse } from "next/server"
import { env, makeAPIErrorResponse, makeUnauthenticatedAPIErrorResponse } from "@/common"
import { session } from "@/composition"
import { downloadFile } from "../remotes/[encodedRemoteSpecification]/downloadFile"
import { checkIfJsonOrYaml } from "../remotes/[encodedRemoteSpecification]/checkIfJsonOrYaml"

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
