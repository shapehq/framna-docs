import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { session, blockingSessionValidator } from "@/composition"
import ClientSessionBarrier from "./client/SessionBarrier"

const {
  NEXT_PUBLIC_SHAPE_DOCS_TITLE,
  GITHUB_ORGANIZATION_NAME
} = process.env

export default async function SessionBarrier({
  children
}: {
  children: ReactNode
}) {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return redirect("/api/auth/signin")
  }
  const getIsGuest = async () => {
    try {
      return await session.getIsGuest()
    } catch {
      // We assume it's a guest.
      return true
    }
  }
  const isGuest = await getIsGuest()
  const sessionValidity = await blockingSessionValidator.validateSession()
  return (
    <ClientSessionBarrier
      isGuest={isGuest}
      siteName={NEXT_PUBLIC_SHAPE_DOCS_TITLE}
      organizationName={GITHUB_ORGANIZATION_NAME}
      sessionValidity={sessionValidity}
    >
      {children}
    </ClientSessionBarrier>
  )
}
