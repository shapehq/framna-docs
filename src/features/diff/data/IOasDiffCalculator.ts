import { DiffChange } from "../domain/DiffChange"

export interface DiffResult {
    from: string
    to: string
    changes: DiffChange[]
    error?: string | null
}

export interface IOasDiffCalculator {
    calculateDiff(
        owner: string,
        repository: string,
        path: string,
        baseRefOid: string,
        toRef: string
    ): Promise<DiffResult>
}
