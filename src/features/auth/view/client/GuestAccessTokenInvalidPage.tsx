"use client"

import InvalidSessionPage from "./InvalidSessionPage"
import LoadingIndicator from "@/common/loading/DelayedLoadingIndicator"
import { useRepositoryAccess } from "../../domain"

export default function GuestAccessTokenInvalidPage({
  organizationName
}: {
  organizationName: string
}) {
  const {repositories, isLoading, error} = useRepositoryAccess()
  const title = "Could not obtain access"
  if (isLoading) {
    return (
      <InvalidSessionPage>
        <LoadingIndicator/>
      </InvalidSessionPage>
    )
  }
  if (error) {
    return (
      <InvalidSessionPage title={title}>
        It was not possible to obtain access to the projects on the <strong>{organizationName}</strong> organization on GitHub.
      </InvalidSessionPage>
    )
  }
  const repositoryNamesHTML = makeRepositoryNamesHTML(repositories)
  const html = `It was not possible to obtain access to all the projects: ${repositoryNamesHTML}.`
  return (
    <InvalidSessionPage title={title}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </InvalidSessionPage>
  )
}

function makeRepositoryNamesHTML(repositories: string[]): string {
  const copiedRepositories = [...repositories]
  if (copiedRepositories.length == 1) {
    return `<strong>${copiedRepositories[0]}</strong>`
  } else {
    const last = copiedRepositories.pop()
    return copiedRepositories
      .map(e => `<strong>${e}</strong>`)
      .join(", ")
      + `, and <strong>${last}</strong>`
  }
}