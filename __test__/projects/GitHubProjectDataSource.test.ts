import { GitHubProjectDataSource } from "@/features/projects/data"
import { noopEncryptionService, base64RemoteConfigEncoder } from "./testUtils"

test("It loads repositories from data source", async () => {
  let didLoadRepositories = false
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        didLoadRepositories = true
        return []
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  await sut.getProjects()
  expect(didLoadRepositories).toBeTruthy()
})

test("It generates GitHub-specific URLs", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "abc123",
            name: "main"
          },
          configYml: {
            text: "image: icon.png"
          },
          branches: [{
            id: "abc123",
            name: "main",
            files: [{ name: "openapi.yml" }]
          }],
          tags: [{
            id: "def456",
            name: "1.0",
            files: [{ name: "openapi.yml" }]
          }]
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  const project = projects[0]

  // GitHub-specific project URLs
  expect(project.url).toEqual("https://github.com/acme/foo-openapi")
  expect(project.ownerUrl).toEqual("https://github.com/acme")

  // GitHub-specific image URL using ref id
  expect(project.imageURL).toEqual("/api/blob/acme/foo-openapi/icon.png?ref=abc123")

  // GitHub-specific version URLs
  expect(project.versions[0].url).toEqual("https://github.com/acme/foo-openapi/tree/main")
  expect(project.versions[1].url).toEqual("https://github.com/acme/foo-openapi/tree/1.0")

  // GitHub-specific specification URLs using ref id
  expect(project.versions[0].specifications[0].url).toEqual("/api/blob/acme/foo-openapi/openapi.yml?ref=abc123")
  expect(project.versions[0].specifications[0].editURL).toEqual("https://github.com/acme/foo-openapi/edit/main/openapi.yml")
})

test("It generates diff URLs for changed files", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "abc123",
            name: "main"
          },
          branches: [{
            id: "head-sha",
            name: "feature-branch",
            baseRefOid: "base-sha",
            baseRef: "main",
            prNumber: 42,
            files: [{ name: "openapi.yml" }],
            changedFiles: ["openapi.yml"]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  const spec = projects[0].versions[0].specifications[0]

  expect(spec.diffURL).toEqual("/api/diff/acme/foo-openapi/openapi.yml?baseRefOid=base-sha&to=head-sha")
  expect(spec.diffBaseBranch).toEqual("main")
  expect(spec.diffBaseOid).toEqual("base-sha")
  expect(spec.diffPrUrl).toEqual("https://github.com/acme/foo-openapi/pull/42")
})

test("It does not generate diff URL when baseRefOid is missing", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "abc123",
            name: "main"
          },
          branches: [{
            id: "head-sha",
            name: "main",
            files: [{ name: "openapi.yml" }]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  const spec = projects[0].versions[0].specifications[0]

  expect(spec.diffURL).toBeUndefined()
})

test("It encodes special characters in file paths", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "abc123",
            name: "main"
          },
          branches: [{
            id: "abc123",
            name: "main",
            files: [{ name: "path/to/my spec.yml" }]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  const spec = projects[0].versions[0].specifications[0]

  expect(spec.editURL).toEqual("https://github.com/acme/foo-openapi/edit/main/path%2Fto%2Fmy%20spec.yml")
})
