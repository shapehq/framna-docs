import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge"

export const config = {
  matcher: "/((?!api/hooks|api/auth/logout|api/auth/forceLogout).*)"
}

export default withMiddlewareAuthRequired()
