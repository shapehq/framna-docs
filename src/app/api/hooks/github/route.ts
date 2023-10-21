import { createAppAuth } from "@octokit/auth-app"
import { Webhooks } from "@octokit/webhooks"
import { NextRequest, NextResponse } from "next/server"
import { Octokit } from "octokit"
import { Repository, PullRequest } from "@octokit/webhooks-types"

// load env vars
const {
  GITHUB_APP_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_PRIVATE_KEY_BASE_64,
  GITHUB_WEBHOOK_SECRET
} = process.env
const privateKey = Buffer.from(GITHUB_PRIVATE_KEY_BASE_64!!, 'base64').toString('utf-8')

// we will only add comments in these repos for now
const repositoryWhitelist = [
  'example-openapi',
  'test-openapi',
  'moonboon-openapi'
]

const webhooks = new Webhooks({ secret: GITHUB_WEBHOOK_SECRET!! })

const auth = createAppAuth({
  appId: GITHUB_APP_ID!!,
  privateKey: privateKey,
  clientId: GITHUB_CLIENT_ID!!,
  clientSecret: GITHUB_CLIENT_SECRET!!,
})

const generateCommentBody = (repository: Repository, ref: string) => {
  const link = `https://docs.shapetools.io/${repository.name.replace("-openapi", "")}/${ref}`

  return `### 📖 Documentation Preview

These edits are available for preview at [Shape Docs](${link}).

<table>
  <tr>
    <td><strong>Status:</strong></td><td>✅ Ready!</td>
  </tr>
  <tr>
    <td><strong>Preview URL:</strong></td><td><a href="${link}">${link}</a></td>
  </tr>
</table>`
}

const createComment = async (repository: Repository, pullRequest: PullRequest, appInstallationId: number) => {
  const installationAuthentication = await auth({
    type: "installation",
    installationId: appInstallationId,
  })

  const octokit = new Octokit({ auth: installationAuthentication.token })

  const isOpenApiRepo = repository.name.includes("openapi") && repositoryWhitelist.includes(repository.name)

  if (isOpenApiRepo) {
    console.log("This is an openapi repo")
    console.log("Checking if we need to create a comment")

    const comments = await octokit.rest.issues.listComments({ // TODO: We need to fetch all pages here
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: pullRequest.number,
    })

    const containsOurComment = comments.data.filter(comment => {
      return comment.body?.includes("docs.shapetools.io")
    }).length > 0

    if (!containsOurComment) {
      console.log("Comment does not exist - creating one")
      await octokit.rest.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pullRequest.number,
        body: generateCommentBody(repository, pullRequest.head.ref)
      })
    } else {
      console.log("Comment exists - not creating")
    }
  }
}

// keep track of processed events
// TODO: Add cleanup for this set. It will grow forever otherwise.
const alreadyProcessedEvents = new Set<string>()

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  await webhooks.verifyAndReceive({
    id: req.headers.get('X-GitHub-Delivery') as string,
    name: req.headers.get('X-GitHub-Event') as any,
    payload: await req.text(),
    signature: req.headers.get('X-Hub-Signature') as string,
  }).catch((error) => {
    console.error(`Error: ${error.message}`)
    return false
  })

  webhooks.on("pull_request.opened", async ({ id, name, payload }) => {
    console.log(`Received event ${name}#${id}`)
    if (!alreadyProcessedEvents.has(id)) {
      console.log("Processing event")
      alreadyProcessedEvents.add(id)
      await createComment(payload.repository, payload.pull_request, payload.installation!.id)
    } else {
      console.log("Already processed this event")
    }
  })
  webhooks.on("pull_request.reopened", async ({ id, name, payload }) => {
    console.log(`Received event ${name}#${id}`)
    if (!alreadyProcessedEvents.has(id)) {
      console.log("Processing event")
      alreadyProcessedEvents.add(id)
      await createComment(payload.repository, payload.pull_request, payload.installation!.id)
    } else {
      console.log("Already processed this event")
    }
  })

  return NextResponse.json({ status: "OK" })
}
