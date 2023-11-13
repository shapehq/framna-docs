import { Project, CachingProjectDataSource } from "../../src/features/projects/domain"

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
    dataSource: {
      async getProjects() {
        return projects
      }
    },
    repository: {
      async get() {
        return []
      },
      async set(projects) {
        cachedProjects = projects
      },
      async delete() {}
    }
  })
  await sut.getProjects()
  expect(cachedProjects).toEqual(projects)
})
