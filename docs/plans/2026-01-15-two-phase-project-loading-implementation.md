# Two-Phase Project Loading Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split project loading into a fast list query and on-demand details query to reduce refresh time from ~15s to <1s.

**Architecture:** Introduce `ProjectSummary` type for list view, keep existing `Project` type for details. New `GET /api/projects` endpoint for list, new `GET /api/projects/[owner]/[repo]` endpoint for details. Frontend splits into two contexts.

**Tech Stack:** Next.js App Router, Zod schemas, React Context, GitHub GraphQL API

---

## Task 1: Create ProjectSummary Type

**Files:**
- Create: `src/features/projects/domain/ProjectSummary.ts`
- Modify: `src/features/projects/domain/index.ts`

**Step 1: Create the ProjectSummary schema**

Create `src/features/projects/domain/ProjectSummary.ts`:

```typescript
import { z } from "zod"

export const ProjectSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  owner: z.string(),
  imageURL: z.string().optional(),
  url: z.string().optional(),
  ownerUrl: z.string()
})

type ProjectSummary = z.infer<typeof ProjectSummarySchema>

export default ProjectSummary
```

**Step 2: Export from domain index**

Add to `src/features/projects/domain/index.ts`:

```typescript
export { default as ProjectSummary, ProjectSummarySchema } from "./ProjectSummary"
```

**Step 3: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 4: Commit**

```bash
git add src/features/projects/domain/ProjectSummary.ts src/features/projects/domain/index.ts
git commit -m "Add ProjectSummary type for lightweight project list"
```

---

## Task 2: Create IProjectListDataSource Interface

**Files:**
- Create: `src/features/projects/domain/IProjectListDataSource.ts`
- Modify: `src/features/projects/domain/index.ts`

**Step 1: Create the interface**

Create `src/features/projects/domain/IProjectListDataSource.ts`:

```typescript
import ProjectSummary from "./ProjectSummary"

export default interface IProjectListDataSource {
  getProjectList(): Promise<ProjectSummary[]>
}
```

**Step 2: Export from domain index**

Add to `src/features/projects/domain/index.ts`:

```typescript
export { default as IProjectListDataSource } from "./IProjectListDataSource"
```

**Step 3: Commit**

```bash
git add src/features/projects/domain/IProjectListDataSource.ts src/features/projects/domain/index.ts
git commit -m "Add IProjectListDataSource interface"
```

---

## Task 3: Create GitHubProjectListDataSource

**Files:**
- Create: `src/features/projects/data/GitHubProjectListDataSource.ts`
- Modify: `src/features/projects/data/index.ts`

**Step 1: Create the data source**

Create `src/features/projects/data/GitHubProjectListDataSource.ts`:

```typescript
import {
  ProjectSummary,
  IProjectListDataSource,
  IGitHubLoginDataSource,
  IGitHubGraphQLClient,
  ProjectConfigParser
} from "../domain"

type GraphQLProjectListRepository = {
  readonly name: string
  readonly owner: {
    readonly login: string
  }
  readonly configYml?: {
    readonly text: string
  }
  readonly configYaml?: {
    readonly text: string
  }
}

export default class GitHubProjectListDataSource implements IProjectListDataSource {
  private readonly loginsDataSource: IGitHubLoginDataSource
  private readonly graphQlClient: IGitHubGraphQLClient
  private readonly repositoryNameSuffix: string
  private readonly projectConfigurationFilename: string

  constructor(config: {
    loginsDataSource: IGitHubLoginDataSource
    graphQlClient: IGitHubGraphQLClient
    repositoryNameSuffix: string
    projectConfigurationFilename: string
  }) {
    this.loginsDataSource = config.loginsDataSource
    this.graphQlClient = config.graphQlClient
    this.repositoryNameSuffix = config.repositoryNameSuffix
    this.projectConfigurationFilename = config.projectConfigurationFilename.replace(/\.ya?ml$/, "")
  }

  async getProjectList(): Promise<ProjectSummary[]> {
    const logins = await this.loginsDataSource.getLogins()
    const repositories = await this.getRepositoriesForLogins(logins)
    return repositories
      .map(repo => this.mapToSummary(repo))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  private async getRepositoriesForLogins(logins: string[]): Promise<GraphQLProjectListRepository[]> {
    const searchQueries: string[] = [
      `"${this.repositoryNameSuffix}" in:name is:private`,
      ...logins.map(login => `"${this.repositoryNameSuffix}" in:name user:${login} is:public`)
    ]

    const results = await Promise.all(
      searchQueries.map(query => this.searchRepositories(query))
    )

    const allRepos = results.flat()
    const uniqueRepos = this.deduplicateRepositories(allRepos)
    return uniqueRepos.filter(repo => repo.name.endsWith(this.repositoryNameSuffix))
  }

  private async searchRepositories(
    searchQuery: string,
    cursor?: string
  ): Promise<GraphQLProjectListRepository[]> {
    const request = {
      query: `
      query ProjectList($searchQuery: String!, $cursor: String) {
        search(query: $searchQuery, type: REPOSITORY, first: 100, after: $cursor) {
          results: nodes {
            ... on Repository {
              name
              owner { login }
              configYml: object(expression: "HEAD:${this.projectConfigurationFilename}.yml") {
                ... on Blob { text }
              }
              configYaml: object(expression: "HEAD:${this.projectConfigurationFilename}.yaml") {
                ... on Blob { text }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
      `,
      variables: { searchQuery, cursor }
    }

    const response = await this.graphQlClient.graphql(request)
    if (!response.search?.results) {
      return []
    }

    const pageInfo = response.search.pageInfo
    if (!pageInfo?.hasNextPage || !pageInfo?.endCursor) {
      return response.search.results
    }

    const nextResults = await this.searchRepositories(searchQuery, pageInfo.endCursor)
    return response.search.results.concat(nextResults)
  }

  private deduplicateRepositories(repos: GraphQLProjectListRepository[]): GraphQLProjectListRepository[] {
    const seen = new Set<string>()
    return repos.filter(repo => {
      const key = `${repo.owner.login}/${repo.name}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private mapToSummary(repo: GraphQLProjectListRepository): ProjectSummary {
    const config = this.parseConfig(repo)
    const defaultName = repo.name.replace(new RegExp(this.repositoryNameSuffix + "$"), "")

    return {
      id: `${repo.owner.login}-${defaultName}`,
      name: defaultName,
      displayName: config?.name || defaultName,
      owner: repo.owner.login,
      imageURL: config?.image ? this.makeImageURL(repo.owner.login, repo.name, config.image) : undefined,
      url: `https://github.com/${repo.owner.login}/${repo.name}`,
      ownerUrl: `https://github.com/${repo.owner.login}`
    }
  }

  private parseConfig(repo: GraphQLProjectListRepository) {
    const yml = repo.configYml || repo.configYaml
    if (!yml?.text) return null
    const parser = new ProjectConfigParser()
    return parser.parse(yml.text)
  }

  private makeImageURL(owner: string, repo: string, imagePath: string): string {
    return `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${imagePath}`
  }
}
```

**Step 2: Export from data index**

Add to `src/features/projects/data/index.ts`:

```typescript
export { default as GitHubProjectListDataSource } from "./GitHubProjectListDataSource"
```

**Step 3: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 4: Commit**

```bash
git add src/features/projects/data/GitHubProjectListDataSource.ts src/features/projects/data/index.ts
git commit -m "Add GitHubProjectListDataSource for fast project list queries"
```

---

## Task 4: Create IProjectDetailsDataSource Interface

**Files:**
- Create: `src/features/projects/domain/IProjectDetailsDataSource.ts`
- Modify: `src/features/projects/domain/index.ts`

**Step 1: Create the interface**

Create `src/features/projects/domain/IProjectDetailsDataSource.ts`:

```typescript
import Project from "./Project"

export default interface IProjectDetailsDataSource {
  getProjectDetails(owner: string, repo: string): Promise<Project | null>
}
```

**Step 2: Export from domain index**

Add to `src/features/projects/domain/index.ts`:

```typescript
export { default as IProjectDetailsDataSource } from "./IProjectDetailsDataSource"
```

**Step 3: Commit**

```bash
git add src/features/projects/domain/IProjectDetailsDataSource.ts src/features/projects/domain/index.ts
git commit -m "Add IProjectDetailsDataSource interface"
```

---

## Task 5: Create GitHubProjectDetailsDataSource

This task extracts single-repo fetching logic from `GitHubRepositoryDataSource` and `GitHubProjectDataSource`.

**Files:**
- Create: `src/features/projects/data/GitHubProjectDetailsDataSource.ts`
- Modify: `src/features/projects/data/index.ts`

**Step 1: Create the data source**

Create `src/features/projects/data/GitHubProjectDetailsDataSource.ts`:

```typescript
import { createHash } from "crypto"
import { IEncryptionService } from "@/features/encrypt/EncryptionService"
import {
  Project,
  Version,
  IProjectDetailsDataSource,
  IGitHubGraphQLClient,
  ProjectConfigParser,
  IProjectConfig,
  ProjectConfigRemoteVersion,
  ProjectConfigRemoteSpecification
} from "../domain"
import RemoteConfig from "../domain/RemoteConfig"
import { IRemoteConfigEncoder } from "../domain/RemoteConfigEncoder"

type GraphQLRef = {
  name: string
  target: {
    oid: string
    tree: {
      entries: { name: string }[]
    }
  }
}

type GraphQLPullRequest = {
  number: number
  headRefName: string
  baseRefName: string
  baseRefOid: string
  files?: {
    nodes?: { path: string }[]
  }
}

export default class GitHubProjectDetailsDataSource implements IProjectDetailsDataSource {
  private readonly graphQlClient: IGitHubGraphQLClient
  private readonly repositoryNameSuffix: string
  private readonly projectConfigurationFilename: string
  private readonly encryptionService: IEncryptionService
  private readonly remoteConfigEncoder: IRemoteConfigEncoder

  constructor(config: {
    graphQlClient: IGitHubGraphQLClient
    repositoryNameSuffix: string
    projectConfigurationFilename: string
    encryptionService: IEncryptionService
    remoteConfigEncoder: IRemoteConfigEncoder
  }) {
    this.graphQlClient = config.graphQlClient
    this.repositoryNameSuffix = config.repositoryNameSuffix
    this.projectConfigurationFilename = config.projectConfigurationFilename.replace(/\.ya?ml$/, "")
    this.encryptionService = config.encryptionService
    this.remoteConfigEncoder = config.remoteConfigEncoder
  }

  async getProjectDetails(owner: string, repo: string): Promise<Project | null> {
    const repoName = repo.endsWith(this.repositoryNameSuffix)
      ? repo
      : `${repo}${this.repositoryNameSuffix}`

    const response = await this.fetchRepository(owner, repoName)
    if (!response.repository) {
      return null
    }

    const repository = response.repository
    const pullRequests = this.mapPullRequests(repository.pullRequests?.edges || [])

    return this.mapToProject({
      owner,
      name: repository.name,
      defaultBranchRef: repository.defaultBranchRef,
      configYml: repository.configYml,
      configYaml: repository.configYaml,
      branches: repository.branches?.edges?.map((e: { node: GraphQLRef }) => e.node) || [],
      tags: repository.tags?.edges?.map((e: { node: GraphQLRef }) => e.node) || [],
      pullRequests
    })
  }

  private async fetchRepository(owner: string, name: string) {
    const request = {
      query: `
      query ProjectDetails($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          name
          defaultBranchRef {
            name
            target {
              ... on Commit { oid }
            }
          }
          configYml: object(expression: "HEAD:${this.projectConfigurationFilename}.yml") {
            ... on Blob { text }
          }
          configYaml: object(expression: "HEAD:${this.projectConfigurationFilename}.yaml") {
            ... on Blob { text }
          }
          branches: refs(refPrefix: "refs/heads/", first: 100) {
            edges {
              node {
                name
                target {
                  ... on Commit {
                    oid
                    tree { entries { name } }
                  }
                }
              }
            }
          }
          tags: refs(refPrefix: "refs/tags/", first: 100) {
            edges {
              node {
                name
                target {
                  ... on Commit {
                    oid
                    tree { entries { name } }
                  }
                }
              }
            }
          }
          pullRequests(first: 100, states: [OPEN]) {
            edges {
              node {
                number
                headRefName
                baseRefName
                baseRefOid
                files(first: 100) {
                  nodes { path }
                }
              }
            }
          }
        }
      }
      `,
      variables: { owner, name }
    }

    return await this.graphQlClient.graphql(request)
  }

  private mapPullRequests(edges: { node: GraphQLPullRequest }[]): Map<string, {
    number: number
    baseRefName: string
    baseRefOid: string
    changedFiles: string[]
  }> {
    const map = new Map()
    for (const edge of edges) {
      const pr = edge.node
      map.set(pr.headRefName, {
        number: pr.number,
        baseRefName: pr.baseRefName,
        baseRefOid: pr.baseRefOid,
        changedFiles: pr.files?.nodes?.map(f => f.path) || []
      })
    }
    return map
  }

  private mapToProject(data: {
    owner: string
    name: string
    defaultBranchRef: { name: string; target: { oid: string } }
    configYml?: { text: string }
    configYaml?: { text: string }
    branches: GraphQLRef[]
    tags: GraphQLRef[]
    pullRequests: Map<string, { number: number; baseRefName: string; baseRefOid: string; changedFiles: string[] }>
  }): Project {
    const config = this.parseConfig(data.configYml, data.configYaml)
    const defaultName = data.name.replace(new RegExp(this.repositoryNameSuffix + "$"), "")

    let imageURL: string | undefined
    if (config?.image) {
      imageURL = `/api/blob/${data.owner}/${data.name}/${encodeURIComponent(config.image)}?ref=${data.defaultBranchRef.target.oid}`
    }

    const branchVersions = data.branches.map(branch => {
      const pr = data.pullRequests.get(branch.name)
      return this.mapVersion({
        owner: data.owner,
        repoName: data.name,
        ref: branch,
        isDefault: branch.name === data.defaultBranchRef.name,
        pr
      })
    })

    const tagVersions = data.tags.map(tag =>
      this.mapVersion({ owner: data.owner, repoName: data.name, ref: tag })
    )

    let versions = this.sortVersions(
      this.addRemoteVersions(
        [...branchVersions, ...tagVersions],
        config?.remoteVersions || []
      ),
      data.defaultBranchRef.name
    )
    .filter(v => v.specifications.length > 0)
    .map(v => this.setDefaultSpecification(v, config?.defaultSpecificationName))

    return {
      id: `${data.owner}-${defaultName}`,
      owner: data.owner,
      name: defaultName,
      displayName: config?.name || defaultName,
      versions,
      imageURL,
      ownerUrl: `https://github.com/${data.owner}`,
      url: `https://github.com/${data.owner}/${data.name}`
    }
  }

  private parseConfig(configYml?: { text: string }, configYaml?: { text: string }): IProjectConfig | null {
    const yml = configYml || configYaml
    if (!yml?.text) return null
    return new ProjectConfigParser().parse(yml.text)
  }

  private mapVersion(params: {
    owner: string
    repoName: string
    ref: GraphQLRef
    isDefault?: boolean
    pr?: { number: number; baseRefName: string; baseRefOid: string; changedFiles: string[] }
  }): Version {
    const { owner, repoName, ref, isDefault, pr } = params

    const specifications = ref.target.tree.entries
      .filter(f => this.isOpenAPISpec(f.name))
      .map(file => {
        const isChanged = pr?.changedFiles.includes(file.name) ?? false
        return {
          id: file.name,
          name: file.name,
          url: `/api/blob/${owner}/${repoName}/${encodeURIComponent(file.name)}?ref=${ref.target.oid}`,
          editURL: `https://github.com/${owner}/${repoName}/edit/${ref.name}/${encodeURIComponent(file.name)}`,
          diffURL: isChanged ? `/api/diff/${owner}/${repoName}/${encodeURIComponent(file.name)}?baseRefOid=${pr!.baseRefOid}&to=${ref.target.oid}` : undefined,
          diffBaseBranch: isChanged ? pr!.baseRefName : undefined,
          diffBaseOid: isChanged ? pr!.baseRefOid : undefined,
          diffPrUrl: isChanged ? `https://github.com/${owner}/${repoName}/pull/${pr!.number}` : undefined,
          isDefault: false
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    return {
      id: ref.name,
      name: ref.name,
      specifications,
      url: `https://github.com/${owner}/${repoName}/tree/${ref.name}`,
      isDefault: isDefault || false
    }
  }

  private isOpenAPISpec(filename: string): boolean {
    return !filename.startsWith(".") && (filename.endsWith(".yml") || filename.endsWith(".yaml"))
  }

  private sortVersions(versions: Version[], defaultBranchName: string): Version[] {
    const priority = [defaultBranchName, "main", "master", "develop", "development", "trunk"].reverse()
    const sorted = [...versions].sort((a, b) => a.name.localeCompare(b.name))

    for (const branch of priority) {
      const idx = sorted.findIndex(v => v.name === branch)
      if (idx !== -1) {
        const [version] = sorted.splice(idx, 1)
        sorted.unshift(version)
      }
    }
    return sorted
  }

  private addRemoteVersions(versions: Version[], remoteVersions: ProjectConfigRemoteVersion[]): Version[] {
    const result = [...versions]
    const ids = result.map(v => v.id)

    for (const rv of remoteVersions) {
      const baseId = this.makeURLSafeID((rv.id || rv.name).toLowerCase())
      const count = ids.filter(id => id === baseId).length
      const versionId = baseId + (count > 0 ? count : "")

      const specifications = rv.specifications.map(spec => {
        const remoteConfig: RemoteConfig = {
          url: spec.url,
          auth: this.tryDecryptAuth(spec)
        }
        const encoded = this.remoteConfigEncoder.encode(remoteConfig)
        const hash = createHash("sha256").update(JSON.stringify(remoteConfig)).digest("hex").slice(0, 16)

        return {
          id: this.makeURLSafeID((spec.id || spec.name).toLowerCase()),
          name: spec.name,
          url: `/api/remotes/${encoded}`,
          urlHash: hash,
          isDefault: false
        }
      })

      result.push({ id: versionId, name: rv.name, specifications, isDefault: false })
      ids.push(baseId)
    }

    return result
  }

  private makeURLSafeID(str: string): string {
    return str.replace(/ /g, "-").replace(/[^A-Za-z0-9-]/g, "")
  }

  private tryDecryptAuth(spec: ProjectConfigRemoteSpecification) {
    if (!spec.auth) return undefined
    try {
      return {
        type: spec.auth.type,
        username: this.encryptionService.decrypt(spec.auth.encryptedUsername),
        password: this.encryptionService.decrypt(spec.auth.encryptedPassword)
      }
    } catch {
      return undefined
    }
  }

  private setDefaultSpecification(version: Version, defaultName?: string): Version {
    return {
      ...version,
      specifications: version.specifications.map(spec => ({
        ...spec,
        isDefault: spec.name === defaultName
      }))
    }
  }
}
```

**Step 2: Export from data index**

Add to `src/features/projects/data/index.ts`:

```typescript
export { default as GitHubProjectDetailsDataSource } from "./GitHubProjectDetailsDataSource"
```

**Step 3: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 4: Commit**

```bash
git add src/features/projects/data/GitHubProjectDetailsDataSource.ts src/features/projects/data/index.ts
git commit -m "Add GitHubProjectDetailsDataSource for single-repo queries"
```

---

## Task 6: Create GET /api/projects Endpoint

**Files:**
- Create: `src/app/api/projects/route.ts`

**Step 1: Create the API route**

Create `src/app/api/projects/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { projectListDataSource } from "@/composition"

export async function GET() {
  try {
    const projects = await projectListDataSource.getProjectList()
    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Failed to fetch project list:", error)
    return NextResponse.json(
      { error: "Failed to fetch project list" },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit (composition not wired yet, will fail - that's expected)**

```bash
git add src/app/api/projects/route.ts
git commit -m "Add GET /api/projects endpoint for project list"
```

---

## Task 7: Create GET /api/projects/[owner]/[repo] Endpoint

**Files:**
- Create: `src/app/api/projects/[owner]/[repo]/route.ts`

**Step 1: Create the API route**

Create `src/app/api/projects/[owner]/[repo]/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { projectDetailsDataSource } from "@/composition"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params

  try {
    const project = await projectDetailsDataSource.getProjectDetails(owner, repo)

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error(`Failed to fetch project details for ${owner}/${repo}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch project details" },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/projects/[owner]/[repo]/route.ts
git commit -m "Add GET /api/projects/[owner]/[repo] endpoint for project details"
```

---

## Task 8: Wire Up New Data Sources in Composition

**Files:**
- Modify: `src/composition.ts`

**Step 1: Add imports and create new data sources**

Add imports at top of `src/composition.ts`:

```typescript
import {
  GitHubLoginDataSource,
  GitHubProjectDataSource,
  GitHubRepositoryDataSource,
  GitHubProjectListDataSource,
  GitHubProjectDetailsDataSource
} from "@/features/projects/data"
```

Add after `projectDataSource` definition (around line 208):

```typescript
export const projectListDataSource = new GitHubProjectListDataSource({
  loginsDataSource: new GitHubLoginDataSource({
    graphQlClient: userGitHubClient
  }),
  graphQlClient: userGitHubClient,
  repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
  projectConfigurationFilename: env.getOrThrow("FRAMNA_DOCS_PROJECT_CONFIGURATION_FILENAME")
})

export const projectDetailsDataSource = new GitHubProjectDetailsDataSource({
  graphQlClient: userGitHubClient,
  repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
  projectConfigurationFilename: env.getOrThrow("FRAMNA_DOCS_PROJECT_CONFIGURATION_FILENAME"),
  encryptionService: encryptionService,
  remoteConfigEncoder: remoteConfigEncoder
})
```

**Step 2: Run lint and build**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/composition.ts
git commit -m "Wire up project list and details data sources"
```

---

## Task 9: Create ProjectListContext

**Files:**
- Create: `src/features/projects/view/ProjectListContext.tsx`
- Create: `src/features/projects/view/ProjectListContextProvider.tsx`

**Step 1: Create the context**

Create `src/features/projects/view/ProjectListContext.tsx`:

```typescript
"use client"

import { createContext, useContext } from "react"
import { ProjectSummary } from "@/features/projects/domain"

export interface ProjectListContextValue {
  projects: ProjectSummary[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export const ProjectListContext = createContext<ProjectListContextValue | null>(null)

export function useProjectList() {
  const context = useContext(ProjectListContext)
  if (!context) {
    throw new Error("useProjectList must be used within ProjectListContextProvider")
  }
  return context
}
```

**Step 2: Create the provider**

Create `src/features/projects/view/ProjectListContextProvider.tsx`:

```typescript
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ProjectSummary } from "@/features/projects/domain"
import { ProjectListContext } from "./ProjectListContext"

export default function ProjectListContextProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isLoadingRef = useRef(false)

  const refresh = useCallback(() => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setLoading(true)
    setError(null)

    fetch("/api/projects")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(({ projects }) => {
        setProjects(projects || [])
      })
      .catch(err => {
        console.error("Failed to fetch project list:", err)
        setError("Failed to load projects")
      })
      .finally(() => {
        isLoadingRef.current = false
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <ProjectListContext.Provider value={{ projects, loading, error, refresh }}>
      {children}
    </ProjectListContext.Provider>
  )
}
```

**Step 3: Commit**

```bash
git add src/features/projects/view/ProjectListContext.tsx src/features/projects/view/ProjectListContextProvider.tsx
git commit -m "Add ProjectListContext for lightweight project list"
```

---

## Task 10: Create ProjectDetailsContext

**Files:**
- Create: `src/features/projects/view/ProjectDetailsContext.tsx`
- Create: `src/features/projects/view/ProjectDetailsContextProvider.tsx`

**Step 1: Create the context**

Create `src/features/projects/view/ProjectDetailsContext.tsx`:

```typescript
"use client"

import { createContext, useContext } from "react"
import { Project } from "@/features/projects/domain"

export interface ProjectDetailsContextValue {
  getProject: (owner: string, repo: string) => Project | undefined
  fetchProject: (owner: string, repo: string) => Promise<Project | null>
  isLoading: (owner: string, repo: string) => boolean
  getError: (owner: string, repo: string) => string | null
}

export const ProjectDetailsContext = createContext<ProjectDetailsContextValue | null>(null)

export function useProjectDetails() {
  const context = useContext(ProjectDetailsContext)
  if (!context) {
    throw new Error("useProjectDetails must be used within ProjectDetailsContextProvider")
  }
  return context
}
```

**Step 2: Create the provider**

Create `src/features/projects/view/ProjectDetailsContextProvider.tsx`:

```typescript
"use client"

import { useState, useCallback, useRef } from "react"
import { Project } from "@/features/projects/domain"
import { ProjectDetailsContext } from "./ProjectDetailsContext"

type CacheEntry = {
  project: Project | null
  loading: boolean
  error: string | null
}

export default function ProjectDetailsContextProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map())
  const inFlightRef = useRef<Map<string, Promise<Project | null>>>(new Map())

  const makeKey = (owner: string, repo: string) => `${owner}/${repo}`

  const getProject = useCallback((owner: string, repo: string): Project | undefined => {
    const entry = cache.get(makeKey(owner, repo))
    return entry?.project ?? undefined
  }, [cache])

  const isLoading = useCallback((owner: string, repo: string): boolean => {
    return cache.get(makeKey(owner, repo))?.loading ?? false
  }, [cache])

  const getError = useCallback((owner: string, repo: string): string | null => {
    return cache.get(makeKey(owner, repo))?.error ?? null
  }, [cache])

  const fetchProject = useCallback(async (owner: string, repo: string): Promise<Project | null> => {
    const key = makeKey(owner, repo)

    // Return in-flight request if exists
    const inFlight = inFlightRef.current.get(key)
    if (inFlight) return inFlight

    // Mark as loading
    setCache(prev => {
      const next = new Map(prev)
      next.set(key, { project: prev.get(key)?.project ?? null, loading: true, error: null })
      return next
    })

    const promise = fetch(`/api/projects/${owner}/${repo}`)
      .then(res => {
        if (res.status === 404) return { project: null }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(({ project }) => {
        setCache(prev => {
          const next = new Map(prev)
          next.set(key, { project, loading: false, error: null })
          return next
        })
        return project
      })
      .catch(err => {
        console.error(`Failed to fetch project ${key}:`, err)
        setCache(prev => {
          const next = new Map(prev)
          next.set(key, { project: null, loading: false, error: "Failed to load project" })
          return next
        })
        return null
      })
      .finally(() => {
        inFlightRef.current.delete(key)
      })

    inFlightRef.current.set(key, promise)
    return promise
  }, [])

  return (
    <ProjectDetailsContext.Provider value={{ getProject, fetchProject, isLoading, getError }}>
      {children}
    </ProjectDetailsContext.Provider>
  )
}
```

**Step 3: Commit**

```bash
git add src/features/projects/view/ProjectDetailsContext.tsx src/features/projects/view/ProjectDetailsContextProvider.tsx
git commit -m "Add ProjectDetailsContext for on-demand project loading"
```

---

## Task 11: Update Layout to Use New Providers

**Files:**
- Modify: Find and update the layout that wraps authenticated routes

**Step 1: Find the layout file**

Look for the layout in `src/app/(authed)/layout.tsx` or similar.

**Step 2: Replace ProjectsContextProvider with new providers**

Replace the old `ProjectsContextProvider` with both new providers:

```typescript
import ProjectListContextProvider from "@/features/projects/view/ProjectListContextProvider"
import ProjectDetailsContextProvider from "@/features/projects/view/ProjectDetailsContextProvider"

// In the layout JSX, wrap children with:
<ProjectListContextProvider>
  <ProjectDetailsContextProvider>
    {children}
  </ProjectDetailsContextProvider>
</ProjectListContextProvider>
```

**Step 3: Run lint and build**

Run: `npm run lint && npm run build`
Expected: PASS (may have errors if components still use old context)

**Step 4: Commit**

```bash
git add src/app/\(authed\)/layout.tsx
git commit -m "Update layout to use new project list and details providers"
```

---

## Task 12: Update Sidebar to Use ProjectListContext

**Files:**
- Find and modify the sidebar component that displays the project list

**Step 1: Locate the sidebar component**

Search for components using `ProjectsContext` or displaying the project list.

**Step 2: Update to use useProjectList**

Replace:
```typescript
import { useProjects } from "@/common"
const { projects, refreshing } = useProjects()
```

With:
```typescript
import { useProjectList } from "@/features/projects/view/ProjectListContext"
const { projects, loading, refresh } = useProjectList()
```

**Step 3: Update to use ProjectSummary type**

The sidebar should only need `id`, `name`, `displayName`, `owner`, `imageURL` - all available in `ProjectSummary`.

**Step 4: Run lint and tests**

Run: `npm run lint && npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add <modified-files>
git commit -m "Update sidebar to use ProjectListContext"
```

---

## Task 13: Update Project View to Use ProjectDetailsContext

**Files:**
- Find and modify the project view component

**Step 1: Locate the project view component**

Search for components that display project versions and specifications.

**Step 2: Add useEffect to fetch project details**

```typescript
import { useProjectDetails } from "@/features/projects/view/ProjectDetailsContext"
import { useProjectList } from "@/features/projects/view/ProjectListContext"

// Get owner/repo from URL params
const { owner, repo } = useParams()

// Get summary from list (for instant header display)
const { projects } = useProjectList()
const summary = projects.find(p => p.owner === owner && p.name === repo)

// Get full details
const { getProject, fetchProject, isLoading, getError } = useProjectDetails()
const project = getProject(owner, repo)

useEffect(() => {
  if (owner && repo && !project) {
    fetchProject(owner, repo)
  }
}, [owner, repo, project, fetchProject])
```

**Step 3: Handle loading state**

Show skeleton or spinner while `isLoading(owner, repo)` is true.

**Step 4: Run lint and tests**

Run: `npm run lint && npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add <modified-files>
git commit -m "Update project view to fetch details on-demand"
```

---

## Task 14: Remove Old Refresh Endpoint and Context

**Files:**
- Delete or deprecate: `src/app/api/refresh-projects/route.ts`
- Delete or deprecate: `src/features/projects/view/ProjectsContextProvider.tsx`
- Update: `src/common/index.ts` (remove ProjectsContext export if present)

**Step 1: Search for remaining usages**

Run: `grep -r "refresh-projects" src/`
Run: `grep -r "ProjectsContext" src/`

**Step 2: Remove unused files**

Only delete files once all references are removed.

**Step 3: Run full test suite**

Run: `npm run lint && npm test && npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add -A
git commit -m "Remove deprecated refresh-projects endpoint and old context"
```

---

## Task 15: Manual Testing

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test scenarios**

1. Fresh load - project list appears quickly
2. Click project - details load
3. Direct URL navigation - both load
4. Refresh button (if present) - list refreshes

**Step 3: Verify performance improvement**

Open DevTools Network tab, measure time for:
- `GET /api/projects` - should be <1s
- `GET /api/projects/[owner]/[repo]` - should be <2s

Compare to old `POST /api/refresh-projects` time (~15s).

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Create ProjectSummary type |
| 2 | Create IProjectListDataSource interface |
| 3 | Create GitHubProjectListDataSource |
| 4 | Create IProjectDetailsDataSource interface |
| 5 | Create GitHubProjectDetailsDataSource |
| 6 | Create GET /api/projects endpoint |
| 7 | Create GET /api/projects/[owner]/[repo] endpoint |
| 8 | Wire up in composition.ts |
| 9 | Create ProjectListContext |
| 10 | Create ProjectDetailsContext |
| 11 | Update layout with new providers |
| 12 | Update sidebar to use list context |
| 13 | Update project view to use details context |
| 14 | Remove old endpoint and context |
| 15 | Manual testing |
