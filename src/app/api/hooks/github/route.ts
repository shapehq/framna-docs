import { NextRequest, NextResponse } from "next/server"
import { gitHubHookHandler } from "@/composition"

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  await gitHubHookHandler.handle(req)
  return NextResponse.json({ status: "OK" })
}
