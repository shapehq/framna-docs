"use client"

import { ReactNode } from "react"
import GuestAccessTokenInvalidPage from "./GuestAccessTokenInvalidPage"
import InvalidSessionPage from "./InvalidSessionPage"
import {
  SessionValidity,
  mergeSessionValidity,
  useSessionValidity
} from "../../domain"

export default function SessionBarrier({
  isGuest,
  siteName,
  organizationName,
  sessionValidity: fastSessionValidity,
  children
}: {
  isGuest: boolean
  siteName: string
  organizationName: string
  sessionValidity: SessionValidity
  children: ReactNode
}) {
  const { sessionValidity: delayedSessionValidity } = useSessionValidity()
  const sessionValidity = mergeSessionValidity(
    fastSessionValidity,
    delayedSessionValidity
  )
  switch (sessionValidity) {
  case SessionValidity.VALID:
    return <>{children}</>
  case SessionValidity.INVALID_ACCESS_TOKEN:
    if (isGuest) {
      return <GuestAccessTokenInvalidPage organizationName={organizationName}/>
    } else {
      return (
        <InvalidSessionPage title="Could not obtain access">
          It was not possible to obtain access to the projects on the <strong>{organizationName}</strong> organization on GitHub.
        </InvalidSessionPage>
      )
    }
  case SessionValidity.OUTSIDE_GITHUB_ORGANIZATION:
  case SessionValidity.GITHUB_APP_BLOCKED:
    return (
      <InvalidSessionPage title={`Your account is not part of the ${siteName} organization`}>
        Access to {siteName} requires that your account is an active member of the <strong>{organizationName}</strong> organization on GitHub.
      </InvalidSessionPage>
    )
  }
}
