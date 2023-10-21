import { NextRequest, NextResponse } from "next/server"
import GitHubHookHandler from "@/features/hooks/data/GitHubHookHandler"
import GitHubPullRequestCommentRepository from "@/features/hooks/data/GitHubPullRequestCommentRepository"
import PostCommentPullRequestEventHandler from "@/features/hooks/domain/PostCommentPullRequestEventHandler"
import RepositoryNameCheckingPullRequestEventHandler from "@/features/hooks/domain/RepositoryNameCheckingPullRequestEventHandler"
import ExistingCommentCheckingPullRequestEventHandler from "@/features/hooks/domain/ExistingCommentCheckingPullRequestEventHandler"

const {
  SHAPE_DOCS_BASE_URL,
  GITHUB_APP_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_PRIVATE_KEY_BASE_64,
  GITHUB_WEBHOOK_SECRET,
  GITHUB_WEBHOK_REPOSITORY_ALLOWLIST,
  GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST
} = process.env

const privateKey = Buffer.from(GITHUB_PRIVATE_KEY_BASE_64, "base64").toString("utf-8")
const allowedRepositoryNames = (GITHUB_WEBHOK_REPOSITORY_ALLOWLIST || "")
  .split(",")
  .map(e => e.trim())
const disallowedRepositoryNames = (GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST || "")
  .split(",")
  .map(e => e.trim())
  
const commentRepository = new GitHubPullRequestCommentRepository({
  appId: GITHUB_APP_ID,
  privateKey: privateKey,
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_WEBHOOK_SECRET
})
const hookHandler = new GitHubHookHandler({
  secret: GITHUB_WEBHOOK_SECRET,
  pullRequestEventHandler: new RepositoryNameCheckingPullRequestEventHandler(
    new ExistingCommentCheckingPullRequestEventHandler(
      new PostCommentPullRequestEventHandler(
        commentRepository,
        SHAPE_DOCS_BASE_URL
      ),
      commentRepository,
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
