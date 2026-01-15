# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Framna Docs is a self-hosted web portal that centralizes OpenAPI documentation with GitHub-based authorization. It supports spec-driven development by commenting on PRs that modify OpenAPI specs with preview URLs.

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build
npm run build

# Lint (zero warnings enforced)
npm run lint

# Run all tests
npm test

# Run tests in watch mode
npm run testwatch

# Run a single test file
node --experimental-vm-modules ./node_modules/.bin/jest path/to/test.test.ts
```

**Prerequisite**: Install oasdiff CLI for OpenAPI diff functionality:
```bash
brew tap oasdiff/homebrew-oasdiff && brew install oasdiff
```

## Architecture

### Tech Stack
- Next.js 16 with App Router, React 19, TypeScript (strict mode)
- PostgreSQL + Redis for persistence and caching
- NextAuth.js with GitHub OAuth
- MUI + Tailwind CSS + Emotion for styling
- Octokit for GitHub API integration

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (auth, webhooks, diff, blob)
│   ├── (authed)/           # Protected routes (requires auth)
│   └── auth/               # Sign-in pages
├── common/                 # Shared infrastructure
│   ├── db/                 # PostgreSQL wrapper (IDB interface)
│   ├── github/             # GitHub client abstractions
│   ├── key-value-store/    # Redis wrapper (IKeyValueStore interface)
│   ├── mutex/              # Distributed locking
│   └── session/            # Session management (ISession interface)
├── features/               # Feature modules
│   ├── auth/               # Authentication (OAuth token management)
│   ├── projects/           # Project & repository management
│   ├── docs/               # Documentation viewer
│   ├── diff/               # OpenAPI spec diffing
│   └── hooks/              # GitHub webhook handlers
└── composition.ts          # Dependency injection container
```

### Feature Module Pattern

Each feature follows Clean Architecture with data/domain/view layers:
```
features/{feature}/
├── data/       # External integrations (GitHub, DB)
├── domain/     # Business logic, repositories, use cases
└── view/       # React components and hooks
```

### Key Design Patterns

- **Composition over inheritance**: Services use interface-based DI (see `composition.ts`)
- **Interface abstractions**: `ISession`, `IDB`, `IKeyValueStore`, `IGitHubClient`
- **Repository pattern**: Abstracted data sources for GitHub, PostgreSQL, Redis
- **Decorator pattern**: `OAuthTokenRefreshingGitHubClient` wraps `RepoRestrictedGitHubClient` wraps `GitHubClient`

### Tests

Tests are in `__test__/` directory, organized by feature. Test files use `*.test.ts` extension.

## Git Workflow

- `main`: Production branch
- `develop`: Staging branch (branch features from here)
- Squash merge features into `develop`
- Regular merge `develop` into `main` for releases
- Hotfixes branch from `main` and merge into both branches
