import { AzureDevOpsProjectDataSource } from "@/features/projects/data"
import { noopEncryptionService, base64RemoteConfigEncoder } from "./testUtils"

test("It loads repositories from data source", async () => {
  let didLoadRepositories = false
  const sut = new AzureDevOpsProjectDataSource({
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

test("It generates correct Azure DevOps URLs", async () => {
  const sut = new AzureDevOpsProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "myorg",
          name: "foo-openapi",
          webUrl: "https://dev.azure.com/myorg/myproject/_git/foo-openapi",
          defaultBranchRef: { name: "main" },
          branches: [{
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
  expect(projects[0].url).toEqual("https://dev.azure.com/myorg/myproject/_git/foo-openapi")
  expect(projects[0].ownerUrl).toEqual("https://dev.azure.com/myorg")
  expect(projects[0].versions[0].url).toEqual("https://dev.azure.com/myorg/myproject/_git/foo-openapi?version=GBmain")
  expect(projects[0].versions[0].specifications[0].url).toEqual("/api/blob/myorg/foo-openapi/openapi.yml?ref=main")
  expect(projects[0].versions[0].specifications[0].editURL).toEqual("https://dev.azure.com/myorg/myproject/_git/foo-openapi?path=/openapi.yml&version=GBmain&_a=contents")
})

test("It uses branch name as ref for Azure DevOps blob URLs", async () => {
  const sut = new AzureDevOpsProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "myorg",
          name: "foo-openapi",
          webUrl: "https://dev.azure.com/myorg/myproject/_git/foo-openapi",
          defaultBranchRef: { name: "main" },
          branches: [{
            name: "feature/test",
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
  // Azure DevOps uses branch name as ref, not commit SHA like GitHub
  expect(projects[0].versions[0].specifications[0].url).toEqual("/api/blob/myorg/foo-openapi/openapi.yml?ref=feature/test")
})
