import { NextRequest, NextResponse } from "next/server"
import { encryptionService, session } from "@/composition"
import { env, makeAPIErrorResponse, makeUnauthenticatedAPIErrorResponse } from "@/common"
import { z } from 'zod';
import { downloadFile, checkIfJsonOrYaml, ErrorName } from "@/common/utils/fileUtils";

interface RemoteSpecificationParams {
  encryptedRemoteConfig: string // encrypted and URL encoded JSON string
}

const RemoteSpecAuthSchema = z.object({
  type: z.string(),
  username: z.string(),
  password: z.string(),
});
type RemoteSpecAuth = z.infer<typeof RemoteSpecAuthSchema>;

const RemoteConfigSchema = z.object({
  url: z.string().url(),
  auth: RemoteSpecAuthSchema.optional(),
});
type RemoteConfig = z.infer<typeof RemoteConfigSchema>;

export async function GET(req: NextRequest, { params }: { params: RemoteSpecificationParams }) {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return makeUnauthenticatedAPIErrorResponse()
  }

  const decodedEncryptedRemoteConfig = decodeURIComponent(params.encryptedRemoteConfig)

  const decryptedRemoteConfig = encryptionService.decrypt(decodedEncryptedRemoteConfig)

  const remoteConfig = RemoteConfigSchema.parse(JSON.parse(decryptedRemoteConfig))

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
