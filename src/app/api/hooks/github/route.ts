import { NextRequest, NextResponse } from "next/server"
import GitHubHookHandler from "@/features/hooks/data/GitHubHookHandler"
import GitHubPullRequestCommentRepository from "@/features/hooks/data/GitHubPullRequestCommentRepository"
import PostCommentPullRequestEventHandler from "@/features/hooks/domain/PostCommentPullRequestEventHandler"
import RepositoryNameCheckingPullRequestEventHandler from "@/features/hooks/domain/RepositoryNameCheckingPullRequestEventHandler"
import ExistingCommentCheckingPullRequestEventHandler from "@/features/hooks/domain/ExistingCommentCheckingPullRequestEventHandler"
import { gitHubClient } from "@/composition"

const {
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
    new ExistingCommentCheckingPullRequestEventHandler(
      new PostCommentPullRequestEventHandler(
        new GitHubPullRequestCommentRepository(gitHubClient),
        SHAPE_DOCS_BASE_URL
      ),
      new GitHubPullRequestCommentRepository(gitHubClient),
      SHAPE_DOCS_BASE_URL
    ),
    allowedRepositoryNames,
    disallowedRepositoryNames
  )
})

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  await hookHandler.handle(req)
  return NextResponse.json({ status: "OK" })
}
