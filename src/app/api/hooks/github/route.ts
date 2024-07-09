import { NextRequest, NextResponse } from "next/server"
import {
  GitHubHookHandler,
  GitHubPullRequestCommentRepository
} from "@/features/hooks/data"
import {
  PostCommentPullRequestEventHandler,
  RepositoryNameCheckingPullRequestEventHandler,
  ExistingCommentCheckingPullRequestEventHandler,
  GitHubCommentFactory
} from "@/features/hooks/domain"
import { gitHubClient } from "@/composition"

const {
  NEXT_PUBLIC_SHAPE_DOCS_TITLE,
  SHAPE_DOCS_BASE_URL,
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
  pullRequestEventHandler: new RepositoryNameCheckingPullRequestEventHandler(
    new ExistingCommentCheckingPullRequestEventHandler({
      eventHandler: new PostCommentPullRequestEventHandler({
        commentRepository: new GitHubPullRequestCommentRepository(gitHubClient),
        commentFactory: new GitHubCommentFactory({
          websiteTitle: NEXT_PUBLIC_SHAPE_DOCS_TITLE,
          domain: SHAPE_DOCS_BASE_URL
        })
      }),
      commentRepository: new GitHubPullRequestCommentRepository(gitHubClient),
      needleDomain: SHAPE_DOCS_BASE_URL
    }),
    allowedRepositoryNames,
    disallowedRepositoryNames
  )
})

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  await hookHandler.handle(req)
  return NextResponse.json({ status: "OK" })
}
