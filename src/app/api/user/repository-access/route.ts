import { NextResponse } from "next/server"
import { makeAPIErrorResponse } from "@/common"
import { session, guestRepositoryAccessReader } from "@/composition"

export async function GET() {
  let userId: string
  try {
    userId = await session.getUserId()
  } catch {
    return makeAPIErrorResponse(401, "Unauthorized")
  }
  try {
    const repositoryNames = await guestRepositoryAccessReader.getRepositoryNames(userId)
    return NextResponse.json({repositories: repositoryNames})
  } catch (error: any) {
    if (error.message) {
      return makeAPIErrorResponse(500, error.message)
    } else {
      return makeAPIErrorResponse(500, "Unknown error")
    }
  }
}
