import { ReactNode } from "react"
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
  const accountProvider = await session.getAccountProvider()
  const sessionValidity = await blockingSessionValidator.validateSession()
  return (
    <ClientSessionBarrier
      accountProvider={accountProvider}
      siteName={NEXT_PUBLIC_SHAPE_DOCS_TITLE}
      organizationName={GITHUB_ORGANIZATION_NAME}
      sessionValidity={sessionValidity}
    >
      {children}
    </ClientSessionBarrier>
  )
}
