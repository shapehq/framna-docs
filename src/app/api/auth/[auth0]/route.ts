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
  oAuthTokenTransferer,
  sessionOAuthTokenRepository,
  sessionProjectRepository,
  logoutHandler
} from "@/composition"

const { SHAPE_DOCS_BASE_URL } = process.env

const afterCallback: AfterCallbackAppRoute = async (_req, session) => {
  await oAuthTokenTransferer.transferAuthTokenForUser(session.user.sub)
  return session
}

const onError: AppRouterOnError = async (error: any) => {
  const url = new URL(SHAPE_DOCS_BASE_URL + "/api/auth/forceLogout")
  return NextResponse.redirect(url)
}

const onLogout: NextAppRouterHandler = async (req: NextRequest, ctx: AppRouteHandlerFnContext) => {
  await Promise.all([
    sessionOAuthTokenRepository.deleteOAuthToken().catch(() => null),
    sessionProjectRepository.deleteProjects().catch(() => null)
  ])
  await logoutHandler()
  return await handleLogout(req, ctx)
}

export const GET = handleAuth({
  callback: handleCallback({ afterCallback }),
  logout: onLogout,
  onError
})
