import ProjectMapper, { type URLBuilders, type RepositoryWithRefs, type RepositoryRef } from "@/features/projects/domain/ProjectMapper"
import { noopEncryptionService, base64RemoteConfigEncoder } from "./testUtils"

// Simple URL builders for testing - uses predictable patterns
const testURLBuilders: URLBuilders<RepositoryWithRefs> = {
  getImageRef(repository: RepositoryWithRefs): string {
    return repository.defaultBranchRef.id!
  },
  getBlobRef(ref: RepositoryRef): string {
    return ref.id!
  },
  getOwnerUrl(owner: string): string {
    return `https://example.com/${owner}`
  },
  getProjectUrl(repository: RepositoryWithRefs): string {
    return `https://example.com/${repository.owner}/${repository.name}`
  },
  getVersionUrl(repository: RepositoryWithRefs, ref: RepositoryRef): string {
    return `https://example.com/${repository.owner}/${repository.name}/tree/${ref.name}`
  },
  getSpecEditUrl(repository: RepositoryWithRefs, ref: RepositoryRef, fileName: string): string {
    return `https://example.com/${repository.owner}/${repository.name}/edit/${ref.name}/${fileName}`
  }
}

function createMapper(repositoryNameSuffix = "-openapi") {
  return new ProjectMapper({
    repositoryNameSuffix,
    urlBuilders: testURLBuilders,
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
}

function createRepository(overrides: Partial<RepositoryWithRefs> = {}): RepositoryWithRefs {
  return {
    owner: "acme",
    name: "foo-openapi",
    defaultBranchRef: { id: "12345678", name: "main" },
    branches: [{
      id: "12345678",
      name: "main",
      files: [{ name: "openapi.yml" }]
    }],
    tags: [],
    ...overrides
  }
}

test("It removes suffix from project name", () => {
  const mapper = createMapper("-openapi")
  const project = mapper.mapRepositoryToProject(createRepository())
  expect(project.id).toEqual("acme-foo")
  expect(project.name).toEqual("foo")
  expect(project.displayName).toEqual("foo")
})

test("It maps branches and tags to versions", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [{
      id: "12345678",
      name: "main",
      files: [{ name: "openapi.yml" }]
    }],
    tags: [{
      id: "87654321",
      name: "1.0",
      files: [{ name: "openapi.yml" }]
    }]
  }))
  expect(project.versions.length).toEqual(2)
  expect(project.versions.map(v => v.name)).toContain("main")
  expect(project.versions.map(v => v.name)).toContain("1.0")
})

test("It supports multiple OpenAPI specifications on a branch", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [{
      id: "12345678",
      name: "main",
      files: [
        { name: "foo-service.yml" },
        { name: "bar-service.yml" },
        { name: "baz-service.yml" }
      ]
    }]
  }))
  expect(project.versions[0].specifications.length).toEqual(3)
})

test("It filters away branches with no specifications", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [
      { id: "1", name: "main", files: [{ name: "openapi.yml" }] },
      { id: "2", name: "bugfix", files: [{ name: "README.md" }] }
    ]
  }))
  expect(project.versions.length).toEqual(1)
  expect(project.versions[0].name).toEqual("main")
})

test("It filters away tags with no specifications", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [{ id: "1", name: "main", files: [{ name: "openapi.yml" }] }],
    tags: [
      { id: "2", name: "1.0", files: [{ name: "openapi.yml" }] },
      { id: "3", name: "0.1", files: [{ name: "README.md" }] }
    ]
  }))
  expect(project.versions.length).toEqual(2)
})

test("It reads image from configuration file with .yml extension", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    configYml: { text: "image: icon.png" }
  }))
  expect(project.imageURL).toEqual("/api/blob/acme/foo-openapi/icon.png?ref=12345678")
})

test("It reads display name from configuration file with .yml extension", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    configYml: { text: "name: Hello World" }
  }))
  expect(project.displayName).toEqual("Hello World")
})

test("It reads image from configuration file with .yaml extension", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    configYaml: { text: "image: icon.png" }
  }))
  expect(project.imageURL).toEqual("/api/blob/acme/foo-openapi/icon.png?ref=12345678")
})

test("It reads display name from configuration file with .yaml extension", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    configYaml: { text: "name: Hello World" }
  }))
  expect(project.displayName).toEqual("Hello World")
})

test("It sorts versions alphabetically", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [
      { id: "1", name: "anne", files: [{ name: "openapi.yml" }] },
      { id: "2", name: "bobby", files: [{ name: "openapi.yml" }] }
    ],
    tags: [
      { id: "3", name: "cathrine", files: [{ name: "openapi.yml" }] },
      { id: "4", name: "1.0", files: [{ name: "openapi.yml" }] }
    ]
  }))
  expect(project.versions[0].name).toEqual("1.0")
  expect(project.versions[1].name).toEqual("anne")
  expect(project.versions[2].name).toEqual("bobby")
  expect(project.versions[3].name).toEqual("cathrine")
})

test("It prioritizes main, master, develop, and development branch names when sorting versions", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [
      { id: "1", name: "anne", files: [{ name: "openapi.yml" }] },
      { id: "2", name: "develop", files: [{ name: "openapi.yml" }] },
      { id: "3", name: "main", files: [{ name: "openapi.yml" }] },
      { id: "4", name: "development", files: [{ name: "openapi.yml" }] },
      { id: "5", name: "master", files: [{ name: "openapi.yml" }] }
    ],
    tags: [{ id: "6", name: "1.0", files: [{ name: "openapi.yml" }] }]
  }))
  expect(project.versions[0].name).toEqual("main")
  expect(project.versions[1].name).toEqual("master")
  expect(project.versions[2].name).toEqual("develop")
  expect(project.versions[3].name).toEqual("development")
  expect(project.versions[4].name).toEqual("1.0")
  expect(project.versions[5].name).toEqual("anne")
})

test("It sorts file specifications alphabetically", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [{
      id: "1",
      name: "main",
      files: [
        { name: "z-openapi.yml" },
        { name: "a-openapi.yml" },
        { name: "1-openapi.yml" }
      ]
    }]
  }))
  expect(project.versions[0].specifications[0].name).toEqual("1-openapi.yml")
  expect(project.versions[0].specifications[1].name).toEqual("a-openapi.yml")
  expect(project.versions[0].specifications[2].name).toEqual("z-openapi.yml")
})

test("It maintains remote version specification ordering from config", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [],
    tags: [],
    configYaml: {
      text: `
        name: Hello World
        remoteVersions:
        - name: Bar
          specifications:
          - id: some-spec
            name: Zac
            url: https://example.com/zac.yml
          - id: another-spec
            name: Bob
            url: https://example.com/bob.yml
      `
    }
  }))
  expect(project.versions[0].specifications[0].name).toEqual("Zac")
  expect(project.versions[0].specifications[1].name).toEqual("Bob")
})

test("It identifies the default branch in returned versions", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    defaultBranchRef: { id: "1", name: "development" },
    branches: [
      { id: "1", name: "anne", files: [{ name: "openapi.yml" }] },
      { id: "2", name: "main", files: [{ name: "openapi.yml" }] },
      { id: "3", name: "development", files: [{ name: "openapi.yml" }] }
    ]
  }))
  const defaultVersionNames = project.versions.filter(v => v.isDefault).map(v => v.name)
  expect(defaultVersionNames).toEqual(["development"])
})

test("It adds remote versions from the project configuration", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [],
    tags: [],
    configYaml: {
      text: `
        remoteVersions:
          - name: Anne
            specifications:
            - name: Huey
              url: https://example.com/huey.yml
            - name: Dewey
              url: https://example.com/dewey.yml
          - name: Bobby
            specifications:
            - name: Louie
              url: https://example.com/louie.yml
      `
    }
  }))
  expect(project.versions).toEqual([{
    id: "anne",
    name: "Anne",
    isDefault: false,
    specifications: [{
      id: "huey",
      name: "Huey",
      url: `/api/remotes/${base64RemoteConfigEncoder.encode({ url: "https://example.com/huey.yml" })}`,
      isDefault: false
    }, {
      id: "dewey",
      name: "Dewey",
      url: `/api/remotes/${base64RemoteConfigEncoder.encode({ url: "https://example.com/dewey.yml" })}`,
      isDefault: false
    }]
  }, {
    id: "bobby",
    name: "Bobby",
    isDefault: false,
    specifications: [{
      id: "louie",
      name: "Louie",
      url: `/api/remotes/${base64RemoteConfigEncoder.encode({ url: "https://example.com/louie.yml" })}`,
      isDefault: false
    }]
  }])
})

test("It modifies ID of remote version if the ID already exists", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    defaultBranchRef: { id: "12345678", name: "bar" },
    branches: [{
      id: "12345678",
      name: "bar",
      files: [{ name: "openapi.yml" }]
    }],
    tags: [],
    configYaml: {
      text: `
        remoteVersions:
          - name: Bar
            specifications:
            - name: Baz
              url: https://example.com/baz.yml
          - name: Bar
            specifications:
            - name: Hello
              url: https://example.com/hello.yml
      `
    }
  }))
  expect(project.versions[0].id).toEqual("bar")
  expect(project.versions[1].id).toEqual("bar1")
  expect(project.versions[2].id).toEqual("bar2")
})

test("It lets users specify the ID of a remote version", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [],
    tags: [],
    configYaml: {
      text: `
        remoteVersions:
          - id: some-version
            name: Bar
            specifications:
            - name: Baz
              url: https://example.com/baz.yml
      `
    }
  }))
  expect(project.versions[0].id).toEqual("some-version")
})

test("It lets users specify the ID of a remote specification", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [],
    tags: [],
    configYaml: {
      text: `
        remoteVersions:
          - name: Bar
            specifications:
            - id: some-spec
              name: Baz
              url: https://example.com/baz.yml
      `
    }
  }))
  expect(project.versions[0].specifications[0].id).toEqual("some-spec")
})

test("It sets isDefault on the correct specification based on defaultSpecificationName in config", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    configYml: { text: "defaultSpecificationName: bar-service.yml" },
    branches: [{
      id: "12345678",
      name: "main",
      files: [
        { name: "foo-service.yml" },
        { name: "bar-service.yml" },
        { name: "baz-service.yml" }
      ]
    }]
  }))
  const specs = project.versions[0].specifications
  expect(specs.find(s => s.name === "bar-service.yml")!.isDefault).toBe(true)
  expect(specs.find(s => s.name === "foo-service.yml")!.isDefault).toBe(false)
  expect(specs.find(s => s.name === "baz-service.yml")!.isDefault).toBe(false)
})

test("It sets a remote specification as the default if specified", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [],
    tags: [],
    configYaml: {
      text: `
        defaultSpecificationName: Baz
        remoteVersions:
          - name: Bar
            specifications:
            - id: some-spec
              name: Baz
              url: https://example.com/baz.yml
            - id: another-spec
              name: Qux
              url: https://example.com/qux.yml
      `
    }
  }))
  const remoteSpecs = project.versions[0].specifications
  expect(remoteSpecs.find(s => s.id === "some-spec")!.isDefault).toBe(true)
  expect(remoteSpecs.find(s => s.id === "another-spec")!.isDefault).toBe(false)
})

test("It sets isDefault to false for all specifications if defaultSpecificationName is not set", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [{
      id: "12345678",
      name: "main",
      files: [
        { name: "foo-service.yml" },
        { name: "bar-service.yml" },
        { name: "baz-service.yml" }
      ]
    }]
  }))
  const specs = project.versions[0].specifications
  expect(specs.every(s => s.isDefault === false)).toBe(true)
})

test("It silently ignores defaultSpecificationName if no matching spec is found", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    configYml: { text: "defaultSpecificationName: non-existent.yml" },
    branches: [{
      id: "12345678",
      name: "main",
      files: [
        { name: "foo-service.yml" },
        { name: "bar-service.yml" }
      ]
    }]
  }))
  const specs = project.versions[0].specifications
  expect(specs.every(s => s.isDefault === false)).toBe(true)
})

test("It generates URLs using the provided URL builders", () => {
  const mapper = createMapper()
  const project = mapper.mapRepositoryToProject(createRepository({
    branches: [{
      id: "branch-id-123",
      name: "main",
      files: [{ name: "openapi.yml" }]
    }]
  }))
  expect(project.url).toEqual("https://example.com/acme/foo-openapi")
  expect(project.ownerUrl).toEqual("https://example.com/acme")
  expect(project.versions[0].url).toEqual("https://example.com/acme/foo-openapi/tree/main")
  expect(project.versions[0].specifications[0].editURL).toEqual("https://example.com/acme/foo-openapi/edit/main/openapi.yml")
  expect(project.versions[0].specifications[0].url).toEqual("/api/blob/acme/foo-openapi/openapi.yml?ref=branch-id-123")
})

test("mapRepositories filters out projects with no versions", () => {
  const mapper = createMapper()
  const projects = mapper.mapRepositories([
    createRepository({
      name: "with-specs-openapi",
      branches: [{ id: "1", name: "main", files: [{ name: "openapi.yml" }] }]
    }),
    createRepository({
      name: "without-specs-openapi",
      branches: [{ id: "2", name: "main", files: [{ name: "README.md" }] }]
    })
  ])
  expect(projects.length).toEqual(1)
  expect(projects[0].name).toEqual("with-specs")
})

test("mapRepositories sorts projects alphabetically by name", () => {
  const mapper = createMapper()
  const projects = mapper.mapRepositories([
    createRepository({
      name: "zebra-openapi",
      branches: [{ id: "1", name: "main", files: [{ name: "openapi.yml" }] }]
    }),
    createRepository({
      name: "alpha-openapi",
      branches: [{ id: "2", name: "main", files: [{ name: "openapi.yml" }] }]
    }),
    createRepository({
      name: "middle-openapi",
      branches: [{ id: "3", name: "main", files: [{ name: "openapi.yml" }] }]
    })
  ])
  expect(projects.map(p => p.name)).toEqual(["alpha", "middle", "zebra"])
})
