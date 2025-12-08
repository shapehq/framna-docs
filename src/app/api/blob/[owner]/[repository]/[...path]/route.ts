import { NextRequest, NextResponse } from "next/server"
import { session, blobProvider } from "@/composition"
import { makeUnauthenticatedAPIErrorResponse } from "@/common"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; repository: string; path: string[] }> }
) {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return makeUnauthenticatedAPIErrorResponse()
  }
  const { path: paramsPath, owner, repository } = await params
  const path = paramsPath.join("/")
  const ref = req.nextUrl.searchParams.get("ref") ?? "main"

  const content = await blobProvider.getFileContent(owner, repository, path, ref)
  if (content === null) {
    return NextResponse.json({ error: `File not found: ${path}` }, { status: 404 })
  }

  const headers = new Headers()
  const imageRegex = /\.(jpg|jpeg|png|webp|avif|gif)$/
  if (imageRegex.test(path)) {
    const cacheExpirationInSeconds = 60 * 60 * 24 * 30 // 30 days
    headers.set("Content-Type", "image/*")
    headers.set("Cache-Control", `max-age=${cacheExpirationInSeconds}`)
  } else {
    headers.set("Content-Type", "text/plain")
  }
  return new NextResponse(content, { status: 200, headers })
}
