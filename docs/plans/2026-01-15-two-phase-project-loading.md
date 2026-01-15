# Two-Phase Project Loading

## Problem

Project refresh takes ~15s with ~20 projects. The current implementation fetches everything upfront: all repos, all branches (100), all tags (100), all file trees, and all PR data. This creates massive GraphQL payloads even though users typically only view one project at a time.

## Solution

Split project loading into two phases:

1. **Project List** — Fast, lightweight query for sidebar
2. **Project Details** — On-demand loading when viewing a project

## Architecture

### Current Flow

```
GET /api/refresh-projects
  → Fetch ALL repos with ALL branches/tags/specs
  → Cache entire Project[] in Redis
  → Return everything to client
```

### New Flow

```
GET /api/projects (list)
  → Fetch repos with minimal data (name, owner, config)
  → Cache ProjectSummary[] in Redis (1 hour TTL)
  → Return lightweight list to client

GET /api/projects/[owner]/[repo] (details)
  → Fetch branches, tags, specs for ONE repo
  → No cache (fast enough to fetch fresh)
  → Return full Project to client
```

### Data Flow

```
App loads → fetch project list (fast) → show sidebar
User clicks project → fetch project details (fresh) → show specs
```

## Phase 1: Project List Loading

### GraphQL Query

```graphql
query ProjectList {
  search(query: "...", type: REPOSITORY) {
    nodes {
      name
      owner { login }
      configYml: object(expression: "HEAD:framna-docs.yml") { text }
      configYaml: object(expression: "HEAD:framna-docs.yaml") { text }
    }
  }
}
```

Skips: branches, tags, file trees, PR data.

### New Type

```typescript
interface ProjectSummary {
  id: string
  name: string
  displayName: string  // from config
  owner: string
  imageURL?: string    // from config
  url: string
}
```

### Caching

- Redis TTL: 1 hour (configurable)
- On app load: fetch fresh

> **Future consideration:** If instant paint becomes important, switch to cache-first with background refresh pattern.

### Expected Performance

- Current: ~15s for 20 projects
- New: <1s for 20 projects

## Phase 2: Project Details Loading

### Trigger

User navigates to a project (clicks sidebar or direct URL).

### GraphQL Query

```graphql
query ProjectDetails($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    branches: refs(refPrefix: "refs/heads/", first: 100) {
      nodes { name, target { oid, tree { entries { name } } } }
    }
    tags: refs(refPrefix: "refs/tags/", first: 100) {
      nodes { name, target { oid, tree { entries { name } } } }
    }
    pullRequests(first: 100, states: [OPEN]) {
      nodes { number, headRefName, baseRefName, files(first: 100) { nodes { path } } }
    }
  }
}
```

### Caching

- No Redis cache (single-repo query is fast ~1-2s)
- Client-side: cache in React state during session

### Loading UX

- Show skeleton/spinner while fetching
- Or: show project header immediately (from summary), load specs below

## Frontend Changes

### Current State

- `ProjectsContext` holds all `Project[]` with full details
- Sidebar and project view both read from same context

### New State

```
ProjectListContext          ProjectDetailsContext
  └─ ProjectSummary[]         └─ Map<projectId, Project>
  └─ refreshList()            └─ fetchProject(owner, repo)
                              └─ cache during session
```

**Sidebar:** Reads from `ProjectListContext` — always lightweight.

**Project view:**
1. Gets `owner/repo` from URL
2. Checks `ProjectDetailsContext` cache
3. If missing, calls `fetchProject()`
4. Renders when ready

**Direct URL navigation:**
- Project list loads in parallel with project details
- User sees project view loading state
- No need to wait for full list

## API Changes

### New Endpoints

```
GET /api/projects
  → Returns ProjectSummary[]
  → Replaces refresh-projects for list loading

GET /api/projects/[owner]/[repo]
  → Returns Project (full details)
  → New endpoint for on-demand loading
```

### Deprecation

```
POST /api/refresh-projects
  → Remove after frontend migrated
```

### Error Handling

- 404 if repo not found or user lacks access
- 401 if session expired
- Frontend falls back to "project not found" state

## Migration Strategy

### Step 1: Add New Endpoints (non-breaking)

- Implement `GET /api/projects` (list)
- Implement `GET /api/projects/[owner]/[repo]` (details)
- Keep existing `POST /api/refresh-projects` working

### Step 2: Update Frontend

- Split context into `ProjectListContext` + `ProjectDetailsContext`
- Update sidebar to use list endpoint
- Update project view to fetch details on-demand
- Test both fresh load and direct URL navigation

### Step 3: Clean Up

- Remove old `POST /api/refresh-projects` endpoint
- Remove unused caching code for full project list

## Testing

### Key Scenarios

1. **Fresh user, no cache** — List loads, click project, details load
2. **Direct URL to project** — List + details load in parallel
3. **Project not found** — User lacks access or repo deleted
4. **Large repo** — 100+ branches/tags still performant
5. **Rapid navigation** — Click project A, then B quickly (cancel in-flight requests)

### Edge Cases

- **Repo renamed:** Details endpoint 404s, list refresh shows new name
- **Access revoked:** Details returns 401/404, remove from list on next refresh
- **Config file deleted:** Project still appears in list, but no displayName/image

## Out of Scope

- PR webhook behavior (unchanged)
- Diff feature (loaded as part of project details)
- Remote specs (loaded via config, same as today)
