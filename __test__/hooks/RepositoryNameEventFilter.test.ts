import { RepositoryNameEventFilter } from "../../src/features/hooks/domain"

test("It does not include repositories that do not have the \"-openapi\" suffix", async () => {
  const sut = new RepositoryNameEventFilter({
    repositoryNameSuffix: "-openapi",
    allowlist: [],
    disallowlist: []
  })
  const result = sut.includeEvent({
    repositoryOwner: "acme",
    repositoryName: "foo"
  })
  expect(result).toBeFalsy()
})

test("It includes repository when both allowlist and disallowlist are empty", async () => {
  const sut = new RepositoryNameEventFilter({
    repositoryNameSuffix: "-openapi",
    allowlist: [],
    disallowlist: []
  })
  const result = sut.includeEvent({
    repositoryOwner: "acme",
    repositoryName: "foo-openapi"
  })
  expect(result).toBeTruthy()
})

test("It does not include repository when it is not on the allowlist", async () => {
  const sut = new RepositoryNameEventFilter({
    repositoryNameSuffix: "-openapi",
    allowlist: ["acme/example-openapi"],
    disallowlist: []
  })
  const result = sut.includeEvent({
    repositoryOwner: "acme",
    repositoryName: "foo"
  })
  expect(result).toBeFalsy()
})

test("It include repository when it is on the disallowlist", async () => {
  const sut = new RepositoryNameEventFilter({
    repositoryNameSuffix: "-openapi",
    allowlist: [],
    disallowlist: ["acme/example-openapi"]
  })
  const result = sut.includeEvent({
    repositoryOwner: "acme",
    repositoryName: "example-openapi"
  })
  expect(result).toBeFalsy()
})

test("It ensures that the disallowlist takes precedence over the allowlist", async () => {
  const sut = new RepositoryNameEventFilter({
    repositoryNameSuffix: "-openapi",
    allowlist: ["acme/example-openapi"],
    disallowlist: ["acme/example-openapi"]
  })
  const result = sut.includeEvent({
    repositoryOwner: "acme",
    repositoryName: "example-openapi"
  })
  expect(result).toBeFalsy()
})

test("It requires owner to be included when matching against the allowlist", async () => {
  const sut = new RepositoryNameEventFilter({
    repositoryNameSuffix: "-openapi",
    allowlist: ["example-openapi"],
    disallowlist: []
  })
  const result = sut.includeEvent({
    repositoryOwner: "acme",
    repositoryName: "example-openapi"
  })
  // The repository is not allowed because the repository in the allowlist does not include the owner.
  expect(result).toBeFalsy()
})

test("It requires owner to be included when matching against the disallowlist", async () => {
  const sut = new RepositoryNameEventFilter({
    repositoryNameSuffix: "-openapi",
    allowlist: [],
    disallowlist: ["example-openapi"]
  })
  const result = sut.includeEvent({
    repositoryOwner: "acme",
    repositoryName: "example-openapi"
  })
  // The repository is allowed because the repository in the disallowlist does not include the owner.
  expect(result).toBeTruthy()
})