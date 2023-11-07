import RepositoryRestrictingAccessTokenDataSource from "../../src/features/auth/domain/repositoryAccess/RepositoryRestrictingAccessTokenDataSource"

test("It limits access to the fetched repositories", async () => {
  let restrictingRepositoryNames: string[] | undefined
  const sut = new RepositoryRestrictingAccessTokenDataSource({
    repositoryAccessReader: {
      async getRepositoryNames() {
        return ["foo", "bar"]
      }
    },
    dataSource: {
      async getAccessToken(repositoryNames) {
        restrictingRepositoryNames = repositoryNames
        return "secret"
      },
    }
  })
  await sut.getAccessToken("1234")
  expect(restrictingRepositoryNames).toEqual(["foo", "bar"])
})
