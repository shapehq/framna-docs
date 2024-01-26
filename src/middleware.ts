import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge"

export const config = {
  matcher: "/((?!api/hooks|api/auth/logout|api/auth/forceLogout|api/health|_next/static|_next/image|images|favicon.ico).*)"
}

export default withMiddlewareAuthRequired()
