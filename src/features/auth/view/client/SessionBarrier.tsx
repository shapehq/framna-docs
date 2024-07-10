"use client"

import { ReactNode } from "react"
import { SessionValidity } from "../../domain"
import InvalidSessionPage from "./InvalidSessionPage"

export default function SessionBarrier({
  sessionValidity,
  children
}: {
  sessionValidity: SessionValidity
  children: ReactNode
}) {
  switch (sessionValidity) {
  case SessionValidity.VALID:
    return <>{children}</>
  case SessionValidity.INVALID_ACCESS_TOKEN:
    return (
      <InvalidSessionPage title="Could not obtain access">
        It was not possible to obtain access to the repositories on GitHub.
      </InvalidSessionPage>
    )
  }
}
