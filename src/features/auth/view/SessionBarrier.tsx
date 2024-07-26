import { redirect } from "next/navigation"
import { blockingSessionValidator } from "@/composition"
import { SessionValidity } from "../domain"

export default async function SessionBarrier({
  children
}: {
  children: React.ReactNode
}) {
  const sessionValidity = await blockingSessionValidator.validateSession()
  switch (sessionValidity) {
  case SessionValidity.VALID:
    return <>{children}</>
  case SessionValidity.INVALID_ACCESS_TOKEN:
    return redirect("/api/auth/signout")
  }
}
