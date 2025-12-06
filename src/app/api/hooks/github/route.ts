import { NextRequest, NextResponse } from "next/server"
import { gitHubHookHandler } from "@/composition"

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  if (!gitHubHookHandler) {
    return NextResponse.json(
      { error: "GitHub webhooks not available" },
      { status: 404 }
    )
  }
  await gitHubHookHandler.handle(req)
  return NextResponse.json({ status: "OK" })
}