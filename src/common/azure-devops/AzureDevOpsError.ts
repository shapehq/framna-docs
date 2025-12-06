/**
 * Error thrown by Azure DevOps API client when requests fail.
 * Includes HTTP status code for proper error handling.
 */
export class AzureDevOpsError extends Error {
  readonly status: number
  readonly isAuthError: boolean

  constructor(message: string, status: number, isAuthError: boolean) {
    super(message)
    this.name = "AzureDevOpsError"
    this.status = status
    this.isAuthError = isAuthError
    // Restore prototype chain - required for instanceof to work with Error subclasses in TypeScript
    Object.setPrototypeOf(this, AzureDevOpsError.prototype)
  }
}

