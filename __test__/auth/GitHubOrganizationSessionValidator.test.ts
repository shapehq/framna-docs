import { 
  GitHubOrganizationSessionValidator,
  SessionValidity
 } from "../../src/features/auth/domain"

test("It requests organization membership status for the specified organization", async () => {
  let queriedOrganizationName: string | undefined
  const sut = new GitHubOrganizationSessionValidator({
    acceptedOrganization: "foo",
    organizationMembershipStatusReader: {
      async getOrganizationMembershipStatus(request) {
        queriedOrganizationName = request.organizationName
        return { state: "active" }
      }
    },
    accountProviderTypeReader: {
      async getAccountProviderType() {
        return "github"
      }
    }
  })
  await sut.validateSession()
  expect(queriedOrganizationName).toBe("foo")
})

test("It considers session valid when membership state is \"active\"", async () => {
  const sut = new GitHubOrganizationSessionValidator({
    acceptedOrganization: "foo",
    organizationMembershipStatusReader: {
      async getOrganizationMembershipStatus() {
        return { state: "active" }
      }
    },
    accountProviderTypeReader: {
      async getAccountProviderType() {
        return "github"
      }
    }
  })
  const sessionValidity = await sut.validateSession()
  expect(sessionValidity).toEqual(SessionValidity.VALID)
})

test("It considers user not to be part of the organization when membership state is \"pending\"", async () => {
  const sut = new GitHubOrganizationSessionValidator({
    acceptedOrganization: "foo",
    organizationMembershipStatusReader: {
      async getOrganizationMembershipStatus() {
        return { state: "pending" }
      }
    },
    accountProviderTypeReader: {
      async getAccountProviderType() {
        return "github"
      }
    }
  })
  const sessionValidity = await sut.validateSession()
  expect(sessionValidity).toEqual(SessionValidity.OUTSIDE_GITHUB_ORGANIZATION)
})

test("It considers user not to be part of the organization when receiving HTTP 404", async () => {
  const sut = new GitHubOrganizationSessionValidator({
    acceptedOrganization: "foo",
    organizationMembershipStatusReader: {
      async getOrganizationMembershipStatus() {
        throw { status: 404, message: "User is not member of organization"}
      }
    },
    accountProviderTypeReader: {
      async getAccountProviderType() {
        return "github"
      }
    }
  })
  const sessionValidity = await sut.validateSession()
  expect(sessionValidity).toEqual(SessionValidity.OUTSIDE_GITHUB_ORGANIZATION)
})

test("It considers organization to have blocked the GitHub app when receiving HTTP 403", async () => {
  const sut = new GitHubOrganizationSessionValidator({
    acceptedOrganization: "foo",
    organizationMembershipStatusReader: {
      async getOrganizationMembershipStatus() {
        throw { status: 403, message: "Organization has blocked GitHub app"}
      }
    },
    accountProviderTypeReader: {
      async getAccountProviderType() {
        return "github"
      }
    }
  })
  const sessionValidity = await sut.validateSession()
  expect(sessionValidity).toEqual(SessionValidity.GITHUB_APP_BLOCKED)
})

test("It forwards error when getting membership status throws unknown error", async () => {
  const sut = new GitHubOrganizationSessionValidator({
    acceptedOrganization: "foo",
    organizationMembershipStatusReader: {
      async getOrganizationMembershipStatus() {
        throw { status: 500 }
      }
    },
    accountProviderTypeReader: {
      async getAccountProviderType() {
        return "github"
      }
    }
  })
  await expect(sut.validateSession()).rejects.toEqual({ status: 500 })
})

test("It considers session valid when the account provider is not \"github\"", async () => {
  const sut = new GitHubOrganizationSessionValidator({
    acceptedOrganization: "foo",
    organizationMembershipStatusReader: {
      async getOrganizationMembershipStatus() {
        throw { status: "pending" }
      }
    },
    accountProviderTypeReader: {
      async getAccountProviderType() {
        return "email"
      }
    }
  })
  const sessionValidity = await sut.validateSession()
  expect(sessionValidity).toEqual(SessionValidity.VALID)
})
