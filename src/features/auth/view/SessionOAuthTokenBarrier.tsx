import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { session, oAuthTokenRepository } from "@/composition"

export default async function SessionOAuthTokenBarrier({
  children
}: {
  children: ReactNode
}) {
  try {
    const userId = await session.getUserId()
    await oAuthTokenRepository.get(userId)
    return <>{children}</>
  } catch {
    redirect("/api/auth/logout")
  }
}
