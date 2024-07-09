import { ReactNode } from "react"
import { session, blockingSessionValidator } from "@/composition"
import ClientSessionBarrier from "./client/SessionBarrier"

export default async function SessionBarrier({
  children
}: {
  children: ReactNode
}) {
  const accountProvider = await session.getAccountProvider()
  const sessionValidity = await blockingSessionValidator.validateSession()
  return (
    <ClientSessionBarrier
      accountProvider={accountProvider}
      sessionValidity={sessionValidity}
    >
      {children}
    </ClientSessionBarrier>
  )
}
