import { NextRequest, NextResponse } from "next/server"
import { session, userGitHubClient } from "@/composition"
import { makeUnauthenticatedAPIErrorResponse } from "@/common"
import { revalidatePath } from "next/cache"


interface GetBlobParams {
  owner: string
  repository: string
  path: [string]
}

export async function GET(req: NextRequest, { params }: { params: Promise<GetBlobParams> } ) {
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
  const res = await fetch(url, { next: { revalidate: 6000 } })
  const file = await res.blob()
  revalidatePath('/(authed)/projects')
  const headers = new Headers()
  if (res.status !== 200) {
    headers.set("Content-Type", "text/plain");
    headers.set("Cache-Control", `max-age=3000`)
  }
  if (new RegExp(imageRegex).exec(path)) {
    const cacheExpirationInSeconds = 60 * 60 * 24 * 30 // 30 days
    headers.set("Content-Type", "image/*");
    headers.set("Cache-Control", `max-age=${cacheExpirationInSeconds}`)
  } 
  return new NextResponse(file, { status: 200, headers })
}
