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

test("It generates correct GitHub URLs", async () => {
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
  expect(projects[0].url).toEqual("https://github.com/acme/foo-openapi")
  expect(projects[0].ownerUrl).toEqual("https://github.com/acme")
  expect(projects[0].versions[0].url).toEqual("https://github.com/acme/foo-openapi/tree/main")
  expect(projects[0].versions[0].specifications[0].url).toEqual("/api/blob/acme/foo-openapi/openapi.yml?ref=abc123")
  expect(projects[0].versions[0].specifications[0].editURL).toEqual("https://github.com/acme/foo-openapi/edit/main/openapi.yml")
})
