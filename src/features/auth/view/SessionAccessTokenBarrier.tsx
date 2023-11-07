import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { session, accessTokenService } from "@/composition"

export default async function SessionAccessTokenBarrier({
  children
}: {
  children: ReactNode
}) {
  try {
    const isGuest = await session.getIsGuest()
    if (!isGuest) {
      await accessTokenService.getAccessToken()
    }
    return <>{children}</>
  } catch {
    redirect("/api/auth/logout")
  }
}
