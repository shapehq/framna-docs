import { execFileSync } from "child_process"
import { DiffChange } from "@/features/diff/domain/DiffChange"
import { GitHubClient } from "@/common"
import { DiffResult, IOasDiffCalculator } from "./IOasDiffCalculator"

/**
 * Validates that a URL originates from a trusted GitHub domain.
 * @param url - The URL to validate
 * @returns true if the URL is from a trusted GitHub domain, false otherwise
 */
function isValidGitHubUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url)
        const trustedDomains = [
            "raw.githubusercontent.com",
            "github.com",
            "api.github.com"
        ]
        return trustedDomains.includes(parsedUrl.hostname)
    } catch {
        return false
    }
}

export class OasDiffCalculator implements IOasDiffCalculator {
    constructor(private readonly githubClient: GitHubClient) {}

    async calculateDiff(
        owner: string,
        repository: string,
        path: string,
        baseRefOid: string,
        toRef: string
    ): Promise<DiffResult> {
        // Calculate merge-base for diff
        const mergeBaseResult = await this.githubClient.compareCommitsWithBasehead({
            repositoryOwner: owner,
            repositoryName: repository,
            baseRefOid: baseRefOid,
            headRefOid: toRef
        })
        const fromRef = mergeBaseResult.mergeBaseSha

        // If comparing same refs, return empty diff
        if (fromRef === toRef) {
            return {
                from: fromRef,
                to: toRef,
                changes: []
            }
        }

        // Fetch spec content from both refs
        const spec1 = await this.githubClient.getRepositoryContent({
            repositoryOwner: owner,
            repositoryName: repository,
            path: path,
            ref: fromRef
        })

        const spec2 = await this.githubClient.getRepositoryContent({
            repositoryOwner: owner,
            repositoryName: repository,
            path: path,
            ref: toRef
        })

        // Validate URLs originate from GitHub
        if (!isValidGitHubUrl(spec1.downloadURL)) {
            throw new Error(
                `Invalid URL for base spec: ${spec1.downloadURL}. URL must originate from a trusted GitHub domain.`
            )
        }
        if (!isValidGitHubUrl(spec2.downloadURL)) {
            throw new Error(
                `Invalid URL for head spec: ${spec2.downloadURL}. URL must originate from a trusted GitHub domain.`
            )
        }

        // Execute oasdiff
        const diffData = (() => {
            try {
                const result = execFileSync(
                    "oasdiff",
                    ["changelog", "--format", "json", spec1.downloadURL, spec2.downloadURL],
                    { encoding: "utf8" }
                )
                return JSON.parse(result) as DiffChange[]
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Unknown error when executing OpenAPI diff command"
                throw new Error(
                    `Failed to execute OpenAPI diff tool. Please ensure "oasdiff" is installed and available in PATH. (${errorMessage})`
                )
            }
        })()

        return {
            from: fromRef,
            to: toRef,
            changes: diffData,
            error: null
        }
    }
}
