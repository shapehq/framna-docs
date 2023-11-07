import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { accessTokenService } from "@/composition"

export default async function SessionAccessTokenBarrier({
  children
}: {
  children: ReactNode
}) {
  try {
    await accessTokenService.getAccessToken()
    return <>{children}</>
  } catch {
    redirect("/api/auth/logout")
  }
}
