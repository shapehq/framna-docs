import { NextRequest, NextResponse } from "next/server"

const {
  AUTH0_ISSUER_BASE_URL
} = process.env

export async function GET(req: NextRequest) {
  // If we encounter an error during login then we force the user
  // to logout using Auth0's /oidc/logout endpoint as documented here:
  // https://auth0.com/docs/authenticate/login/logout/log-users-out-of-auth0
  // While the documentation states that an id_token_hint or logout_hint
  // should be provided that is not needed as the user is not fully logged
  // in at this point.
  const url = new URL(AUTH0_ISSUER_BASE_URL + "/oidc/logout")
  const host = req.headers.get('host')
  const redirectURI = req.nextUrl.protocol + "//" + host
  url.searchParams.append("post_logout_redirect_uri", redirectURI)

  const response = NextResponse.redirect(url)
  response.cookies.delete("appSession")
  return response
}
