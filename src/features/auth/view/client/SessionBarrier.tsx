"use client"

import { ReactNode } from "react"
import { AccountProvider } from "@/common"
import {
  SessionValidity
} from "../../domain"
import NonGitHubAccountAccessTokenInvalidPage from "./NonGitHubAccountAccessTokenInvalidPage"
import InvalidSessionPage from "./InvalidSessionPage"

export default function SessionBarrier({
  accountProvider,
  sessionValidity,
  children
}: {
  accountProvider: AccountProvider
  sessionValidity: SessionValidity
  children: ReactNode
}) {
  switch (sessionValidity) {
  case SessionValidity.VALID:
    return <>{children}</>
  case SessionValidity.INVALID_ACCESS_TOKEN:
    switch (accountProvider) {
    case "email":
      return <NonGitHubAccountAccessTokenInvalidPage/>
    case "github":
      return (
        <InvalidSessionPage title="Could not obtain access">
          It was not possible to obtain access to the repositories on GitHub.
        </InvalidSessionPage>
      )
    }
  }
}
