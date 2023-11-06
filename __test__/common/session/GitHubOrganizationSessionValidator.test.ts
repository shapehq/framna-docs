import {
  GetOrganizationMembershipStatusRequest
} from "../../../src/common/github/IGitHubClient"
import GitHubOrganizationSessionValidator from "../../../src/common/session/GitHubOrganizationSessionValidator"

test("It requests organization membership status for the specified organization", async () => {
  let queriedOrganizationName: string | undefined
  const sut = new GitHubOrganizationSessionValidator(
    {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestComments() {
        return []
      },
      async addCommentToPullRequest() {},
      async getOrganizationMembershipStatus(request: GetOrganizationMembershipStatusRequest) {
        queriedOrganizationName = request.organizationName
        return { state: "active" }
      }
    },
    "foo"
  )
  await sut.validateSession()
  expect(queriedOrganizationName).toBe("foo")
})

test("It considers session valid when membership state is \"active\"", async () => {
  const sut = new GitHubOrganizationSessionValidator(
    {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestComments() {
        return []
      },
      async addCommentToPullRequest() {},
      async getOrganizationMembershipStatus() {
        return { state: "active" }
      }
    },
    "foo"
  )
  const isSessionValid = await sut.validateSession()
  expect(isSessionValid).toBeTruthy()
})

test("It considers session invalid when membership state is \"pending\"", async () => {
  const sut = new GitHubOrganizationSessionValidator(
    {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestComments() {
        return []
      },
      async addCommentToPullRequest() {},
      async getOrganizationMembershipStatus() {
        return { state: "pending" }
      }
    },
    "foo"
  )
  const isSessionValid = await sut.validateSession()
  expect(isSessionValid).toBeFalsy()
})

test("It considers session invalid when receiving HTTP 404, indicating user is not member of the organization", async () => {
  const sut = new GitHubOrganizationSessionValidator(
    {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestComments() {
        return []
      },
      async addCommentToPullRequest() {},
      async getOrganizationMembershipStatus() {
        throw { status: 404, message: "User is not member of organization"}
      }
    },
    "foo"
  )
  const isSessionValid = await sut.validateSession()
  expect(isSessionValid).toBeFalsy()
})

test("It considers session invalid when receiving HTTP 404, indicating that the organization has blocked the GitHub app", async () => {
  const sut = new GitHubOrganizationSessionValidator(
    {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestComments() {
        return []
      },
      async addCommentToPullRequest() {},
      async getOrganizationMembershipStatus() {
        throw { status: 403, message: "Organization has blocked GitHub app"}
      }
    },
    "foo"
  )
  const isSessionValid = await sut.validateSession()
  expect(isSessionValid).toBeFalsy()
})

test("It forwards error when getting membership status throws unknown error", async () => {
  const sut = new GitHubOrganizationSessionValidator(
    {
      async graphql() {
        return {}
      },
      async getRepositoryContent() {
        return { downloadURL: "https://example.com" }
      },
      async getPullRequestComments() {
        return []
      },
      async addCommentToPullRequest() {},
      async getOrganizationMembershipStatus() {
        throw { status: 500 }
      }
    },
    "foo"
  )
  await expect(sut.validateSession()).rejects.toEqual({ status: 500 })
})