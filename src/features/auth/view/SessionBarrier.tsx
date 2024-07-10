import { ReactNode } from "react"
import { session, blockingSessionValidator } from "@/composition"
import ClientSessionBarrier from "./client/SessionBarrier"

export default async function SessionBarrier({
  children
}: {
  children: ReactNode
}) {
  const sessionValidity = await blockingSessionValidator.validateSession()
  return (
    <ClientSessionBarrier
      siteName={process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE}
      sessionValidity={sessionValidity}
    >
      {children}
    </ClientSessionBarrier>
  )
}
