import * as fs from "fs/promises"
import * as path from "path"
import * as os from "os"
import * as crypto from "crypto"
import { OpenAPIV3 } from "openapi-types"
import { ProjectSummary } from "../types.js"

const CACHE_DIR = ".framna-docs/cache"
const SPECS_DIR = "specs"
const PROJECTS_FILE = "projects.json"
const PROJECT_LIST_TTL_MS = 60 * 1000

function getCacheDir(): string {
  return path.join(os.homedir(), CACHE_DIR)
}

function getSpecsDir(): string {
  return path.join(getCacheDir(), SPECS_DIR)
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex").slice(0, 16)
}

export class SpecCache {
  private getSpecPath(commitSha: string): string {
    return path.join(getSpecsDir(), `${commitSha}.json`)
  }

  async getSpec(commitSha: string): Promise<OpenAPIV3.Document | null> {
    try {
      const content = await fs.readFile(this.getSpecPath(commitSha), "utf-8")
      return JSON.parse(content) as OpenAPIV3.Document
    } catch {
      return null
    }
  }

  async setSpec(commitSha: string, spec: OpenAPIV3.Document): Promise<void> {
    await fs.mkdir(getSpecsDir(), { recursive: true })
    await fs.writeFile(this.getSpecPath(commitSha), JSON.stringify(spec))
  }
}

interface ProjectsCacheData {
  projects: ProjectSummary[]
  tokenHash: string
  timestamp: number
}

export class ProjectsCache {
  private tokenHash: string

  constructor(sessionToken: string) {
    this.tokenHash = hashToken(sessionToken)
  }

  async getProjects(): Promise<ProjectSummary[] | null> {
    try {
      const content = await fs.readFile(path.join(getCacheDir(), PROJECTS_FILE), "utf-8")
      const cache = JSON.parse(content) as ProjectsCacheData
      if (cache.tokenHash !== this.tokenHash) return null
      if (Date.now() - cache.timestamp > PROJECT_LIST_TTL_MS) return null
      return cache.projects
    } catch {
      return null
    }
  }

  async setProjects(projects: ProjectSummary[]): Promise<void> {
    await fs.mkdir(getCacheDir(), { recursive: true })
    const cache: ProjectsCacheData = {
      projects,
      tokenHash: this.tokenHash,
      timestamp: Date.now(),
    }
    await fs.writeFile(path.join(getCacheDir(), PROJECTS_FILE), JSON.stringify(cache, null, 2))
  }
}

export async function clearCache(): Promise<{ cleared: string[] }> {
  const cleared: string[] = []
  try {
    await fs.unlink(path.join(getCacheDir(), PROJECTS_FILE))
    cleared.push("projects.json")
  } catch { /* ignore */ }
  try {
    const files = await fs.readdir(getSpecsDir())
    await Promise.all(files.map(async (file) => {
      await fs.unlink(path.join(getSpecsDir(), file))
      cleared.push(`specs/${file}`)
    }))
  } catch { /* ignore */ }
  return { cleared }
}

export async function getCacheStats(): Promise<{
  projectsCached: boolean
  projectsAge?: number
  specsCount: number
  totalSizeBytes: number
}> {
  let projectsCached = false
  let projectsAge: number | undefined
  let specsCount = 0
  let totalSizeBytes = 0

  try {
    const stat = await fs.stat(path.join(getCacheDir(), PROJECTS_FILE))
    projectsCached = true
    projectsAge = Date.now() - stat.mtimeMs
    totalSizeBytes += stat.size
  } catch { /* ignore */ }

  try {
    const files = await fs.readdir(getSpecsDir())
    specsCount = files.length
    const stats = await Promise.all(files.map(file => fs.stat(path.join(getSpecsDir(), file))))
    for (const stat of stats) {
      totalSizeBytes += stat.size
    }
  } catch { /* ignore */ }

  return { projectsCached, projectsAge, specsCount, totalSizeBytes }
}
