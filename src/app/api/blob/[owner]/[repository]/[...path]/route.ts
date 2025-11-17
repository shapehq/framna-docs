import { NextRequest, NextResponse } from "next/server"
import { session, userGitHubClient } from "@/composition"
import { makeUnauthenticatedAPIErrorResponse } from "@/common"

export async function GET(req: NextRequest, { params }: { params: Promise<{ owner: string; repository: string; path: string[] }> }) {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return makeUnauthenticatedAPIErrorResponse()
  }
  const { path: paramsPath, owner, repository } = await params
  const path = paramsPath.join("/")
  const item = await userGitHubClient.getRepositoryContent({
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
