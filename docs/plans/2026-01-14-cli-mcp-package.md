# Framna Docs CLI + MCP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a CLI tool that authenticates via device flow and exposes OpenAPI documentation through both REST commands and an MCP server.

**Architecture:** CLI stores session ID locally (~/.framna-docs/session.json), makes REST API calls to Framna Docs server with Bearer token auth. Server looks up GitHub token from Redis and makes GitHub API calls. MCP serve command wraps CLI functionality in stdio transport.

**Tech Stack:** Commander.js (CLI), @modelcontextprotocol/sdk (MCP), Next.js API routes (REST), Redis (sessions), Zod (validation)

---

## Phase 1: REST API Routes

### Task 1.1: Create CLI Auth Device Endpoint

**Files:**
- Create: `src/app/api/cli/auth/device/route.ts`

**Step 1: Write the failing test**

Create: `__test__/api/cli/auth/device.test.ts`

```typescript
import { POST } from "@/app/api/cli/auth/device/route"

// Mock the MCPDeviceFlowService
jest.mock("@/features/mcp/domain/MCPDeviceFlowService", () => ({
  MCPDeviceFlowService: jest.fn().mockImplementation(() => ({
    initiateDeviceFlow: jest.fn().mockResolvedValue({
      userCode: "ABCD-1234",
      verificationUri: "https://github.com/login/device",
      deviceCode: "device123",
      sessionId: "session-uuid",
      expiresIn: 899,
      interval: 5,
    }),
  })),
}))

// Mock Redis store
jest.mock("@/features/mcp/data/RedisMCPSessionStore", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({})),
}))

describe("POST /api/cli/auth/device", () => {
  it("returns device flow details for authentication", async () => {
    const request = new Request("http://localhost/api/cli/auth/device", {
      method: "POST",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      userCode: "ABCD-1234",
      verificationUri: "https://github.com/login/device",
      deviceCode: "device123",
      sessionId: "session-uuid",
      expiresIn: 899,
      interval: 5,
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- __test__/api/cli/auth/device.test.ts`
Expected: FAIL with "Cannot find module '@/app/api/cli/auth/device/route'"

**Step 3: Write minimal implementation**

Create: `src/app/api/cli/auth/device/route.ts`

```typescript
import { NextResponse } from "next/server"
import { MCPDeviceFlowService } from "@/features/mcp/domain/MCPDeviceFlowService"
import { RedisMCPSessionStore } from "@/features/mcp/data/RedisMCPSessionStore"
import { RedisKeyValueStore } from "@/common/key-value-store/RedisKeyValueStore"
import { env } from "@/common/env"

export async function POST(): Promise<NextResponse> {
  const store = new RedisMCPSessionStore(
    new RedisKeyValueStore(env.getOrThrow("REDIS_URL"))
  )
  const service = new MCPDeviceFlowService(
    env.getOrThrow("GITHUB_CLIENT_ID"),
    store
  )

  const result = await service.initiateDeviceFlow()

  return NextResponse.json({
    userCode: result.userCode,
    verificationUri: result.verificationUri,
    deviceCode: result.deviceCode,
    sessionId: result.sessionId,
    expiresIn: result.expiresIn,
    interval: result.interval,
  })
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- __test__/api/cli/auth/device.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add __test__/api/cli/auth/device.test.ts src/app/api/cli/auth/device/route.ts
git commit -m "feat(cli): add device flow auth endpoint"
```

---

### Task 1.2: Create CLI Auth Status Endpoint

**Files:**
- Create: `src/app/api/cli/auth/status/route.ts`

**Step 1: Write the failing test**

Create: `__test__/api/cli/auth/status.test.ts`

```typescript
import { GET } from "@/app/api/cli/auth/status/route"

const mockPollForToken = jest.fn()

jest.mock("@/features/mcp/domain/MCPDeviceFlowService", () => ({
  MCPDeviceFlowService: jest.fn().mockImplementation(() => ({
    pollForToken: mockPollForToken,
  })),
}))

jest.mock("@/features/mcp/data/RedisMCPSessionStore", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({})),
}))

describe("GET /api/cli/auth/status", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns pending when authorization not complete", async () => {
    mockPollForToken.mockResolvedValue(null)

    const request = new Request(
      "http://localhost/api/cli/auth/status?device_code=abc123"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ status: "pending" })
  })

  it("returns complete with sessionId on success", async () => {
    mockPollForToken.mockResolvedValue({ sessionId: "session-uuid" })

    const request = new Request(
      "http://localhost/api/cli/auth/status?device_code=abc123"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ status: "complete", sessionId: "session-uuid" })
  })

  it("returns 400 when device_code missing", async () => {
    const request = new Request("http://localhost/api/cli/auth/status")
    const response = await GET(request)

    expect(response.status).toBe(400)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- __test__/api/cli/auth/status.test.ts`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

Create: `src/app/api/cli/auth/status/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { MCPDeviceFlowService } from "@/features/mcp/domain/MCPDeviceFlowService"
import { RedisMCPSessionStore } from "@/features/mcp/data/RedisMCPSessionStore"
import { RedisKeyValueStore } from "@/common/key-value-store/RedisKeyValueStore"
import { env } from "@/common/env"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const deviceCode = request.nextUrl.searchParams.get("device_code")

  if (!deviceCode) {
    return NextResponse.json(
      { error: "device_code query parameter required" },
      { status: 400 }
    )
  }

  const store = new RedisMCPSessionStore(
    new RedisKeyValueStore(env.getOrThrow("REDIS_URL"))
  )
  const service = new MCPDeviceFlowService(
    env.getOrThrow("GITHUB_CLIENT_ID"),
    store
  )

  try {
    const session = await service.pollForToken(deviceCode)

    if (!session) {
      return NextResponse.json({ status: "pending" })
    }

    return NextResponse.json({
      status: "complete",
      sessionId: session.sessionId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ status: "error", error: message })
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- __test__/api/cli/auth/status.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add __test__/api/cli/auth/status.test.ts src/app/api/cli/auth/status/route.ts
git commit -m "feat(cli): add auth status polling endpoint"
```

---

### Task 1.3: Create CLI Auth Logout Endpoint

**Files:**
- Create: `src/app/api/cli/auth/logout/route.ts`

**Step 1: Write the failing test**

Create: `__test__/api/cli/auth/logout.test.ts`

```typescript
import { POST } from "@/app/api/cli/auth/logout/route"

const mockDelete = jest.fn()

jest.mock("@/features/mcp/data/RedisMCPSessionStore", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({
    delete: mockDelete,
  })),
}))

describe("POST /api/cli/auth/logout", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deletes session and returns success", async () => {
    mockDelete.mockResolvedValue(undefined)

    const request = new Request("http://localhost/api/cli/auth/logout", {
      method: "POST",
      headers: { Authorization: "Bearer session-uuid" },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
    expect(mockDelete).toHaveBeenCalledWith("session-uuid")
  })

  it("returns 401 when no authorization header", async () => {
    const request = new Request("http://localhost/api/cli/auth/logout", {
      method: "POST",
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- __test__/api/cli/auth/logout.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create: `src/app/api/cli/auth/logout/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { RedisMCPSessionStore } from "@/features/mcp/data/RedisMCPSessionStore"
import { RedisKeyValueStore } from "@/common/key-value-store/RedisKeyValueStore"
import { env } from "@/common/env"

function getSessionId(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }
  return null
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const sessionId = getSessionId(request)

  if (!sessionId) {
    return NextResponse.json(
      { error: "Authorization header required" },
      { status: 401 }
    )
  }

  const store = new RedisMCPSessionStore(
    new RedisKeyValueStore(env.getOrThrow("REDIS_URL"))
  )

  await store.delete(sessionId)

  return NextResponse.json({ success: true })
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- __test__/api/cli/auth/logout.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add __test__/api/cli/auth/logout.test.ts src/app/api/cli/auth/logout/route.ts
git commit -m "feat(cli): add auth logout endpoint"
```

---

### Task 1.4: Create CLI Session Middleware Helper

**Files:**
- Create: `src/app/api/cli/middleware.ts`

**Step 1: Write the failing test**

Create: `__test__/api/cli/middleware.test.ts`

```typescript
import {
  getSessionFromRequest,
  withAuth,
  CLIAuthContext,
} from "@/app/api/cli/middleware"
import { NextRequest, NextResponse } from "next/server"

const mockGet = jest.fn()

jest.mock("@/features/mcp/data/RedisMCPSessionStore", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({
    get: mockGet,
  })),
}))

describe("CLI middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getSessionFromRequest", () => {
    it("extracts session ID from Bearer token", () => {
      const request = new Request("http://localhost/api/cli/test", {
        headers: { Authorization: "Bearer abc123" },
      }) as NextRequest
      expect(getSessionFromRequest(request as NextRequest)).toBe("abc123")
    })

    it("returns null when no auth header", () => {
      const request = new Request("http://localhost/api/cli/test") as NextRequest
      expect(getSessionFromRequest(request as NextRequest)).toBeNull()
    })
  })

  describe("withAuth", () => {
    it("returns 401 when no session ID", async () => {
      const handler = jest.fn()
      const wrappedHandler = withAuth(handler)

      const request = new Request("http://localhost/api/cli/test") as NextRequest
      const response = await wrappedHandler(request as NextRequest)

      expect(response.status).toBe(401)
      expect(handler).not.toHaveBeenCalled()
    })

    it("returns 401 when session not found in Redis", async () => {
      mockGet.mockResolvedValue(null)

      const handler = jest.fn()
      const wrappedHandler = withAuth(handler)

      const request = new Request("http://localhost/api/cli/test", {
        headers: { Authorization: "Bearer invalid-session" },
      }) as NextRequest
      const response = await wrappedHandler(request as NextRequest)

      expect(response.status).toBe(401)
      expect(handler).not.toHaveBeenCalled()
    })

    it("calls handler with auth context when session valid", async () => {
      mockGet.mockResolvedValue({
        sessionId: "valid-session",
        accessToken: "github-token",
        createdAt: new Date().toISOString(),
      })

      const handler = jest
        .fn()
        .mockResolvedValue(NextResponse.json({ ok: true }))
      const wrappedHandler = withAuth(handler)

      const request = new Request("http://localhost/api/cli/test", {
        headers: { Authorization: "Bearer valid-session" },
      }) as NextRequest
      const response = await wrappedHandler(request as NextRequest)

      expect(response.status).toBe(200)
      expect(handler).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          sessionId: "valid-session",
          accessToken: "github-token",
        })
      )
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- __test__/api/cli/middleware.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create: `src/app/api/cli/middleware.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { RedisMCPSessionStore } from "@/features/mcp/data/RedisMCPSessionStore"
import { RedisKeyValueStore } from "@/common/key-value-store/RedisKeyValueStore"
import { env } from "@/common/env"

export interface CLIAuthContext {
  sessionId: string
  accessToken: string
}

export function getSessionFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }
  return null
}

export function withAuth<T>(
  handler: (request: NextRequest, auth: CLIAuthContext) => Promise<NextResponse<T>>
): (request: NextRequest) => Promise<NextResponse<T | { error: string }>> {
  return async (request: NextRequest) => {
    const sessionId = getSessionFromRequest(request)

    if (!sessionId) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      )
    }

    const store = new RedisMCPSessionStore(
      new RedisKeyValueStore(env.getOrThrow("REDIS_URL"))
    )

    const session = await store.get(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    return handler(request, {
      sessionId: session.sessionId,
      accessToken: session.accessToken,
    })
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- __test__/api/cli/middleware.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add __test__/api/cli/middleware.test.ts src/app/api/cli/middleware.ts
git commit -m "feat(cli): add auth middleware helper"
```

---

### Task 1.5: Create CLI Projects Endpoint

**Files:**
- Create: `src/app/api/cli/projects/route.ts`

**Step 1: Write the failing test**

Create: `__test__/api/cli/projects.test.ts`

```typescript
import { GET } from "@/app/api/cli/projects/route"

const mockGetProjects = jest.fn()
const mockGet = jest.fn()

jest.mock("@/features/mcp/data/RedisMCPSessionStore", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({
    get: mockGet,
  })),
}))

jest.mock("@/features/projects/data/GitHubProjectDataSource", () => ({
  GitHubProjectDataSource: jest.fn().mockImplementation(() => ({
    getProjects: mockGetProjects,
  })),
}))

jest.mock("@/common/github/GitHubClient", () => ({
  GitHubClient: jest.fn().mockImplementation(() => ({})),
}))

describe("GET /api/cli/projects", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({
      sessionId: "test-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })
  })

  it("returns list of projects", async () => {
    mockGetProjects.mockResolvedValue([
      {
        id: "proj1",
        name: "test-project",
        displayName: "Test Project",
        versions: [{ id: "v1", name: "main", isDefault: true, specifications: [] }],
        owner: "org",
        ownerUrl: "https://github.com/org",
      },
    ])

    const request = new Request("http://localhost/api/cli/projects", {
      headers: { Authorization: "Bearer test-session" },
    })

    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.projects).toHaveLength(1)
    expect(data.projects[0].name).toBe("test-project")
  })

  it("returns 401 without auth", async () => {
    const request = new Request("http://localhost/api/cli/projects")
    const response = await GET(request as any)

    expect(response.status).toBe(401)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- __test__/api/cli/projects.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create: `src/app/api/cli/projects/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../middleware"
import { GitHubProjectDataSource } from "@/features/projects/data/GitHubProjectDataSource"
import { FilteringGitHubRepositoryDataSource } from "@/features/projects/data/FilteringGitHubRepositoryDataSource"
import { GitHubRepositoryDataSource } from "@/features/projects/data/GitHubRepositoryDataSource"
import { GitHubClient } from "@/common/github/GitHubClient"
import { env } from "@/common/env"
import { listFromCommaSeparatedString } from "@/common/listFromCommaSeparatedString"
import { EncryptionService } from "@/features/projects/data/EncryptionService"
import { RemoteConfigEncoder } from "@/features/projects/data/RemoteConfigEncoder"

async function handler(
  request: NextRequest,
  auth: CLIAuthContext
): Promise<NextResponse> {
  const gitHubClient = new GitHubClient({
    baseUrl: "https://api.github.com",
    accessToken: auth.accessToken,
  })

  const repositoryNameSuffix = env.getOrThrow("REPOSITORY_NAME_SUFFIX")
  const encryptionKey = env.get("ENCRYPTION_KEY")
  const encryptionService = encryptionKey
    ? new EncryptionService(encryptionKey)
    : undefined
  const remoteConfigEncoder = new RemoteConfigEncoder()

  const projectDataSource = new GitHubProjectDataSource({
    repositoryDataSource: new FilteringGitHubRepositoryDataSource({
      hiddenRepositories: listFromCommaSeparatedString(
        env.get("HIDDEN_REPOSITORIES")
      ),
      dataSource: new GitHubRepositoryDataSource({
        gitHubClient,
        repositoryNameSuffix,
      }),
    }),
    repositoryNameSuffix,
    encryptionService,
    remoteConfigEncoder,
  })

  const projects = await projectDataSource.getProjects()

  return NextResponse.json({ projects })
}

export const GET = withAuth(handler)
```

**Step 4: Run test to verify it passes**

Run: `npm test -- __test__/api/cli/projects.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add __test__/api/cli/projects.test.ts src/app/api/cli/projects/route.ts
git commit -m "feat(cli): add projects list endpoint"
```

---

### Task 1.6: Create CLI Single Project Endpoint

**Files:**
- Create: `src/app/api/cli/projects/[name]/route.ts`

**Step 1: Write the failing test**

Create: `__test__/api/cli/projects/[name].test.ts`

```typescript
import { GET } from "@/app/api/cli/projects/[name]/route"

const mockGetProjects = jest.fn()
const mockGet = jest.fn()

jest.mock("@/features/mcp/data/RedisMCPSessionStore", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({
    get: mockGet,
  })),
}))

jest.mock("@/features/projects/data/GitHubProjectDataSource", () => ({
  GitHubProjectDataSource: jest.fn().mockImplementation(() => ({
    getProjects: mockGetProjects,
  })),
}))

jest.mock("@/common/github/GitHubClient", () => ({
  GitHubClient: jest.fn().mockImplementation(() => ({})),
}))

describe("GET /api/cli/projects/[name]", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({
      sessionId: "test-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })
    mockGetProjects.mockResolvedValue([
      {
        id: "proj1",
        name: "test-project",
        displayName: "Test Project",
        versions: [
          {
            id: "v1",
            name: "main",
            isDefault: true,
            specifications: [
              { id: "s1", name: "api.yaml", url: "/api/blob/...", isDefault: true },
            ],
          },
        ],
        owner: "org",
        ownerUrl: "https://github.com/org",
      },
    ])
  })

  it("returns project details", async () => {
    const request = new Request("http://localhost/api/cli/projects/test-project", {
      headers: { Authorization: "Bearer test-session" },
    })

    const response = await GET(request as any, { params: Promise.resolve({ name: "test-project" }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.project.name).toBe("test-project")
    expect(data.project.versions).toHaveLength(1)
  })

  it("returns 404 when project not found", async () => {
    const request = new Request("http://localhost/api/cli/projects/nonexistent", {
      headers: { Authorization: "Bearer test-session" },
    })

    const response = await GET(request as any, { params: Promise.resolve({ name: "nonexistent" }) })

    expect(response.status).toBe(404)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- __test__/api/cli/projects/[name].test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create: `src/app/api/cli/projects/[name]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../../middleware"
import { GitHubProjectDataSource } from "@/features/projects/data/GitHubProjectDataSource"
import { FilteringGitHubRepositoryDataSource } from "@/features/projects/data/FilteringGitHubRepositoryDataSource"
import { GitHubRepositoryDataSource } from "@/features/projects/data/GitHubRepositoryDataSource"
import { GitHubClient } from "@/common/github/GitHubClient"
import { env } from "@/common/env"
import { listFromCommaSeparatedString } from "@/common/listFromCommaSeparatedString"
import { EncryptionService } from "@/features/projects/data/EncryptionService"
import { RemoteConfigEncoder } from "@/features/projects/data/RemoteConfigEncoder"

type RouteParams = { params: Promise<{ name: string }> }

async function handler(
  request: NextRequest,
  auth: CLIAuthContext,
  params: RouteParams
): Promise<NextResponse> {
  const { name } = await params.params

  const gitHubClient = new GitHubClient({
    baseUrl: "https://api.github.com",
    accessToken: auth.accessToken,
  })

  const repositoryNameSuffix = env.getOrThrow("REPOSITORY_NAME_SUFFIX")
  const encryptionKey = env.get("ENCRYPTION_KEY")
  const encryptionService = encryptionKey
    ? new EncryptionService(encryptionKey)
    : undefined
  const remoteConfigEncoder = new RemoteConfigEncoder()

  const projectDataSource = new GitHubProjectDataSource({
    repositoryDataSource: new FilteringGitHubRepositoryDataSource({
      hiddenRepositories: listFromCommaSeparatedString(
        env.get("HIDDEN_REPOSITORIES")
      ),
      dataSource: new GitHubRepositoryDataSource({
        gitHubClient,
        repositoryNameSuffix,
      }),
    }),
    repositoryNameSuffix,
    encryptionService,
    remoteConfigEncoder,
  })

  const projects = await projectDataSource.getProjects()
  const project = projects.find((p) => p.name === name)

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({ project })
}

export async function GET(
  request: NextRequest,
  params: RouteParams
): Promise<NextResponse> {
  const wrappedHandler = withAuth((req, auth) => handler(req, auth, params))
  return wrappedHandler(request)
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- __test__/api/cli/projects/[name].test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add __test__/api/cli/projects/[name].test.ts src/app/api/cli/projects/[name]/route.ts
git commit -m "feat(cli): add single project endpoint"
```

---

### Task 1.7: Create CLI Endpoints List Endpoint

**Files:**
- Create: `src/app/api/cli/endpoints/route.ts`

**Step 1: Write the failing test**

Create: `__test__/api/cli/endpoints.test.ts`

```typescript
import { GET } from "@/app/api/cli/endpoints/route"

const mockListEndpoints = jest.fn()
const mockGet = jest.fn()

jest.mock("@/features/mcp/data/RedisMCPSessionStore", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({
    get: mockGet,
  })),
}))

jest.mock("@/features/mcp/domain/OpenAPIService", () => ({
  OpenAPIService: jest.fn().mockImplementation(() => ({
    listEndpoints: mockListEndpoints,
  })),
}))

describe("GET /api/cli/endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({
      sessionId: "test-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })
  })

  it("returns endpoints for project", async () => {
    mockListEndpoints.mockResolvedValue([
      { path: "/users", method: "GET", summary: "List users", operationId: "listUsers", tags: ["users"] },
      { path: "/users", method: "POST", summary: "Create user", operationId: "createUser", tags: ["users"] },
    ])

    const request = new Request(
      "http://localhost/api/cli/endpoints?project=test-project",
      { headers: { Authorization: "Bearer test-session" } }
    )

    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.endpoints).toHaveLength(2)
    expect(data.endpoints[0].path).toBe("/users")
  })

  it("returns 400 without project param", async () => {
    const request = new Request("http://localhost/api/cli/endpoints", {
      headers: { Authorization: "Bearer test-session" },
    })

    const response = await GET(request as any)
    expect(response.status).toBe(400)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- __test__/api/cli/endpoints.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create: `src/app/api/cli/endpoints/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../middleware"
import { OpenAPIService } from "@/features/mcp/domain/OpenAPIService"
import { createGitHubClientForCLI, createProjectDataSourceForCLI } from "../helpers"

async function handler(
  request: NextRequest,
  auth: CLIAuthContext
): Promise<NextResponse> {
  const project = request.nextUrl.searchParams.get("project")
  const version = request.nextUrl.searchParams.get("version") ?? undefined
  const spec = request.nextUrl.searchParams.get("spec") ?? undefined

  if (!project) {
    return NextResponse.json(
      { error: "project query parameter required" },
      { status: 400 }
    )
  }

  const gitHubClient = createGitHubClientForCLI(auth.accessToken)
  const projectDataSource = createProjectDataSourceForCLI(gitHubClient)

  const openAPIService = new OpenAPIService(gitHubClient, projectDataSource)
  const endpoints = await openAPIService.listEndpoints(project, version, spec)

  return NextResponse.json({ endpoints })
}

export const GET = withAuth(handler)
```

**Step 4: Create helpers file**

Create: `src/app/api/cli/helpers.ts`

```typescript
import { GitHubClient } from "@/common/github/GitHubClient"
import { GitHubProjectDataSource } from "@/features/projects/data/GitHubProjectDataSource"
import { FilteringGitHubRepositoryDataSource } from "@/features/projects/data/FilteringGitHubRepositoryDataSource"
import { GitHubRepositoryDataSource } from "@/features/projects/data/GitHubRepositoryDataSource"
import { EncryptionService } from "@/features/projects/data/EncryptionService"
import { RemoteConfigEncoder } from "@/features/projects/data/RemoteConfigEncoder"
import { env } from "@/common/env"
import { listFromCommaSeparatedString } from "@/common/listFromCommaSeparatedString"
import { IGitHubClient } from "@/common/github/IGitHubClient"
import { IProjectDataSource } from "@/features/projects/domain/IProjectDataSource"

export function createGitHubClientForCLI(accessToken: string): IGitHubClient {
  return new GitHubClient({
    baseUrl: "https://api.github.com",
    accessToken,
  })
}

export function createProjectDataSourceForCLI(
  gitHubClient: IGitHubClient
): IProjectDataSource {
  const repositoryNameSuffix = env.getOrThrow("REPOSITORY_NAME_SUFFIX")
  const encryptionKey = env.get("ENCRYPTION_KEY")
  const encryptionService = encryptionKey
    ? new EncryptionService(encryptionKey)
    : undefined
  const remoteConfigEncoder = new RemoteConfigEncoder()

  return new GitHubProjectDataSource({
    repositoryDataSource: new FilteringGitHubRepositoryDataSource({
      hiddenRepositories: listFromCommaSeparatedString(
        env.get("HIDDEN_REPOSITORIES")
      ),
      dataSource: new GitHubRepositoryDataSource({
        gitHubClient,
        repositoryNameSuffix,
      }),
    }),
    repositoryNameSuffix,
    encryptionService,
    remoteConfigEncoder,
  })
}
```

**Step 5: Run test to verify it passes**

Run: `npm test -- __test__/api/cli/endpoints.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add __test__/api/cli/endpoints.test.ts src/app/api/cli/endpoints/route.ts src/app/api/cli/helpers.ts
git commit -m "feat(cli): add endpoints list endpoint"
```

---

### Task 1.8: Create CLI Endpoints Search Endpoint

**Files:**
- Create: `src/app/api/cli/endpoints/search/route.ts`

**Step 1: Write the failing test**

Create: `__test__/api/cli/endpoints/search.test.ts`

```typescript
import { GET } from "@/app/api/cli/endpoints/search/route"

const mockSearchEndpoints = jest.fn()
const mockGet = jest.fn()

jest.mock("@/features/mcp/data/RedisMCPSessionStore", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({
    get: mockGet,
  })),
}))

jest.mock("@/features/mcp/domain/OpenAPIService", () => ({
  OpenAPIService: jest.fn().mockImplementation(() => ({
    searchEndpoints: mockSearchEndpoints,
  })),
}))

describe("GET /api/cli/endpoints/search", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({
      sessionId: "test-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })
  })

  it("searches endpoints by query", async () => {
    mockSearchEndpoints.mockResolvedValue([
      { path: "/users", method: "GET", summary: "List users", operationId: "listUsers", tags: ["users"] },
    ])

    const request = new Request(
      "http://localhost/api/cli/endpoints/search?project=test-project&query=user",
      { headers: { Authorization: "Bearer test-session" } }
    )

    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.endpoints).toHaveLength(1)
  })

  it("returns 400 without project or query", async () => {
    const request = new Request("http://localhost/api/cli/endpoints/search", {
      headers: { Authorization: "Bearer test-session" },
    })

    const response = await GET(request as any)
    expect(response.status).toBe(400)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- __test__/api/cli/endpoints/search.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create: `src/app/api/cli/endpoints/search/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../../middleware"
import { OpenAPIService } from "@/features/mcp/domain/OpenAPIService"
import { createGitHubClientForCLI, createProjectDataSourceForCLI } from "../../helpers"

async function handler(
  request: NextRequest,
  auth: CLIAuthContext
): Promise<NextResponse> {
  const project = request.nextUrl.searchParams.get("project")
  const query = request.nextUrl.searchParams.get("query")
  const version = request.nextUrl.searchParams.get("version") ?? undefined
  const spec = request.nextUrl.searchParams.get("spec") ?? undefined

  if (!project || !query) {
    return NextResponse.json(
      { error: "project and query parameters required" },
      { status: 400 }
    )
  }

  const gitHubClient = createGitHubClientForCLI(auth.accessToken)
  const projectDataSource = createProjectDataSourceForCLI(gitHubClient)

  const openAPIService = new OpenAPIService(gitHubClient, projectDataSource)
  const endpoints = await openAPIService.searchEndpoints(project, query, version, spec)

  return NextResponse.json({ endpoints })
}

export const GET = withAuth(handler)
```

**Step 4: Run test to verify it passes**

Run: `npm test -- __test__/api/cli/endpoints/search.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add __test__/api/cli/endpoints/search.test.ts src/app/api/cli/endpoints/search/route.ts
git commit -m "feat(cli): add endpoints search endpoint"
```

---

### Task 1.9: Create CLI Single Endpoint Details Endpoint

**Files:**
- Create: `src/app/api/cli/endpoint/route.ts`

**Step 1: Write the failing test**

Create: `__test__/api/cli/endpoint.test.ts`

```typescript
import { GET } from "@/app/api/cli/endpoint/route"

const mockGetEndpointDetails = jest.fn()
const mockGet = jest.fn()

jest.mock("@/features/mcp/data/RedisMCPSessionStore", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({
    get: mockGet,
  })),
}))

jest.mock("@/features/mcp/domain/OpenAPIService", () => ({
  OpenAPIService: jest.fn().mockImplementation(() => ({
    getEndpointDetails: mockGetEndpointDetails,
  })),
}))

describe("GET /api/cli/endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({
      sessionId: "test-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })
  })

  it("returns endpoint details", async () => {
    mockGetEndpointDetails.mockResolvedValue({
      summary: "Get user",
      operationId: "getUser",
      parameters: [{ name: "id", in: "path", required: true }],
      responses: { "200": { description: "Success" } },
    })

    const request = new Request(
      "http://localhost/api/cli/endpoint?project=test&path=/users/{id}&method=GET",
      { headers: { Authorization: "Bearer test-session" } }
    )

    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.endpoint.operationId).toBe("getUser")
  })

  it("returns 400 without required params", async () => {
    const request = new Request("http://localhost/api/cli/endpoint?project=test", {
      headers: { Authorization: "Bearer test-session" },
    })

    const response = await GET(request as any)
    expect(response.status).toBe(400)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- __test__/api/cli/endpoint.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create: `src/app/api/cli/endpoint/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../middleware"
import { OpenAPIService } from "@/features/mcp/domain/OpenAPIService"
import { createGitHubClientForCLI, createProjectDataSourceForCLI } from "../helpers"

async function handler(
  request: NextRequest,
  auth: CLIAuthContext
): Promise<NextResponse> {
  const project = request.nextUrl.searchParams.get("project")
  const path = request.nextUrl.searchParams.get("path")
  const method = request.nextUrl.searchParams.get("method")
  const version = request.nextUrl.searchParams.get("version") ?? undefined
  const spec = request.nextUrl.searchParams.get("spec") ?? undefined

  if (!project || !path || !method) {
    return NextResponse.json(
      { error: "project, path, and method parameters required" },
      { status: 400 }
    )
  }

  const gitHubClient = createGitHubClientForCLI(auth.accessToken)
  const projectDataSource = createProjectDataSourceForCLI(gitHubClient)

  const openAPIService = new OpenAPIService(gitHubClient, projectDataSource)

  try {
    const endpoint = await openAPIService.getEndpointDetails(
      project,
      path,
      method.toLowerCase(),
      version,
      spec
    )
    return NextResponse.json({ endpoint })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Endpoint not found" },
      { status: 404 }
    )
  }
}

export const GET = withAuth(handler)
```

**Step 4: Run test to verify it passes**

Run: `npm test -- __test__/api/cli/endpoint.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add __test__/api/cli/endpoint.test.ts src/app/api/cli/endpoint/route.ts
git commit -m "feat(cli): add endpoint details endpoint"
```

---

### Task 1.10: Create CLI Schemas List Endpoint

**Files:**
- Create: `src/app/api/cli/schemas/route.ts`

**Step 1: Write the failing test**

Create: `__test__/api/cli/schemas.test.ts`

```typescript
import { GET } from "@/app/api/cli/schemas/route"

const mockListSchemas = jest.fn()
const mockGet = jest.fn()

jest.mock("@/features/mcp/data/RedisMCPSessionStore", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({
    get: mockGet,
  })),
}))

jest.mock("@/features/mcp/domain/OpenAPIService", () => ({
  OpenAPIService: jest.fn().mockImplementation(() => ({
    listSchemas: mockListSchemas,
  })),
}))

describe("GET /api/cli/schemas", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({
      sessionId: "test-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })
  })

  it("returns list of schemas", async () => {
    mockListSchemas.mockResolvedValue(["User", "CreateUserRequest", "Error"])

    const request = new Request(
      "http://localhost/api/cli/schemas?project=test-project",
      { headers: { Authorization: "Bearer test-session" } }
    )

    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.schemas).toEqual(["User", "CreateUserRequest", "Error"])
  })

  it("returns 400 without project", async () => {
    const request = new Request("http://localhost/api/cli/schemas", {
      headers: { Authorization: "Bearer test-session" },
    })

    const response = await GET(request as any)
    expect(response.status).toBe(400)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- __test__/api/cli/schemas.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create: `src/app/api/cli/schemas/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../middleware"
import { OpenAPIService } from "@/features/mcp/domain/OpenAPIService"
import { createGitHubClientForCLI, createProjectDataSourceForCLI } from "../helpers"

async function handler(
  request: NextRequest,
  auth: CLIAuthContext
): Promise<NextResponse> {
  const project = request.nextUrl.searchParams.get("project")
  const version = request.nextUrl.searchParams.get("version") ?? undefined
  const spec = request.nextUrl.searchParams.get("spec") ?? undefined

  if (!project) {
    return NextResponse.json(
      { error: "project query parameter required" },
      { status: 400 }
    )
  }

  const gitHubClient = createGitHubClientForCLI(auth.accessToken)
  const projectDataSource = createProjectDataSourceForCLI(gitHubClient)

  const openAPIService = new OpenAPIService(gitHubClient, projectDataSource)
  const schemas = await openAPIService.listSchemas(project, version, spec)

  return NextResponse.json({ schemas })
}

export const GET = withAuth(handler)
```

**Step 4: Run test to verify it passes**

Run: `npm test -- __test__/api/cli/schemas.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add __test__/api/cli/schemas.test.ts src/app/api/cli/schemas/route.ts
git commit -m "feat(cli): add schemas list endpoint"
```

---

### Task 1.11: Create CLI Single Schema Endpoint

**Files:**
- Create: `src/app/api/cli/schema/route.ts`

**Step 1: Write the failing test**

Create: `__test__/api/cli/schema.test.ts`

```typescript
import { GET } from "@/app/api/cli/schema/route"

const mockGetSchema = jest.fn()
const mockGet = jest.fn()

jest.mock("@/features/mcp/data/RedisMCPSessionStore", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({
    get: mockGet,
  })),
}))

jest.mock("@/features/mcp/domain/OpenAPIService", () => ({
  OpenAPIService: jest.fn().mockImplementation(() => ({
    getSchema: mockGetSchema,
  })),
}))

describe("GET /api/cli/schema", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({
      sessionId: "test-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })
  })

  it("returns schema definition", async () => {
    mockGetSchema.mockResolvedValue({
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
      },
      required: ["id", "name"],
    })

    const request = new Request(
      "http://localhost/api/cli/schema?project=test&name=User",
      { headers: { Authorization: "Bearer test-session" } }
    )

    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.schema.type).toBe("object")
    expect(data.schema.properties.id).toBeDefined()
  })

  it("returns 400 without required params", async () => {
    const request = new Request("http://localhost/api/cli/schema?project=test", {
      headers: { Authorization: "Bearer test-session" },
    })

    const response = await GET(request as any)
    expect(response.status).toBe(400)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- __test__/api/cli/schema.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create: `src/app/api/cli/schema/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../middleware"
import { OpenAPIService } from "@/features/mcp/domain/OpenAPIService"
import { createGitHubClientForCLI, createProjectDataSourceForCLI } from "../helpers"

async function handler(
  request: NextRequest,
  auth: CLIAuthContext
): Promise<NextResponse> {
  const project = request.nextUrl.searchParams.get("project")
  const name = request.nextUrl.searchParams.get("name")
  const version = request.nextUrl.searchParams.get("version") ?? undefined
  const spec = request.nextUrl.searchParams.get("spec") ?? undefined

  if (!project || !name) {
    return NextResponse.json(
      { error: "project and name parameters required" },
      { status: 400 }
    )
  }

  const gitHubClient = createGitHubClientForCLI(auth.accessToken)
  const projectDataSource = createProjectDataSourceForCLI(gitHubClient)

  const openAPIService = new OpenAPIService(gitHubClient, projectDataSource)

  try {
    const schema = await openAPIService.getSchema(project, name, version, spec)
    return NextResponse.json({ schema })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Schema not found" },
      { status: 404 }
    )
  }
}

export const GET = withAuth(handler)
```

**Step 4: Run test to verify it passes**

Run: `npm test -- __test__/api/cli/schema.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add __test__/api/cli/schema.test.ts src/app/api/cli/schema/route.ts
git commit -m "feat(cli): add schema details endpoint"
```

---

### Task 1.12: Refactor Projects Routes to Use Helpers

**Files:**
- Modify: `src/app/api/cli/projects/route.ts`
- Modify: `src/app/api/cli/projects/[name]/route.ts`

**Step 1: Update projects/route.ts to use helpers**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../middleware"
import { createGitHubClientForCLI, createProjectDataSourceForCLI } from "../helpers"

async function handler(
  request: NextRequest,
  auth: CLIAuthContext
): Promise<NextResponse> {
  const gitHubClient = createGitHubClientForCLI(auth.accessToken)
  const projectDataSource = createProjectDataSourceForCLI(gitHubClient)
  const projects = await projectDataSource.getProjects()

  return NextResponse.json({ projects })
}

export const GET = withAuth(handler)
```

**Step 2: Update projects/[name]/route.ts to use helpers**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../../middleware"
import { createGitHubClientForCLI, createProjectDataSourceForCLI } from "../../helpers"

type RouteParams = { params: Promise<{ name: string }> }

async function handler(
  request: NextRequest,
  auth: CLIAuthContext,
  params: RouteParams
): Promise<NextResponse> {
  const { name } = await params.params

  const gitHubClient = createGitHubClientForCLI(auth.accessToken)
  const projectDataSource = createProjectDataSourceForCLI(gitHubClient)
  const projects = await projectDataSource.getProjects()
  const project = projects.find((p) => p.name === name)

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({ project })
}

export async function GET(
  request: NextRequest,
  params: RouteParams
): Promise<NextResponse> {
  const wrappedHandler = withAuth((req, auth) => handler(req, auth, params))
  return wrappedHandler(request)
}
```

**Step 3: Run all CLI tests**

Run: `npm test -- --testPathPattern="__test__/api/cli"`
Expected: All PASS

**Step 4: Commit**

```bash
git add src/app/api/cli/projects/route.ts src/app/api/cli/projects/[name]/route.ts
git commit -m "refactor(cli): use shared helpers in projects routes"
```

---

## Phase 2: CLI Package Setup

### Task 2.1: Initialize CLI Package

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/src/index.ts`

**Step 1: Create package directory**

Run: `mkdir -p packages/cli/src`

**Step 2: Create package.json**

Create: `packages/cli/package.json`

```json
{
  "name": "framna-docs",
  "version": "0.1.0",
  "description": "CLI for Framna Docs - OpenAPI documentation portal",
  "type": "module",
  "bin": {
    "framna-docs": "./dist/index.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "node --experimental-vm-modules ../../node_modules/.bin/jest",
    "lint": "eslint src"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "open": "^10.0.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18"
  },
  "keywords": [
    "openapi",
    "documentation",
    "cli",
    "mcp"
  ],
  "author": "",
  "license": "MIT"
}
```

**Step 3: Create tsconfig.json**

Create: `packages/cli/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__test__"]
}
```

**Step 4: Create entry point stub**

Create: `packages/cli/src/index.ts`

```typescript
#!/usr/bin/env node

console.log("Framna Docs CLI - coming soon")
```

**Step 5: Install dependencies and build**

Run: `cd packages/cli && npm install && npm run build`
Expected: Successful build with dist/index.js created

**Step 6: Test executable**

Run: `node packages/cli/dist/index.js`
Expected: "Framna Docs CLI - coming soon"

**Step 7: Commit**

```bash
git add packages/cli
git commit -m "feat(cli): initialize CLI package"
```

---

### Task 2.2: Create Config Module

**Files:**
- Create: `packages/cli/src/config.ts`

**Step 1: Write the failing test**

Create: `packages/cli/__test__/config.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from "@jest/globals"
import * as fs from "fs/promises"
import * as path from "path"
import * as os from "os"

// Mock os.homedir before importing config
const mockHomedir = jest.fn()
jest.mock("os", () => ({
  ...jest.requireActual("os"),
  homedir: mockHomedir,
}))

describe("Config", () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "framna-test-"))
    mockHomedir.mockReturnValue(tempDir)
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it("returns null when no session exists", async () => {
    const { getSession } = await import("../src/config.js")
    const session = await getSession()
    expect(session).toBeNull()
  })

  it("saves and loads session", async () => {
    const { saveSession, getSession } = await import("../src/config.js")

    await saveSession("test-session-id")
    const session = await getSession()

    expect(session).not.toBeNull()
    expect(session?.sessionId).toBe("test-session-id")
  })

  it("deletes session", async () => {
    const { saveSession, deleteSession, getSession } = await import("../src/config.js")

    await saveSession("test-session-id")
    await deleteSession()
    const session = await getSession()

    expect(session).toBeNull()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/cli && npm test -- __test__/config.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create: `packages/cli/src/config.ts`

```typescript
import * as fs from "fs/promises"
import * as path from "path"
import * as os from "os"
import { z } from "zod"

const SessionSchema = z.object({
  sessionId: z.string().uuid(),
  createdAt: z.string().datetime(),
})

export type Session = z.infer<typeof SessionSchema>

const CONFIG_DIR = ".framna-docs"
const SESSION_FILE = "session.json"

function getConfigDir(): string {
  return path.join(os.homedir(), CONFIG_DIR)
}

function getSessionPath(): string {
  return path.join(getConfigDir(), SESSION_FILE)
}

export async function getSession(): Promise<Session | null> {
  try {
    const content = await fs.readFile(getSessionPath(), "utf-8")
    const data = JSON.parse(content)
    return SessionSchema.parse(data)
  } catch {
    return null
  }
}

export async function saveSession(sessionId: string): Promise<void> {
  const configDir = getConfigDir()
  await fs.mkdir(configDir, { recursive: true })

  const session: Session = {
    sessionId,
    createdAt: new Date().toISOString(),
  }

  await fs.writeFile(getSessionPath(), JSON.stringify(session, null, 2))
}

export async function deleteSession(): Promise<void> {
  try {
    await fs.unlink(getSessionPath())
  } catch {
    // Ignore if file doesn't exist
  }
}

export function getServerUrl(): string {
  return process.env.FRAMNA_DOCS_URL ?? "https://docs.example.com"
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/cli && npm test -- __test__/config.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/cli/src/config.ts packages/cli/__test__/config.test.ts
git commit -m "feat(cli): add config module for session storage"
```

---

### Task 2.3: Create API Client Module

**Files:**
- Create: `packages/cli/src/api.ts`

**Step 1: Write the failing test**

Create: `packages/cli/__test__/api.test.ts`

```typescript
import { describe, it, expect, beforeEach, jest } from "@jest/globals"

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch as any

describe("APIClient", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("makes authenticated requests", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ projects: [] }),
    })

    const { APIClient } = await import("../src/api.js")
    const client = new APIClient("https://example.com", "session-id")

    await client.get("/api/cli/projects")

    expect(mockFetch).toHaveBeenCalledWith(
      "https://example.com/api/cli/projects",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer session-id",
        }),
      })
    )
  })

  it("throws on API errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Unauthorized" }),
    })

    const { APIClient } = await import("../src/api.js")
    const client = new APIClient("https://example.com", "session-id")

    await expect(client.get("/api/cli/projects")).rejects.toThrow("Unauthorized")
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/cli && npm test -- __test__/api.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create: `packages/cli/src/api.ts`

```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = "APIError"
  }
}

export class APIClient {
  constructor(
    private baseUrl: string,
    private sessionId?: string
  ) {}

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.sessionId) {
      headers["Authorization"] = `Bearer ${this.sessionId}`
    }

    return headers
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(path, this.baseUrl)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, value)
        }
      })
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new APIError(data.error || "Request failed", response.status)
    }

    return data as T
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = new URL(path, this.baseUrl)

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new APIError(data.error || "Request failed", response.status)
    }

    return data as T
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/cli && npm test -- __test__/api.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/cli/src/api.ts packages/cli/__test__/api.test.ts
git commit -m "feat(cli): add API client module"
```

---

## Phase 3: CLI Auth Commands

### Task 3.1: Create Auth Login Command

**Files:**
- Create: `packages/cli/src/commands/auth/login.ts`

**Step 1: Write the command implementation**

Create: `packages/cli/src/commands/auth/login.ts`

```typescript
import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import open from "open"
import { APIClient } from "../../api.js"
import { saveSession, getServerUrl } from "../../config.js"

interface DeviceFlowResponse {
  userCode: string
  verificationUri: string
  deviceCode: string
  sessionId: string
  expiresIn: number
  interval: number
}

interface StatusResponse {
  status: "pending" | "complete" | "error"
  sessionId?: string
  error?: string
}

export function createLoginCommand(): Command {
  return new Command("login")
    .description("Authenticate with Framna Docs via GitHub")
    .action(async () => {
      const serverUrl = getServerUrl()
      const client = new APIClient(serverUrl)
      const spinner = ora()

      try {
        // Initiate device flow
        spinner.start("Initiating authentication...")
        const deviceFlow = await client.post<DeviceFlowResponse>(
          "/api/cli/auth/device"
        )
        spinner.stop()

        // Show user code
        console.log()
        console.log(chalk.bold("To authenticate, visit:"))
        console.log(chalk.cyan(deviceFlow.verificationUri))
        console.log()
        console.log(chalk.bold("And enter this code:"))
        console.log(chalk.yellow.bold(deviceFlow.userCode))
        console.log()

        // Try to open browser
        try {
          await open(deviceFlow.verificationUri)
          console.log(chalk.dim("Browser opened automatically"))
        } catch {
          console.log(chalk.dim("Please open the URL manually"))
        }

        // Poll for completion
        spinner.start("Waiting for authorization...")

        const pollInterval = (deviceFlow.interval || 5) * 1000
        const maxAttempts = Math.floor((deviceFlow.expiresIn * 1000) / pollInterval)

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, pollInterval))

          const status = await client.get<StatusResponse>(
            "/api/cli/auth/status",
            { device_code: deviceFlow.deviceCode }
          )

          if (status.status === "complete" && status.sessionId) {
            spinner.succeed("Authentication successful!")
            await saveSession(status.sessionId)
            console.log(chalk.green("\nYou are now logged in."))
            return
          }

          if (status.status === "error") {
            spinner.fail("Authentication failed")
            console.error(chalk.red(status.error || "Unknown error"))
            process.exit(1)
          }
        }

        spinner.fail("Authentication timed out")
        process.exit(1)
      } catch (error) {
        spinner.fail("Authentication failed")
        console.error(
          chalk.red(error instanceof Error ? error.message : "Unknown error")
        )
        process.exit(1)
      }
    })
}
```

**Step 2: Build and test manually**

Run: `cd packages/cli && npm run build`
Expected: Successful build

**Step 3: Commit**

```bash
git add packages/cli/src/commands/auth/login.ts
git commit -m "feat(cli): add auth login command"
```

---

### Task 3.2: Create Auth Logout Command

**Files:**
- Create: `packages/cli/src/commands/auth/logout.ts`

**Step 1: Write the command implementation**

Create: `packages/cli/src/commands/auth/logout.ts`

```typescript
import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import { APIClient } from "../../api.js"
import { getSession, deleteSession, getServerUrl } from "../../config.js"

export function createLogoutCommand(): Command {
  return new Command("logout")
    .description("Log out from Framna Docs")
    .action(async () => {
      const spinner = ora()

      try {
        const session = await getSession()

        if (!session) {
          console.log(chalk.yellow("You are not logged in."))
          return
        }

        spinner.start("Logging out...")

        // Revoke session on server
        const serverUrl = getServerUrl()
        const client = new APIClient(serverUrl, session.sessionId)

        try {
          await client.post("/api/cli/auth/logout")
        } catch {
          // Ignore server errors - still delete local session
        }

        // Delete local session
        await deleteSession()

        spinner.succeed("Logged out successfully")
      } catch (error) {
        spinner.fail("Logout failed")
        console.error(
          chalk.red(error instanceof Error ? error.message : "Unknown error")
        )
        process.exit(1)
      }
    })
}
```

**Step 2: Build**

Run: `cd packages/cli && npm run build`
Expected: Successful build

**Step 3: Commit**

```bash
git add packages/cli/src/commands/auth/logout.ts
git commit -m "feat(cli): add auth logout command"
```

---

### Task 3.3: Create Auth Status Command

**Files:**
- Create: `packages/cli/src/commands/auth/status.ts`

**Step 1: Write the command implementation**

Create: `packages/cli/src/commands/auth/status.ts`

```typescript
import { Command } from "commander"
import chalk from "chalk"
import { getSession } from "../../config.js"

export function createStatusCommand(): Command {
  return new Command("status")
    .description("Check authentication status")
    .action(async () => {
      const session = await getSession()

      if (!session) {
        console.log(chalk.yellow("Not authenticated"))
        console.log(chalk.dim("Run 'framna-docs auth login' to authenticate"))
        return
      }

      console.log(chalk.green("Authenticated"))
      console.log(chalk.dim(`Session created: ${session.createdAt}`))
    })
}
```

**Step 2: Build**

Run: `cd packages/cli && npm run build`
Expected: Successful build

**Step 3: Commit**

```bash
git add packages/cli/src/commands/auth/status.ts
git commit -m "feat(cli): add auth status command"
```

---

### Task 3.4: Create Auth Command Group

**Files:**
- Create: `packages/cli/src/commands/auth/index.ts`

**Step 1: Write the command group**

Create: `packages/cli/src/commands/auth/index.ts`

```typescript
import { Command } from "commander"
import { createLoginCommand } from "./login.js"
import { createLogoutCommand } from "./logout.js"
import { createStatusCommand } from "./status.js"

export function createAuthCommand(): Command {
  const auth = new Command("auth").description("Authentication commands")

  auth.addCommand(createLoginCommand())
  auth.addCommand(createLogoutCommand())
  auth.addCommand(createStatusCommand())

  return auth
}
```

**Step 2: Build**

Run: `cd packages/cli && npm run build`
Expected: Successful build

**Step 3: Commit**

```bash
git add packages/cli/src/commands/auth/index.ts
git commit -m "feat(cli): add auth command group"
```

---

## Phase 4: CLI Project/Endpoint/Schema Commands

### Task 4.1: Create Shared Auth Helper

**Files:**
- Create: `packages/cli/src/commands/shared.ts`

**Step 1: Write the shared helper**

Create: `packages/cli/src/commands/shared.ts`

```typescript
import chalk from "chalk"
import { getSession, getServerUrl } from "../config.js"
import { APIClient } from "../api.js"

export async function getAuthenticatedClient(): Promise<APIClient> {
  const session = await getSession()

  if (!session) {
    console.error(chalk.red("Not authenticated"))
    console.error(chalk.dim("Run 'framna-docs auth login' to authenticate"))
    process.exit(1)
  }

  return new APIClient(getServerUrl(), session.sessionId)
}

export function formatTable(
  headers: string[],
  rows: string[][]
): string {
  const columnWidths = headers.map((h, i) => {
    const maxRowWidth = Math.max(...rows.map((r) => (r[i] || "").length))
    return Math.max(h.length, maxRowWidth)
  })

  const headerLine = headers
    .map((h, i) => h.padEnd(columnWidths[i]))
    .join("  ")

  const separator = columnWidths.map((w) => "-".repeat(w)).join("  ")

  const dataLines = rows
    .map((row) =>
      row.map((cell, i) => (cell || "").padEnd(columnWidths[i])).join("  ")
    )
    .join("\n")

  return `${headerLine}\n${separator}\n${dataLines}`
}
```

**Step 2: Build**

Run: `cd packages/cli && npm run build`
Expected: Successful build

**Step 3: Commit**

```bash
git add packages/cli/src/commands/shared.ts
git commit -m "feat(cli): add shared command helpers"
```

---

### Task 4.2: Create Projects Command

**Files:**
- Create: `packages/cli/src/commands/projects.ts`

**Step 1: Write the command implementation**

Create: `packages/cli/src/commands/projects.ts`

```typescript
import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import { getAuthenticatedClient, formatTable } from "./shared.js"

interface Project {
  id: string
  name: string
  displayName: string
  versions: Array<{
    name: string
    isDefault: boolean
    specifications: Array<{ name: string; isDefault: boolean }>
  }>
  owner: string
}

interface ProjectsResponse {
  projects: Project[]
}

interface ProjectResponse {
  project: Project
}

export function createProjectsCommand(): Command {
  return new Command("projects")
    .description("List all projects")
    .action(async () => {
      const spinner = ora("Fetching projects...").start()

      try {
        const client = await getAuthenticatedClient()
        const { projects } = await client.get<ProjectsResponse>(
          "/api/cli/projects"
        )

        spinner.stop()

        if (projects.length === 0) {
          console.log(chalk.yellow("No projects found"))
          return
        }

        const rows = projects.map((p) => [
          p.name,
          p.displayName,
          p.versions.map((v) => v.name).join(", "),
          p.owner,
        ])

        console.log(
          formatTable(["NAME", "DISPLAY NAME", "VERSIONS", "OWNER"], rows)
        )
      } catch (error) {
        spinner.fail("Failed to fetch projects")
        console.error(
          chalk.red(error instanceof Error ? error.message : "Unknown error")
        )
        process.exit(1)
      }
    })
}

export function createProjectCommand(): Command {
  return new Command("project")
    .description("Get project details")
    .argument("<name>", "Project name")
    .action(async (name: string) => {
      const spinner = ora("Fetching project...").start()

      try {
        const client = await getAuthenticatedClient()
        const { project } = await client.get<ProjectResponse>(
          `/api/cli/projects/${name}`
        )

        spinner.stop()

        console.log(chalk.bold(project.displayName))
        console.log(chalk.dim(`Owner: ${project.owner}`))
        console.log()

        console.log(chalk.bold("Versions:"))
        for (const version of project.versions) {
          const defaultMark = version.isDefault ? chalk.green(" (default)") : ""
          console.log(`  ${version.name}${defaultMark}`)

          for (const spec of version.specifications) {
            const specDefault = spec.isDefault ? chalk.green(" *") : ""
            console.log(chalk.dim(`    - ${spec.name}${specDefault}`))
          }
        }
      } catch (error) {
        spinner.fail("Failed to fetch project")
        console.error(
          chalk.red(error instanceof Error ? error.message : "Unknown error")
        )
        process.exit(1)
      }
    })
}
```

**Step 2: Build**

Run: `cd packages/cli && npm run build`
Expected: Successful build

**Step 3: Commit**

```bash
git add packages/cli/src/commands/projects.ts
git commit -m "feat(cli): add projects commands"
```

---

### Task 4.3: Create Endpoints Commands

**Files:**
- Create: `packages/cli/src/commands/endpoints.ts`

**Step 1: Write the command implementation**

Create: `packages/cli/src/commands/endpoints.ts`

```typescript
import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import { getAuthenticatedClient, formatTable } from "./shared.js"

interface EndpointSummary {
  path: string
  method: string
  summary?: string
  operationId?: string
  tags?: string[]
}

interface EndpointsResponse {
  endpoints: EndpointSummary[]
}

interface EndpointDetailsResponse {
  endpoint: {
    summary?: string
    description?: string
    operationId?: string
    tags?: string[]
    parameters?: Array<{
      name: string
      in: string
      required?: boolean
      description?: string
      schema?: unknown
    }>
    requestBody?: {
      description?: string
      required?: boolean
      content?: Record<string, { schema?: unknown }>
    }
    responses?: Record<
      string,
      {
        description?: string
        content?: Record<string, { schema?: unknown }>
      }
    >
  }
}

export function createEndpointsCommand(): Command {
  return new Command("endpoints")
    .description("List API endpoints")
    .argument("<project>", "Project name")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (project: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Fetching endpoints...").start()

      try {
        const client = await getAuthenticatedClient()
        const params: Record<string, string> = { project }
        if (options.version) params.version = options.version
        if (options.spec) params.spec = options.spec

        const { endpoints } = await client.get<EndpointsResponse>(
          "/api/cli/endpoints",
          params
        )

        spinner.stop()

        if (endpoints.length === 0) {
          console.log(chalk.yellow("No endpoints found"))
          return
        }

        const rows = endpoints.map((e) => [
          chalk.bold(e.method.toUpperCase()),
          e.path,
          e.summary || "",
          e.operationId || "",
        ])

        console.log(formatTable(["METHOD", "PATH", "SUMMARY", "OPERATION ID"], rows))
      } catch (error) {
        spinner.fail("Failed to fetch endpoints")
        console.error(
          chalk.red(error instanceof Error ? error.message : "Unknown error")
        )
        process.exit(1)
      }
    })
}

export function createEndpointsSearchCommand(): Command {
  return new Command("search")
    .description("Search endpoints")
    .argument("<project>", "Project name")
    .argument("<query>", "Search query")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(
      async (
        project: string,
        query: string,
        options: { version?: string; spec?: string }
      ) => {
        const spinner = ora("Searching endpoints...").start()

        try {
          const client = await getAuthenticatedClient()
          const params: Record<string, string> = { project, query }
          if (options.version) params.version = options.version
          if (options.spec) params.spec = options.spec

          const { endpoints } = await client.get<EndpointsResponse>(
            "/api/cli/endpoints/search",
            params
          )

          spinner.stop()

          if (endpoints.length === 0) {
            console.log(chalk.yellow("No endpoints found matching query"))
            return
          }

          const rows = endpoints.map((e) => [
            chalk.bold(e.method.toUpperCase()),
            e.path,
            e.summary || "",
          ])

          console.log(formatTable(["METHOD", "PATH", "SUMMARY"], rows))
        } catch (error) {
          spinner.fail("Search failed")
          console.error(
            chalk.red(error instanceof Error ? error.message : "Unknown error")
          )
          process.exit(1)
        }
      }
    )
}

export function createEndpointCommand(): Command {
  return new Command("endpoint")
    .description("Get endpoint details")
    .argument("<project>", "Project name")
    .argument("<path>", "Endpoint path (e.g., /users/{id})")
    .argument("<method>", "HTTP method")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(
      async (
        project: string,
        path: string,
        method: string,
        options: { version?: string; spec?: string }
      ) => {
        const spinner = ora("Fetching endpoint details...").start()

        try {
          const client = await getAuthenticatedClient()
          const params: Record<string, string> = { project, path, method }
          if (options.version) params.version = options.version
          if (options.spec) params.spec = options.spec

          const { endpoint } = await client.get<EndpointDetailsResponse>(
            "/api/cli/endpoint",
            params
          )

          spinner.stop()

          console.log(chalk.bold(`${method.toUpperCase()} ${path}`))
          if (endpoint.summary) {
            console.log(chalk.dim(endpoint.summary))
          }
          if (endpoint.description) {
            console.log()
            console.log(endpoint.description)
          }
          console.log()

          if (endpoint.tags?.length) {
            console.log(chalk.bold("Tags:"), endpoint.tags.join(", "))
          }

          if (endpoint.operationId) {
            console.log(chalk.bold("Operation ID:"), endpoint.operationId)
          }

          if (endpoint.parameters?.length) {
            console.log()
            console.log(chalk.bold("Parameters:"))
            for (const param of endpoint.parameters) {
              const required = param.required ? chalk.red("*") : ""
              console.log(
                `  ${param.name}${required} (${param.in}): ${param.description || ""}`
              )
            }
          }

          if (endpoint.requestBody) {
            console.log()
            console.log(chalk.bold("Request Body:"))
            if (endpoint.requestBody.description) {
              console.log(`  ${endpoint.requestBody.description}`)
            }
            if (endpoint.requestBody.content) {
              const contentTypes = Object.keys(endpoint.requestBody.content)
              console.log(`  Content-Type: ${contentTypes.join(", ")}`)
            }
          }

          if (endpoint.responses) {
            console.log()
            console.log(chalk.bold("Responses:"))
            for (const [code, response] of Object.entries(endpoint.responses)) {
              const color =
                code.startsWith("2")
                  ? chalk.green
                  : code.startsWith("4")
                    ? chalk.yellow
                    : chalk.red
              console.log(`  ${color(code)}: ${response.description || ""}`)
            }
          }
        } catch (error) {
          spinner.fail("Failed to fetch endpoint")
          console.error(
            chalk.red(error instanceof Error ? error.message : "Unknown error")
          )
          process.exit(1)
        }
      }
    )
}
```

**Step 2: Build**

Run: `cd packages/cli && npm run build`
Expected: Successful build

**Step 3: Commit**

```bash
git add packages/cli/src/commands/endpoints.ts
git commit -m "feat(cli): add endpoints commands"
```

---

### Task 4.4: Create Schemas Commands

**Files:**
- Create: `packages/cli/src/commands/schemas.ts`

**Step 1: Write the command implementation**

Create: `packages/cli/src/commands/schemas.ts`

```typescript
import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import { getAuthenticatedClient } from "./shared.js"

interface SchemasResponse {
  schemas: string[]
}

interface SchemaResponse {
  schema: unknown
}

export function createSchemasCommand(): Command {
  return new Command("schemas")
    .description("List API schemas")
    .argument("<project>", "Project name")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(async (project: string, options: { version?: string; spec?: string }) => {
      const spinner = ora("Fetching schemas...").start()

      try {
        const client = await getAuthenticatedClient()
        const params: Record<string, string> = { project }
        if (options.version) params.version = options.version
        if (options.spec) params.spec = options.spec

        const { schemas } = await client.get<SchemasResponse>(
          "/api/cli/schemas",
          params
        )

        spinner.stop()

        if (schemas.length === 0) {
          console.log(chalk.yellow("No schemas found"))
          return
        }

        console.log(chalk.bold("Schemas:"))
        for (const schema of schemas) {
          console.log(`  ${schema}`)
        }
      } catch (error) {
        spinner.fail("Failed to fetch schemas")
        console.error(
          chalk.red(error instanceof Error ? error.message : "Unknown error")
        )
        process.exit(1)
      }
    })
}

export function createSchemaCommand(): Command {
  return new Command("schema")
    .description("Get schema definition")
    .argument("<project>", "Project name")
    .argument("<name>", "Schema name")
    .option("-v, --version <version>", "Version name")
    .option("-s, --spec <spec>", "Spec name")
    .action(
      async (
        project: string,
        name: string,
        options: { version?: string; spec?: string }
      ) => {
        const spinner = ora("Fetching schema...").start()

        try {
          const client = await getAuthenticatedClient()
          const params: Record<string, string> = { project, name }
          if (options.version) params.version = options.version
          if (options.spec) params.spec = options.spec

          const { schema } = await client.get<SchemaResponse>(
            "/api/cli/schema",
            params
          )

          spinner.stop()

          console.log(chalk.bold(name))
          console.log()
          console.log(JSON.stringify(schema, null, 2))
        } catch (error) {
          spinner.fail("Failed to fetch schema")
          console.error(
            chalk.red(error instanceof Error ? error.message : "Unknown error")
          )
          process.exit(1)
        }
      }
    )
}
```

**Step 2: Build**

Run: `cd packages/cli && npm run build`
Expected: Successful build

**Step 3: Commit**

```bash
git add packages/cli/src/commands/schemas.ts
git commit -m "feat(cli): add schemas commands"
```

---

## Phase 5: MCP Serve Command

### Task 5.1: Create MCP Server Implementation

**Files:**
- Create: `packages/cli/src/mcp/server.ts`

**Step 1: Write the MCP server implementation**

Create: `packages/cli/src/mcp/server.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { APIClient } from "../api.js"

interface Project {
  id: string
  name: string
  displayName: string
  versions: Array<{
    name: string
    isDefault: boolean
    specifications: Array<{ name: string; isDefault: boolean }>
  }>
  owner: string
}

interface EndpointSummary {
  path: string
  method: string
  summary?: string
  operationId?: string
  tags?: string[]
}

const TOOLS = [
  {
    name: "list_projects",
    description: "List all available API documentation projects",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_project",
    description: "Get details about a specific project including versions and specs",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Project name" },
      },
      required: ["name"],
    },
  },
  {
    name: "list_endpoints",
    description: "List API endpoints for a project",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project name" },
        version: { type: "string", description: "Version name (optional)" },
        spec: { type: "string", description: "Spec name (optional)" },
      },
      required: ["project"],
    },
  },
  {
    name: "search_endpoints",
    description: "Search for endpoints matching a query",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project name" },
        query: { type: "string", description: "Search query" },
        version: { type: "string", description: "Version name (optional)" },
        spec: { type: "string", description: "Spec name (optional)" },
      },
      required: ["project", "query"],
    },
  },
  {
    name: "get_endpoint_details",
    description: "Get detailed information about a specific endpoint",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project name" },
        path: { type: "string", description: "Endpoint path" },
        method: { type: "string", description: "HTTP method" },
        version: { type: "string", description: "Version name (optional)" },
        spec: { type: "string", description: "Spec name (optional)" },
      },
      required: ["project", "path", "method"],
    },
  },
  {
    name: "list_schemas",
    description: "List API schemas for a project",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project name" },
        version: { type: "string", description: "Version name (optional)" },
        spec: { type: "string", description: "Spec name (optional)" },
      },
      required: ["project"],
    },
  },
  {
    name: "get_schema",
    description: "Get a specific schema definition",
    inputSchema: {
      type: "object" as const,
      properties: {
        project: { type: "string", description: "Project name" },
        name: { type: "string", description: "Schema name" },
        version: { type: "string", description: "Version name (optional)" },
        spec: { type: "string", description: "Spec name (optional)" },
      },
      required: ["project", "name"],
    },
  },
]

export function createMCPServer(client: APIClient): Server {
  const server = new Server(
    { name: "framna-docs", version: "0.1.0" },
    { capabilities: { tools: {} } }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    try {
      switch (name) {
        case "list_projects": {
          const result = await client.get<{ projects: Project[] }>(
            "/api/cli/projects"
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        case "get_project": {
          const projectName = (args as { name: string }).name
          const result = await client.get<{ project: Project }>(
            `/api/cli/projects/${projectName}`
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        case "list_endpoints": {
          const params = args as {
            project: string
            version?: string
            spec?: string
          }
          const queryParams: Record<string, string> = {
            project: params.project,
          }
          if (params.version) queryParams.version = params.version
          if (params.spec) queryParams.spec = params.spec

          const result = await client.get<{ endpoints: EndpointSummary[] }>(
            "/api/cli/endpoints",
            queryParams
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        case "search_endpoints": {
          const params = args as {
            project: string
            query: string
            version?: string
            spec?: string
          }
          const queryParams: Record<string, string> = {
            project: params.project,
            query: params.query,
          }
          if (params.version) queryParams.version = params.version
          if (params.spec) queryParams.spec = params.spec

          const result = await client.get<{ endpoints: EndpointSummary[] }>(
            "/api/cli/endpoints/search",
            queryParams
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        case "get_endpoint_details": {
          const params = args as {
            project: string
            path: string
            method: string
            version?: string
            spec?: string
          }
          const queryParams: Record<string, string> = {
            project: params.project,
            path: params.path,
            method: params.method,
          }
          if (params.version) queryParams.version = params.version
          if (params.spec) queryParams.spec = params.spec

          const result = await client.get<{ endpoint: unknown }>(
            "/api/cli/endpoint",
            queryParams
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        case "list_schemas": {
          const params = args as {
            project: string
            version?: string
            spec?: string
          }
          const queryParams: Record<string, string> = {
            project: params.project,
          }
          if (params.version) queryParams.version = params.version
          if (params.spec) queryParams.spec = params.spec

          const result = await client.get<{ schemas: string[] }>(
            "/api/cli/schemas",
            queryParams
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        case "get_schema": {
          const params = args as {
            project: string
            name: string
            version?: string
            spec?: string
          }
          const queryParams: Record<string, string> = {
            project: params.project,
            name: params.name,
          }
          if (params.version) queryParams.version = params.version
          if (params.spec) queryParams.spec = params.spec

          const result = await client.get<{ schema: unknown }>(
            "/api/cli/schema",
            queryParams
          )
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          }
        }

        default:
          return {
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
          }
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : "Unknown error",
          },
        ],
        isError: true,
      }
    }
  })

  return server
}

export async function runMCPServer(client: APIClient): Promise<void> {
  const server = createMCPServer(client)
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
```

**Step 2: Build**

Run: `cd packages/cli && npm run build`
Expected: Successful build

**Step 3: Commit**

```bash
git add packages/cli/src/mcp/server.ts
git commit -m "feat(cli): add MCP server implementation"
```

---

### Task 5.2: Create MCP Serve Command

**Files:**
- Create: `packages/cli/src/commands/mcp.ts`

**Step 1: Write the command implementation**

Create: `packages/cli/src/commands/mcp.ts`

```typescript
import { Command } from "commander"
import chalk from "chalk"
import { getSession, getServerUrl } from "../config.js"
import { APIClient } from "../api.js"
import { runMCPServer } from "../mcp/server.js"

export function createMCPCommand(): Command {
  const mcp = new Command("mcp").description("MCP server commands")

  mcp
    .command("serve")
    .description("Start stdio MCP server for Claude integration")
    .action(async () => {
      const session = await getSession()

      if (!session) {
        console.error(chalk.red("Not authenticated"))
        console.error(chalk.dim("Run 'framna-docs auth login' to authenticate"))
        process.exit(1)
      }

      const client = new APIClient(getServerUrl(), session.sessionId)

      // Run MCP server - this blocks until the connection closes
      await runMCPServer(client)
    })

  return mcp
}
```

**Step 2: Build**

Run: `cd packages/cli && npm run build`
Expected: Successful build

**Step 3: Commit**

```bash
git add packages/cli/src/commands/mcp.ts
git commit -m "feat(cli): add mcp serve command"
```

---

### Task 5.3: Wire Up CLI Entry Point

**Files:**
- Modify: `packages/cli/src/index.ts`

**Step 1: Update the entry point**

Update: `packages/cli/src/index.ts`

```typescript
#!/usr/bin/env node

import { Command } from "commander"
import { createAuthCommand } from "./commands/auth/index.js"
import {
  createProjectsCommand,
  createProjectCommand,
} from "./commands/projects.js"
import {
  createEndpointsCommand,
  createEndpointsSearchCommand,
  createEndpointCommand,
} from "./commands/endpoints.js"
import { createSchemasCommand, createSchemaCommand } from "./commands/schemas.js"
import { createMCPCommand } from "./commands/mcp.js"

const program = new Command()

program
  .name("framna-docs")
  .description("CLI for Framna Docs - OpenAPI documentation portal")
  .version("0.1.0")

// Auth commands
program.addCommand(createAuthCommand())

// Project commands
program.addCommand(createProjectsCommand())
program.addCommand(createProjectCommand())

// Endpoint commands
const endpoints = createEndpointsCommand()
endpoints.addCommand(createEndpointsSearchCommand())
program.addCommand(endpoints)
program.addCommand(createEndpointCommand())

// Schema commands
program.addCommand(createSchemasCommand())
program.addCommand(createSchemaCommand())

// MCP commands
program.addCommand(createMCPCommand())

program.parse()
```

**Step 2: Build and test help output**

Run: `cd packages/cli && npm run build && node dist/index.js --help`
Expected: Shows all commands

**Step 3: Commit**

```bash
git add packages/cli/src/index.ts
git commit -m "feat(cli): wire up all commands in entry point"
```

---

## Phase 6: Final Integration

### Task 6.1: Update Root Package.json for Workspaces

**Files:**
- Modify: `package.json` (root)

**Step 1: Add workspaces configuration**

Add to root `package.json`:

```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

**Step 2: Run npm install from root**

Run: `npm install`
Expected: Successful install with workspace linking

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add workspaces configuration"
```

---

### Task 6.2: Add NPM Scripts for CLI Development

**Files:**
- Modify: `package.json` (root)

**Step 1: Add CLI scripts to root package.json**

Add scripts:

```json
{
  "scripts": {
    "cli:build": "npm run build --workspace=packages/cli",
    "cli:dev": "npm run dev --workspace=packages/cli",
    "cli:test": "npm test --workspace=packages/cli"
  }
}
```

**Step 2: Test the scripts**

Run: `npm run cli:build`
Expected: Successful build

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add CLI development scripts"
```

---

### Task 6.3: Run All Tests and Lint

**Step 1: Run API tests**

Run: `npm test -- --testPathPattern="__test__/api/cli"`
Expected: All PASS

**Step 2: Run CLI tests**

Run: `npm run cli:test`
Expected: All PASS

**Step 3: Run lint**

Run: `npm run lint`
Expected: No errors (may have warnings)

**Step 4: Build everything**

Run: `npm run build && npm run cli:build`
Expected: Successful builds

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: lint and test fixes"
```

---

### Task 6.4: Update README with CLI Usage

**Files:**
- Create: `packages/cli/README.md`

**Step 1: Create README**

Create: `packages/cli/README.md`

```markdown
# Framna Docs CLI

CLI tool for interacting with Framna Docs - your OpenAPI documentation portal.

## Installation

```bash
npx framna-docs
```

Or install globally:

```bash
npm install -g framna-docs
```

## Authentication

```bash
# Login via GitHub device flow
framna-docs auth login

# Check auth status
framna-docs auth status

# Logout
framna-docs auth logout
```

## Usage

### Projects

```bash
# List all projects
framna-docs projects

# Get project details
framna-docs project <name>
```

### Endpoints

```bash
# List endpoints
framna-docs endpoints <project> [--version X] [--spec Y]

# Search endpoints
framna-docs endpoints search <project> <query>

# Get endpoint details
framna-docs endpoint <project> <path> <method>
```

### Schemas

```bash
# List schemas
framna-docs schemas <project>

# Get schema definition
framna-docs schema <project> <name>
```

## MCP Integration

Add to Claude Code:

```bash
claude mcp add framna-docs -- npx framna-docs mcp serve
```

The MCP server exposes these tools:
- `list_projects` - List all projects
- `get_project` - Get project details
- `list_endpoints` - List API endpoints
- `search_endpoints` - Search endpoints
- `get_endpoint_details` - Get endpoint details
- `list_schemas` - List schemas
- `get_schema` - Get schema definition

## Configuration

Set `FRAMNA_DOCS_URL` environment variable to use a custom server:

```bash
export FRAMNA_DOCS_URL=https://your-server.com
```

Session is stored in `~/.framna-docs/session.json`.
```

**Step 2: Commit**

```bash
git add packages/cli/README.md
git commit -m "docs(cli): add README with usage instructions"
```

---

### Task 6.5: Final Verification

**Step 1: Clean build**

Run: `rm -rf packages/cli/dist && npm run cli:build`
Expected: Successful clean build

**Step 2: Verify executable**

Run: `node packages/cli/dist/index.js --help`
Expected: Shows all commands

**Step 3: Verify npx compatibility**

Run: `cd packages/cli && npm pack && ls *.tgz`
Expected: Creates framna-docs-0.1.0.tgz

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(cli): complete CLI + MCP implementation"
```

---

## Summary

This plan creates:

1. **REST API Routes** (`/api/cli/*`):
   - Auth: device, status, logout
   - Projects: list, single
   - Endpoints: list, search, details
   - Schemas: list, details

2. **CLI Package** (`packages/cli`):
   - Config module for session storage
   - API client for REST calls
   - Commands: auth, projects, endpoints, schemas, mcp

3. **MCP Server**:
   - 7 tools matching the existing HTTP MCP
   - stdio transport for Claude Code integration

**Total: 24 tasks across 6 phases**

---

Plan complete and saved to `docs/plans/2026-01-14-cli-mcp-package.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
