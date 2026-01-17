import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { CLISession, ICLISessionStore } from "@/features/cli/domain"
import { IOAuthTokenRefresher } from "@/features/auth/domain"

// Mock Octokit
const mockGraphql = jest.fn()
jest.unstable_mockModule("octokit", () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    graphql: mockGraphql,
  })),
}))

describe("TokenRefreshingCLIGraphQLClient", () => {
  let TokenRefreshingCLIGraphQLClient: typeof import("@/features/cli/domain").TokenRefreshingCLIGraphQLClient
  let mockSessionStore: jest.Mocked<ICLISessionStore>
  let mockTokenRefresher: jest.Mocked<IOAuthTokenRefresher>
  let testSession: CLISession

  beforeEach(async () => {
    jest.clearAllMocks()

    const cliModule = await import("@/features/cli/domain")
    TokenRefreshingCLIGraphQLClient = cliModule.TokenRefreshingCLIGraphQLClient

    testSession = {
      sessionId: "test-session-id",
      accessToken: "old-access-token",
      refreshToken: "old-refresh-token",
      createdAt: new Date().toISOString(),
    }

    mockSessionStore = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      createPendingSession: jest.fn(),
      getPendingSession: jest.fn(),
      completePendingSession: jest.fn(),
    } as jest.Mocked<ICLISessionStore>

    mockTokenRefresher = {
      refreshOAuthToken: jest.fn(),
    } as jest.Mocked<IOAuthTokenRefresher>
  })

  it("executes graphql request successfully", async () => {
    mockGraphql.mockResolvedValue({ data: { viewer: { login: "test-user" } } })

    const client = new TokenRefreshingCLIGraphQLClient({
      session: testSession,
      sessionStore: mockSessionStore,
      tokenRefresher: mockTokenRefresher,
    })

    const result = await client.graphql({ query: "{ viewer { login } }" })

    expect(result).toEqual({ data: { viewer: { login: "test-user" } } })
    expect(mockTokenRefresher.refreshOAuthToken).not.toHaveBeenCalled()
  })

  it("refreshes token and retries on 401 error", async () => {
    const error401 = { status: 401, message: "Bad credentials" }
    mockGraphql
      .mockRejectedValueOnce(error401)
      .mockResolvedValueOnce({ data: { viewer: { login: "test-user" } } })

    mockTokenRefresher.refreshOAuthToken.mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    })

    const client = new TokenRefreshingCLIGraphQLClient({
      session: testSession,
      sessionStore: mockSessionStore,
      tokenRefresher: mockTokenRefresher,
    })

    const result = await client.graphql({ query: "{ viewer { login } }" })

    expect(result).toEqual({ data: { viewer: { login: "test-user" } } })
    expect(mockTokenRefresher.refreshOAuthToken).toHaveBeenCalledWith({
      accessToken: "old-access-token",
      refreshToken: "old-refresh-token",
    })
    expect(mockSessionStore.set).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "test-session-id",
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      })
    )
  })

  it("throws error if no refresh token available", async () => {
    const sessionWithoutRefreshToken: CLISession = {
      ...testSession,
      refreshToken: undefined,
    }

    const error401 = { status: 401, message: "Bad credentials" }
    mockGraphql.mockRejectedValue(error401)

    const client = new TokenRefreshingCLIGraphQLClient({
      session: sessionWithoutRefreshToken,
      sessionStore: mockSessionStore,
      tokenRefresher: mockTokenRefresher,
    })

    await expect(client.graphql({ query: "{ viewer { login } }" })).rejects.toEqual(error401)
    expect(mockTokenRefresher.refreshOAuthToken).not.toHaveBeenCalled()
  })

  it("throws non-401 errors without attempting refresh", async () => {
    const error500 = { status: 500, message: "Internal server error" }
    mockGraphql.mockRejectedValue(error500)

    const client = new TokenRefreshingCLIGraphQLClient({
      session: testSession,
      sessionStore: mockSessionStore,
      tokenRefresher: mockTokenRefresher,
    })

    await expect(client.graphql({ query: "{ viewer { login } }" })).rejects.toEqual(error500)
    expect(mockTokenRefresher.refreshOAuthToken).not.toHaveBeenCalled()
  })
})
