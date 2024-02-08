"use client"

import { ReactNode } from "react"
import { AccountProviderType } from "@/common"
import {
  SessionValidity,
  mergeSessionValidity,
  useSessionValidity
} from "../../domain"
import NonGitHubAccountAccessTokenInvalidPage from "./NonGitHubAccountAccessTokenInvalidPage"
import InvalidSessionPage from "./InvalidSessionPage"

export default function SessionBarrier({
  accountProviderType,
  siteName,
  organizationName,
  sessionValidity: fastSessionValidity,
  children
}: {
  accountProviderType: AccountProviderType
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
    switch (accountProviderType) {
    case "email":
      return <NonGitHubAccountAccessTokenInvalidPage organizationName={organizationName}/>
    case "github":
      return (
        <InvalidSessionPage title="Could not obtain access">
          It was not possible to obtain access to the projects on the <strong>{organizationName}</strong> organization on GitHub.
        </InvalidSessionPage>
      )
    }
  case SessionValidity.OUTSIDE_GITHUB_ORGANIZATION:
  case SessionValidity.GITHUB_APP_BLOCKED:
    return (
      <InvalidSessionPage title={`Your account is not part of the ${organizationName} organization`}>
        Access to {siteName} requires that your account is an active member of the <strong>{organizationName}</strong> organization on GitHub.
      </InvalidSessionPage>
    )
  }
}
