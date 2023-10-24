import { NextRequest, NextResponse } from "next/server"
import {
  handleAuth,
  handleCallback,
  handleLogout,
  AfterCallbackAppRoute,
  NextAppRouterHandler,
  AppRouteHandlerFnContext,
  AppRouterOnError
} from "@auth0/nextjs-auth0"
import {
  initialOAuthTokenService,
  sessionOAuthTokenRepository
} from "@/composition"

const afterCallback: AfterCallbackAppRoute = async (_req, session) => {
  await initialOAuthTokenService.fetchInitialAuthTokenForUser(session.user.sub)
  return session
}

const onError: AppRouterOnError = async (req: NextRequest) => {
  const url = req.nextUrl.clone()
  url.pathname = "/api/auth/forceLogout"
  return NextResponse.redirect(url)
}

const onLogout: NextAppRouterHandler = async (req: NextRequest, ctx: AppRouteHandlerFnContext) => {
  await sessionOAuthTokenRepository.deleteOAuthToken().catch(() => null)
  return await handleLogout(req, ctx)
}

export const GET = handleAuth({
  callback: handleCallback({ afterCallback }),
  logout: onLogout,
  onError
})
