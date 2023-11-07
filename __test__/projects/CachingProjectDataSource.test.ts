import Project from "../../src/features/projects/domain/Project"
import CachingProjectDataSource from "../../src/features/projects/domain/CachingProjectDataSource"

test("It caches projects read from the data source", async () => {
  const projects: Project[] = [{
    id: "foo",
    name: "foo",
    displayName: "foo",
    versions: [{
      id: "bar",
      name: "bar",
      isDefault: false,
      specifications: [{
        id: "baz.yml",
        name: "baz.yml",
        url: "https://example.com/baz.yml"
      }]
    }, {
      id: "hello",
      name: "hello",
      isDefault: false,
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
    async get() {
      return []
    },
    async set(projects) {
      cachedProjects = projects
    },
    async delete() {}
  })
  await sut.getProjects()
  expect(cachedProjects).toEqual(projects)
})
