export { default } from "next-auth/middleware"

export const config = {
  matcher: "/((?!api/hooks|api/auth/signout|_next/static|_next/image|images|favicon.ico).*)"
}
