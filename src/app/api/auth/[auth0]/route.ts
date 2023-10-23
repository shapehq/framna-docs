import { NextRequest, NextResponse } from "next/server"
import { handleAuth } from "@auth0/nextjs-auth0"

export const GET = handleAuth({
  async onError(req: NextRequest) {
    const url = req.nextUrl.clone()
    url.pathname = "/api/auth/forceLogout"
    return NextResponse.redirect(url)
  }
})
