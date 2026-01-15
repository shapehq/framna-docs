import { NextRequest, NextResponse } from "next/server"
import { session, userGitHubClient } from "@/composition"
import { makeUnauthenticatedAPIErrorResponse, env } from "@/common"
import { getSessionFromRequest } from "@/app/api/cli/middleware"
import { createFullGitHubClientForCLI } from "@/app/api/cli/helpers"
import { RedisMCPSessionStore } from "@/features/mcp/data/RedisMCPSessionStore"
import RedisKeyValueStore from "@/common/key-value-store/RedisKeyValueStore"

async function getCLIGitHubClient(req: NextRequest) {
  const sessionId = getSessionFromRequest(req)
  if (!sessionId) return null
  const store = new RedisMCPSessionStore({
    store: new RedisKeyValueStore(env.getOrThrow("REDIS_URL"))
  })
  const cliSession = await store.get(sessionId)
  if (!cliSession) return null
  return createFullGitHubClientForCLI(cliSession.accessToken)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ owner: string; repository: string; path: string[] }> }) {
  // Try web session first, then CLI session
  const isWebAuthenticated = await session.getIsAuthenticated()
  const cliGitHubClient = !isWebAuthenticated ? await getCLIGitHubClient(req) : null

  if (!isWebAuthenticated && !cliGitHubClient) {
    return makeUnauthenticatedAPIErrorResponse()
  }

  const gitHubClient = cliGitHubClient || userGitHubClient
  const { path: paramsPath, owner, repository } = await params
  const path = paramsPath.join("/")
  const item = await gitHubClient.getRepositoryContent({
    repositoryOwner: owner,
    repositoryName: repository,
    path: path,
    ref: req.nextUrl.searchParams.get("ref") ?? undefined
  })
  const url = new URL(item.downloadURL)
  const imageRegex = /\.(jpg|jpeg|png|webp|avif|gif)$/;
  const file = await fetch(url).then(r => r.blob())
  const headers = new Headers()
  if (new RegExp(imageRegex).exec(path)) {
    const cacheExpirationInSeconds = 60 * 60 * 24 * 30 // 30 days
    headers.set("Content-Type", "image/*");
    headers.set("Cache-Control", `max-age=${cacheExpirationInSeconds}`)
  } else {
    headers.set("Content-Type", "text/plain");
  }
  return new NextResponse(file, { status: 200, headers })
}
