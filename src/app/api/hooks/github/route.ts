import { NextRequest, NextResponse } from "next/server"
import {
  GitHubHookHandler
} from "@/features/hooks/data"
import {
  PostCommentPullRequestEventHandler,
  FilteringPullRequestEventHandler,
  RepositoryNameEventFilter
} from "@/features/hooks/domain"
import { gitHubClient } from "@/composition"

const {
  NEXT_PUBLIC_SHAPE_DOCS_TITLE,
  SHAPE_DOCS_BASE_URL,
  SHAPE_DOCS_PROJECT_CONFIGURATION_FILENAME,
  REPOSITORY_NAME_SUFFIX,
  GITHUB_APP_ID,
  GITHUB_WEBHOOK_SECRET,
  GITHUB_WEBHOK_REPOSITORY_ALLOWLIST,
  GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST
} = process.env

const listFromCommaSeparatedString = (str?: string) => {
  if (!str) {
    return []
  }
  return str.split(",").map(e => e.trim())
}

const allowedRepositoryNames = listFromCommaSeparatedString(GITHUB_WEBHOK_REPOSITORY_ALLOWLIST)
const disallowedRepositoryNames = listFromCommaSeparatedString(GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST)
  
const hookHandler = new GitHubHookHandler({
  secret: GITHUB_WEBHOOK_SECRET,
  pullRequestEventHandler: new FilteringPullRequestEventHandler({
    filter: new RepositoryNameEventFilter({
      repositoryNameSuffix: REPOSITORY_NAME_SUFFIX,
      allowedRepositoryNames,
      disallowedRepositoryNames
    }),
    eventHandler: new PostCommentPullRequestEventHandler({
      siteName: NEXT_PUBLIC_SHAPE_DOCS_TITLE,
      domain: SHAPE_DOCS_BASE_URL,
      repositoryNameSuffix: REPOSITORY_NAME_SUFFIX,
      projectConfigurationFilename: SHAPE_DOCS_PROJECT_CONFIGURATION_FILENAME,
      gitHubAppId: GITHUB_APP_ID,
      gitHubClient: gitHubClient
    })
  })
})

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  await hookHandler.handle(req)
  return NextResponse.json({ status: "OK" })
}
