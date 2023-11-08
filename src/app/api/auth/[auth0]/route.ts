import { NextResponse } from "next/server"
import {
  handleAuth,
  handleCallback,
  handleLogout,
  AfterCallbackAppRoute,
  NextAppRouterHandler,
  AppRouterOnError
} from "@auth0/nextjs-auth0"
import { logInHandler, logOutHandler } from "@/composition"

const { SHAPE_DOCS_BASE_URL } = process.env

const afterCallback: AfterCallbackAppRoute = async (_req, session) => {
  await logInHandler.handleLogIn(session.user.sub)
  return session
}

const onError: AppRouterOnError = async (_req, error) => {
  console.error(error)
  const url = new URL(SHAPE_DOCS_BASE_URL + "/api/auth/forceLogout")
  return NextResponse.redirect(url)
}

const onLogout: NextAppRouterHandler = async (req, ctx) => {
  await logOutHandler.handleLogOut()
  return await handleLogout(req, ctx)
}

export const GET = handleAuth({
  callback: handleCallback({ afterCallback }),
  logout: onLogout,
  onError
})
