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
  const file = await fetch(url).then(r => r.blob())
  return new NextResponse(file, { status: 200 })
}
