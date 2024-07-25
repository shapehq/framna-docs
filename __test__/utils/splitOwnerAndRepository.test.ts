import { splitOwnerAndRepository } from "@/common"

test("It returns undefined when string includes no slash", async () => {
  const result = splitOwnerAndRepository("foo")
  expect(result).toBeUndefined()
})

test("It returns undefined when repository is empty", async () => {
  const result = splitOwnerAndRepository("foo/")
  expect(result).toBeUndefined()
})

test("It returns undefined when owner is empty", async () => {
  const result = splitOwnerAndRepository("/foo")
  expect(result).toBeUndefined()
})

test("It splits owner and repository", async () => {
  const result = splitOwnerAndRepository("acme/foo")
  expect(result).toEqual({ owner: "acme", repository: "foo" })
})

test("It splits owner and repository for repository name containing a slash", async () => {
  const result = splitOwnerAndRepository("acme/foo/bar")
  expect(result).toEqual({ owner: "acme", repository: "foo/bar" })
})
