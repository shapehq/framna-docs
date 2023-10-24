import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { sessionOAuthTokenRepository } from "@/composition"

export default async function SessionOAuthTokenBarrier({
  children
}: {
  children: ReactNode
}) {
  try {
    await sessionOAuthTokenRepository.getOAuthToken()
    return <>{children}</>
  } catch {
    redirect("/api/auth/logout")
  }
}
