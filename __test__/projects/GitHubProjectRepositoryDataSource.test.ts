import {
  GitHubProjectRepositoryDataSource,
  GitHubGraphQLClientRequest
 } from "../../src/features/projects/data"

test("It requests data for the specified organization", async () => {
  let sentRequest: GitHubGraphQLClientRequest | undefined
  const sut = new GitHubProjectRepositoryDataSource({
    organizationName: "foo",
    graphQlClient: {
      async graphql(request) {
        sentRequest = request
        return { search: { results: [] } }
      }
    }
  })
  await sut.getRepositories()
  expect(sentRequest).not.toBeUndefined()
  expect(sentRequest?.variables.searchQuery).toContain("org:foo")
})
