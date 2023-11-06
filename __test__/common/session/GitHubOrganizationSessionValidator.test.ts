import {
  GetOrganizationMembershipStatusRequest,
  OrganizationMembershipStatus
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
        return OrganizationMembershipStatus.UNKNOWN
      }
    },
    "foo"
  )
  await sut.validateSession()
  expect(queriedOrganizationName).toBe("foo")
})

test("It considers session valid when membership status is \"Active\"", async () => {
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
        return OrganizationMembershipStatus.ACTIVE
      }
    },
    "foo"
  )
  const isSessionValid = await sut.validateSession()
  expect(isSessionValid).toBeTruthy()
})

test("It considers session invalid when membership status is \"Not a member\"", async () => {
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
        return OrganizationMembershipStatus.NOT_A_MEMBER
      }
    },
    "foo"
  )
  const isSessionValid = await sut.validateSession()
  expect(isSessionValid).toBeFalsy()
})

test("It considers session invalid when membership status is \"Pending\"", async () => {
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
        return OrganizationMembershipStatus.PENDING
      }
    },
    "foo"
  )
  const isSessionValid = await sut.validateSession()
  expect(isSessionValid).toBeFalsy()
})

test("It considers session invalid when membership status is \"GitHub App Blocked\"", async () => {
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
        return OrganizationMembershipStatus.GITHUB_APP_BLOCKED
      }
    },
    "foo"
  )
  const isSessionValid = await sut.validateSession()
  expect(isSessionValid).toBeFalsy()
})

test("It considers session invalid when membership status is \"Unknown\"", async () => {
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
        return OrganizationMembershipStatus.UNKNOWN
      }
    },
    "foo"
  )
  const isSessionValid = await sut.validateSession()
  expect(isSessionValid).toBeFalsy()
})