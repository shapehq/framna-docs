import { execFileSync } from "child_process"
import { DiffChange } from "@/features/diff/domain/DiffChange"
import { GitHubClient } from "@/common"
import { DiffResult, IOasDiffCalculator } from "./IOasDiffCalculator"

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
