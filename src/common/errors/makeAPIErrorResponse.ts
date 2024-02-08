import { NextResponse } from "next/server"

export default function makeAPIErrorResponse(
  status: number,
  message: string
): NextResponse {
  return NextResponse.json({ status, message }, { status })
}

export function makeUnauthenticatedAPIErrorResponse(): NextResponse {
  return makeAPIErrorResponse(401, "Unauthenticated")
}
