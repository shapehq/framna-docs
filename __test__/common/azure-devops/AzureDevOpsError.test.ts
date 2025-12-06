import { AzureDevOpsError } from "@/common/azure-devops/AzureDevOpsError"

test("It sets the error name to AzureDevOpsError", () => {
  const error = new AzureDevOpsError("Test error", 400, false)
  expect(error.name).toEqual("AzureDevOpsError")
})

test("It stores the error message", () => {
  const error = new AzureDevOpsError("Something went wrong", 500, false)
  expect(error.message).toEqual("Something went wrong")
})

test("It stores the HTTP status code", () => {
  const error = new AzureDevOpsError("Unauthorized", 401, true)
  expect(error.status).toEqual(401)
})

test("It stores the isAuthError flag when true", () => {
  const error = new AzureDevOpsError("Auth failed", 401, true)
  expect(error.isAuthError).toBe(true)
})

test("It stores the isAuthError flag when false", () => {
  const error = new AzureDevOpsError("Not found", 404, false)
  expect(error.isAuthError).toBe(false)
})

test("It is an instance of Error", () => {
  const error = new AzureDevOpsError("Test error", 400, false)
  expect(error).toBeInstanceOf(Error)
})

test("It is an instance of AzureDevOpsError", () => {
  const error = new AzureDevOpsError("Test error", 400, false)
  expect(error).toBeInstanceOf(AzureDevOpsError)
})

test("It can be caught as an Error", () => {
  let caught: Error | undefined
  try {
    throw new AzureDevOpsError("Test", 500, false)
  } catch (e) {
    caught = e as Error
  }
  expect(caught).toBeDefined()
  expect(caught?.message).toEqual("Test")
})

test("It works correctly with instanceof after being thrown", () => {
  let isAzureDevOpsError = false
  try {
    throw new AzureDevOpsError("Test", 401, true)
  } catch (e) {
    isAzureDevOpsError = e instanceof AzureDevOpsError
  }
  expect(isAzureDevOpsError).toBe(true)
})

test("It preserves status and isAuthError after being thrown", () => {
  let status: number | undefined
  let isAuthError: boolean | undefined
  try {
    throw new AzureDevOpsError("Unauthorized", 401, true)
  } catch (e) {
    if (e instanceof AzureDevOpsError) {
      status = e.status
      isAuthError = e.isAuthError
    }
  }
  expect(status).toEqual(401)
  expect(isAuthError).toBe(true)
})
