import { NextResponse } from "next/server"
import { makeAPIErrorResponse, makeUnauthenticatedAPIErrorResponse } from "@/common"
import { session, repositoryAccessReader } from "@/composition"

export async function GET() {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return makeUnauthenticatedAPIErrorResponse()
  }
  let userId: string
  try {
    userId = await session.getUserId()
  } catch {
    return makeAPIErrorResponse(401, "Unauthorized")
  }
  try {
    const repositoryNames = await repositoryAccessReader.getRepositoryNames(userId)
    return NextResponse.json({repositories: repositoryNames})
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    if (error.message) {
      return makeAPIErrorResponse(500, error.message)
    } else {
      return makeAPIErrorResponse(500, "Unknown error")
    }
  }
}
