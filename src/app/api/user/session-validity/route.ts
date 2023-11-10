import { NextResponse } from "next/server"
import { makeAPIErrorResponse } from "@/common"
import { session, delayedSessionValidator } from "@/composition"

export async function GET() {
  try {
    await session.getUserId()
  } catch {
    return makeAPIErrorResponse(401, "Unauthorized")
  }
  try {
    const sessionValidity = await delayedSessionValidator.validateSession()
    return NextResponse.json({sessionValidity})
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    if (error.message) {
      return makeAPIErrorResponse(500, error.message)
    } else {
      return makeAPIErrorResponse(500, "Unknown error")
    }
  }
}