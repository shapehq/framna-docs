import { NextRequest, NextResponse } from "next/server"
import { remoteConfigEncoder, session } from "@/composition"
import { env, makeAPIErrorResponse, makeUnauthenticatedAPIErrorResponse } from "@/common"
import { downloadFile, checkIfJsonOrYaml, ErrorName } from "@/common/utils/fileUtils";

interface RemoteSpecificationParams {
  encodedRemoteConfig: string
}

export async function GET(_req: NextRequest, { params }: { params: Promise<RemoteSpecificationParams> }) {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return makeUnauthenticatedAPIErrorResponse()
  }

  const { encodedRemoteConfig } = await params
  const remoteConfig = remoteConfigEncoder.decode(encodedRemoteConfig)

  let url: URL
  try {
    url = new URL(remoteConfig.url)
  } catch {
    return makeAPIErrorResponse(400, "Invalid \"url\" query parameter.")
  }
  try {
    const maxMegabytes = Number(env.getOrThrow("PROXY_API_MAXIMUM_FILE_SIZE_IN_MEGABYTES"))
    const timeoutInSeconds = Number(env.getOrThrow("PROXY_API_TIMEOUT_IN_SECONDS"))
    const maxBytes = maxMegabytes * 1024 * 1024
    
    const fileText = await downloadFile({ 
      url, 
      maxBytes, 
      timeoutInSeconds, 
      basicAuthUsername: remoteConfig.auth?.username, 
      basicAuthPassword: remoteConfig.auth?.password 
    })
    
    checkIfJsonOrYaml(fileText)

    const fileName = url.pathname.split('/').pop()
    
    return new NextResponse(fileText, { 
      status: 200, 
      headers: { 
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${fileName}"` // used for when downloading the file
      }
    })
  } catch (error) {
    if (error instanceof Error == false) {
      return makeAPIErrorResponse(500, "An unknown error occurred.")
    }
    if (error.name === ErrorName.MAX_FILE_SIZE_EXCEEDED) {
      return makeAPIErrorResponse(413, "The operation was aborted.")
    } else if (error.name === ErrorName.TIMEOUT) {
      return makeAPIErrorResponse(408, "The operation timed out.")
    } else if (error.name === ErrorName.NOT_JSON_OR_YAML) {
      return makeAPIErrorResponse(400, error.message)
    } else if (error.name === ErrorName.URL_MAY_NOT_INCLUDE_BASIC_AITH) {
      return makeAPIErrorResponse(400, "Url may not include basic auth.")
    } else {
      return makeAPIErrorResponse(500, error.message)
    }
  }
}
