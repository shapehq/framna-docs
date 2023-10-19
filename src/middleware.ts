import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge"

export const config = {
  matcher: '/((?!api/hooks).*)' // do not apply to api routes
}

export default withMiddlewareAuthRequired()
