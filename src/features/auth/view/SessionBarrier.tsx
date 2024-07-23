import { ReactNode } from "react"
import { blockingSessionValidator } from "@/composition"
import ClientSessionBarrier from "./client/SessionBarrier"

export default async function SessionBarrier({
  children
}: {
  children: ReactNode
}) {
  const sessionValidity = await blockingSessionValidator.validateSession()
  return (
    <ClientSessionBarrier sessionValidity={sessionValidity}>
      {children}
    </ClientSessionBarrier>
  )
}
