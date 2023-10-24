import Project from "../../src/features/projects/domain/Project"
import CachingProjectDataSource from "../../src/features/projects/domain/CachingProjectDataSource"

test("It caches projects read from the data source", async () => {
  const projects = [{
    id: "foo",
    name: "foo",
    versions: [{
      id: "bar",
      name: "bar",
      specifications: [{
        id: "baz.yml",
        name: "baz.yml",
        url: "https://example.com/baz.yml"
      }]
    }, {
      id: "hello",
      name: "hello",
      specifications: [{
        id: "world.yml",
        name: "world.yml",
        url: "https://example.com/world.yml"
      }]
    }]
  }]
  let cachedProjects: Project[] | undefined
  const sut = new CachingProjectDataSource({
    async getProjects() {
      return projects
    }
  }, {
    async getProjects() {
      return []
    },
    async storeProjects(projects) {
      cachedProjects = projects
    },
    async deleteProjects() {}
  })
  await sut.getProjects()
  expect(cachedProjects).toEqual(projects)
})
