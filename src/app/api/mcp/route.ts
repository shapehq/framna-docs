import { NextRequest, NextResponse } from "next/server"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { createMCPServer, MCPDeviceFlowService } from "@/features/mcp/domain"
import { RedisMCPSessionStore } from "@/features/mcp/data"
import { GitHubClient } from "@/common/github"
import {
  GitHubLoginDataSource,
  GitHubProjectDataSource,
  GitHubRepositoryDataSource
} from "@/features/projects/data"
import { FilteringGitHubRepositoryDataSource } from "@/features/projects/domain"
import RedisKeyValueStore from "@/common/key-value-store/RedisKeyValueStore"
import RsaEncryptionService from "@/features/encrypt/EncryptionService"
import RemoteConfigEncoder from "@/features/projects/domain/RemoteConfigEncoder"
import { env, listFromCommaSeparatedString } from "@/common"

const SESSION_HEADER = "mcp-session-id"

// Cache for MCP server instances per session (in-memory, will reset on server restart)
const serverCache = new Map<string, { server: Server; transport: WebStandardStreamableHTTPServerTransport; lastAccess: number }>()
const SERVER_CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// Cleanup old sessions periodically
function cleanupServerCache() {
  const now = Date.now()
  serverCache.forEach((entry, sessionId) => {
    if (now - entry.lastAccess > SERVER_CACHE_TTL) {
      entry.server.close()
      serverCache.delete(sessionId)
    }
  })
}
setInterval(cleanupServerCache, 5 * 60 * 1000) // Run every 5 minutes

// Create session store (singleton for the module)
const sessionStore = new RedisMCPSessionStore({
  store: new RedisKeyValueStore(env.getOrThrow("REDIS_URL"))
})

const deviceFlowService = new MCPDeviceFlowService({
  sessionStore,
  clientId: env.getOrThrow("GITHUB_CLIENT_ID"),
})

const gitHubAppCredentials = {
  appId: env.getOrThrow("GITHUB_APP_ID"),
  clientId: env.getOrThrow("GITHUB_CLIENT_ID"),
  clientSecret: env.getOrThrow("GITHUB_CLIENT_SECRET"),
  privateKey: Buffer
    .from(env.getOrThrow("GITHUB_PRIVATE_KEY_BASE_64"), "base64")
    .toString("utf-8")
}

const encryptionService = new RsaEncryptionService({
  publicKey: Buffer.from(env.getOrThrow("ENCRYPTION_PUBLIC_KEY_BASE_64"), "base64").toString("utf-8"),
  privateKey: Buffer.from(env.getOrThrow("ENCRYPTION_PRIVATE_KEY_BASE_64"), "base64").toString("utf-8")
})

const remoteConfigEncoder = new RemoteConfigEncoder(encryptionService)

// For local development, can use MCP_DEV_TOKEN to bypass auth
const isDevEnvironment = process.env.NODE_ENV === "development"
const devToken = env.get("MCP_DEV_TOKEN")

export async function POST(req: NextRequest) {
  // Support both mcp-session-id header and Authorization: Bearer <session-id>
  let sessionId = req.headers.get(SESSION_HEADER)
  const authHeader = req.headers.get("Authorization")
  if (!sessionId && authHeader?.startsWith("Bearer ")) {
    sessionId = authHeader.slice(7)
  }

  // Check for dev token bypass (local development only)
  if (isDevEnvironment && devToken && authHeader === `Bearer ${devToken}`) {
    sessionId = "dev-session"
  }

  let session = await deviceFlowService.getSessionToken(sessionId || undefined)

  // Check for dev token bypass (creates a dev session)
  const isDevTokenAuth = isDevEnvironment && devToken && authHeader === `Bearer ${devToken}`
  if (!session && isDevTokenAuth) {
    // Create a mock dev session for local development
    session = {
      sessionId: "dev-session",
      accessToken: devToken,
      createdAt: new Date().toISOString(),
    }
  }

  // If no valid session and not using dev token, initiate device flow
  if (!session) {
    const initiation = await deviceFlowService.initiateDeviceFlow()
    return NextResponse.json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Authentication required. Please visit the verification URL and enter the code.",
        data: {
          verificationUri: initiation.verificationUri,
          userCode: initiation.userCode,
          deviceCode: initiation.deviceCode,
          sessionId: initiation.sessionId,
          expiresIn: initiation.expiresIn,
          interval: initiation.interval,
        },
      },
    }, {
      status: 401,
      headers: { [SESSION_HEADER]: initiation.sessionId },
    })
  }

  // Check cache for existing server/transport
  let cached = serverCache.get(session.sessionId)

  if (!cached) {
    // Create GitHub client with session token
    const gitHubClient = new GitHubClient({
      ...gitHubAppCredentials,
      oauthTokenDataSource: {
        getOAuthToken: async () => ({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken || "",
        }),
      },
    })

    const projectDataSource = new GitHubProjectDataSource({
      repositoryDataSource: new FilteringGitHubRepositoryDataSource({
        hiddenRepositories: listFromCommaSeparatedString(env.get("HIDDEN_REPOSITORIES")),
        dataSource: new GitHubRepositoryDataSource({
          loginsDataSource: new GitHubLoginDataSource({
            graphQlClient: gitHubClient
          }),
          graphQlClient: gitHubClient,
          repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
          projectConfigurationFilename: env.getOrThrow("FRAMNA_DOCS_PROJECT_CONFIGURATION_FILENAME")
        })
      }),
      repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
      encryptionService: encryptionService,
      remoteConfigEncoder: remoteConfigEncoder
    })

    // Create MCP server with authenticated client
    const server = createMCPServer({ gitHubClient, projectDataSource })

    // Create transport and connect server
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: () => session.sessionId,
    })

    await server.connect(transport)

    cached = { server, transport, lastAccess: Date.now() }
    serverCache.set(session.sessionId, cached)
  } else {
    cached.lastAccess = Date.now()
  }

  // Handle the request - patch Accept header if missing required values
  const acceptHeader = req.headers.get("Accept") || ""
  let patchedReq = req
  if (!acceptHeader.includes("text/event-stream") || !acceptHeader.includes("application/json")) {
    const headers = new Headers(req.headers)
    headers.set("Accept", "application/json, text/event-stream")
    patchedReq = new NextRequest(req.url, {
      method: req.method,
      headers,
      body: req.body,
      duplex: "half",
    })
  }

  const response = await cached.transport.handleRequest(patchedReq)

  return response
}

export async function GET(req: NextRequest) {
  const sessionId = req.headers.get(SESSION_HEADER)
  const session = await deviceFlowService.getSessionToken(sessionId || undefined)

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  // Check cache for existing server/transport
  let cached = serverCache.get(session.sessionId)

  if (!cached) {
    // Create GitHub client with session token
    const gitHubClient = new GitHubClient({
      ...gitHubAppCredentials,
      oauthTokenDataSource: {
        getOAuthToken: async () => ({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken || "",
        }),
      },
    })

    const projectDataSource = new GitHubProjectDataSource({
      repositoryDataSource: new FilteringGitHubRepositoryDataSource({
        hiddenRepositories: listFromCommaSeparatedString(env.get("HIDDEN_REPOSITORIES")),
        dataSource: new GitHubRepositoryDataSource({
          loginsDataSource: new GitHubLoginDataSource({
            graphQlClient: gitHubClient
          }),
          graphQlClient: gitHubClient,
          repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
          projectConfigurationFilename: env.getOrThrow("FRAMNA_DOCS_PROJECT_CONFIGURATION_FILENAME")
        })
      }),
      repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
      encryptionService: encryptionService,
      remoteConfigEncoder: remoteConfigEncoder
    })

    // Create MCP server with authenticated client
    const server = createMCPServer({ gitHubClient, projectDataSource })

    // Create transport and connect server
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: () => session.sessionId,
    })

    await server.connect(transport)

    cached = { server, transport, lastAccess: Date.now() }
    serverCache.set(session.sessionId, cached)
  } else {
    cached.lastAccess = Date.now()
  }

  // Handle the SSE stream request
  const response = await cached.transport.handleRequest(req)

  return response
}

export async function DELETE(req: NextRequest) {
  const sessionId = req.headers.get(SESSION_HEADER)

  if (sessionId) {
    // Clean up cached server/transport
    const cached = serverCache.get(sessionId)
    if (cached) {
      cached.server.close()
      serverCache.delete(sessionId)
    }
    await sessionStore.delete(sessionId)
  }

  return NextResponse.json({ success: true })
}
