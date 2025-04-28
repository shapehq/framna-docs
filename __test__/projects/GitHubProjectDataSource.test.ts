import { GitHubProjectDataSource } from "@/features/projects/data"
import RemoteConfig from "@/features/projects/domain/RemoteConfig"

/**
 * Simple encryption service for testing. Does nothing.
 */
const noopEncryptionService = {
  encrypt: function (data: string): string {
    return data
  },
  decrypt: function (encryptedDataBase64: string): string {
    return encryptedDataBase64
  }
}

/**
 * Simple encoder for testing
 */
const base64RemoteConfigEncoder = {
  encode: function (remoteConfig: RemoteConfig): string {
    return Buffer.from(JSON.stringify(remoteConfig)).toString("base64")
  },
  decode: function (encodedString: string): RemoteConfig {
    return JSON.parse(Buffer.from(encodedString, "base64").toString())
  }
}

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

test("It maps projects including branches and tags", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [{
              name: "openapi.yml"
            }]
          }],
          tags: [{
            id: "12345678",
            name: "1.0",
            files: [{
              name: "openapi.yml"
            }]
          }]
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects).toEqual([{
    id: "acme-foo",
    name: "foo",
    displayName: "foo",
    url: "https://github.com/acme/foo-openapi",
    versions: [{
      id: "main",
      name: "main",
      specifications: [{
        id: "openapi.yml",
        name: "openapi.yml",
        url: "/api/blob/acme/foo-openapi/openapi.yml?ref=12345678",
        editURL: "https://github.com/acme/foo-openapi/edit/main/openapi.yml",
        isDefault: false
      }],
      url: "https://github.com/acme/foo-openapi/tree/main",
      isDefault: true
    }, {
      id: "1.0",
      name: "1.0",
      specifications: [{
        id: "openapi.yml",
        name: "openapi.yml",
        url: "/api/blob/acme/foo-openapi/openapi.yml?ref=12345678",
        editURL: "https://github.com/acme/foo-openapi/edit/1.0/openapi.yml",
        isDefault: false
      }],
      url: "https://github.com/acme/foo-openapi/tree/1.0",
      isDefault: false
    }],
    owner: "acme",
    ownerUrl: "https://github.com/acme"
  }])
})

test("It removes suffix from project name", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [{
              name: "openapi.yml"
            }]
          }],
          tags: [{
            id: "12345678",
            name: "1.0",
            files: [{
              name: "openapi.yml"
            }]
          }]
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].id).toEqual("acme-foo")
  expect(projects[0].name).toEqual("foo")
  expect(projects[0].displayName).toEqual("foo")
})

test("It supports multiple OpenAPI specifications on a branch", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [{
              name: "foo-service.yml",
            }, {
              name: "bar-service.yml",
            }, {
              name: "baz-service.yml",
            }]
          }],
          tags: [{
            id: "12345678",
            name: "1.0",
            files: [{
              name: "openapi.yml"
            }]
          }]
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects).toEqual([{
    id: "acme-foo",
    name: "foo",
    displayName: "foo",
    url: "https://github.com/acme/foo-openapi",
    versions: [{
      id: "main",
      name: "main",
      specifications: [{
        id: "foo-service.yml",
        name: "foo-service.yml",
        url: "/api/blob/acme/foo-openapi/foo-service.yml?ref=12345678",
        editURL: "https://github.com/acme/foo-openapi/edit/main/foo-service.yml",
        isDefault: false
      }, {
        id: "bar-service.yml",
        name: "bar-service.yml",
        url: "/api/blob/acme/foo-openapi/bar-service.yml?ref=12345678",
        editURL: "https://github.com/acme/foo-openapi/edit/main/bar-service.yml",
        isDefault: false
      }, {
        id: "baz-service.yml",
        name: "baz-service.yml",
        url: "/api/blob/acme/foo-openapi/baz-service.yml?ref=12345678",
        editURL: "https://github.com/acme/foo-openapi/edit/main/baz-service.yml",
        isDefault: false
      }],
      url: "https://github.com/acme/foo-openapi/tree/main",
      isDefault: true
    }, {
      id: "1.0",
      name: "1.0",
      specifications: [{
        id: "openapi.yml",
        name: "openapi.yml",
        url: "/api/blob/acme/foo-openapi/openapi.yml?ref=12345678",
        editURL: "https://github.com/acme/foo-openapi/edit/1.0/openapi.yml",
        isDefault: false
      }],
      url: "https://github.com/acme/foo-openapi/tree/1.0",
      isDefault: false
    }],
    owner: "acme",
    ownerUrl: "https://github.com/acme"
  }])
})

test("It filters away projects with no versions", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          branches: [],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects.length).toEqual(0)
})

test("It filters away branches with no specifications", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [{
              name: "openapi.yml",
            }]
          }, {
            id: "12345678",
            name: "bugfix",
            files: [{
              name: "README.md",
            }]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].versions.length).toEqual(1)
})

test("It filters away tags with no specifications", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [{
              name: "foo-service.yml",
            }]
          }],
          tags: [{
            id: "12345678",
            name: "1.0",
            files: [{
              name: "openapi.yml"
            }]
          }, {
            id: "12345678",
            name: "0.1",
            files: [{
              name: "README.md"
            }]
          }]
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].versions.length).toEqual(2)
})

test("It reads image from configuration file with .yml extension", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          configYml: {
            text: "image: icon.png"
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [{
              name: "openapi.yml",
            }]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].imageURL).toEqual("/api/blob/acme/foo-openapi/icon.png?ref=12345678")
})

test("It reads display name from configuration file with .yml extension", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          configYml: {
            text: "name: Hello World"
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [{
              name: "openapi.yml",
            }]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].id).toEqual("acme-foo")
  expect(projects[0].name).toEqual("foo")
  expect(projects[0].displayName).toEqual("Hello World")
})

test("It reads image from configuration file with .yaml extension", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          configYaml: {
            text: "image: icon.png"
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [{
              name: "openapi.yml",
            }]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].imageURL).toEqual("/api/blob/acme/foo-openapi/icon.png?ref=12345678")
})

test("It reads display name from configuration file with .yaml extension", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          configYaml: {
            text: "name: Hello World"
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [{
              name: "openapi.yml",
            }]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].id).toEqual("acme-foo")
  expect(projects[0].name).toEqual("foo")
  expect(projects[0].displayName).toEqual("Hello World")
})

test("It sorts projects alphabetically", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "cathrine-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          configYaml: {
            text: "name: Hello World"
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [{
              name: "openapi.yml",
            }]
          }],
          tags: []
        }, {
          owner: "acme",
          name: "bobby-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          configYaml: {
            text: "name: Hello World"
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [{
              name: "openapi.yml",
            }]
          }],
          tags: []
        }, {
          owner: "acme",
          name: "anne-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          configYaml: {
            text: "name: Hello World"
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [{
              name: "openapi.yml",
            }]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].name).toEqual("anne")
  expect(projects[1].name).toEqual("bobby")
  expect(projects[2].name).toEqual("cathrine")
})

test("It sorts versions alphabetically", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          configYaml: {
            text: "name: Hello World"
          },
          branches: [{
            id: "12345678",
            name: "anne",
            files: [{
              name: "openapi.yml",
            }]
          }, {
            id: "12345678",
            name: "bobby",
            files: [{
              name: "openapi.yml",
            }]
          }],
          tags: [{
            id: "12345678",
            name: "cathrine",
            files: [{
              name: "openapi.yml",
            }]
          }, {
            id: "12345678",
            name: "1.0",
            files: [{
              name: "openapi.yml",
            }]
          }]
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].versions[0].name).toEqual("1.0")
  expect(projects[0].versions[1].name).toEqual("anne")
  expect(projects[0].versions[2].name).toEqual("bobby")
  expect(projects[0].versions[3].name).toEqual("cathrine")
})

test("It prioritizes main, master, develop, and development branch names when sorting verisons", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          configYaml: {
            text: "name: Hello World"
          },
          branches: [{
            id: "12345678",
            name: "anne",
            files: [{
              name: "openapi.yml",
            }]
          }, {
            id: "12345678",
            name: "develop",
            files: [{
              name: "openapi.yml",
            }]
          }, {
            id: "12345678",
            name: "main",
            files: [{
              name: "openapi.yml",
            }]
          }, {
            id: "12345678",
            name: "development",
            files: [{
              name: "openapi.yml",
            }]
          }, {
            id: "12345678",
            name: "master",
            files: [{
              name: "openapi.yml",
            }]
          }],
          tags: [{
            id: "12345678",
            name: "1.0",
            files: [{
              name: "openapi.yml",
            }]
          }]
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].versions[0].name).toEqual("main")
  expect(projects[0].versions[1].name).toEqual("master")
  expect(projects[0].versions[2].name).toEqual("develop")
  expect(projects[0].versions[3].name).toEqual("development")
  expect(projects[0].versions[4].name).toEqual("1.0")
  expect(projects[0].versions[5].name).toEqual("anne")
})

test("It identifies the default branch in returned versions", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "development"
          },
          configYaml: {
            text: "name: Hello World"
          },
          branches: [{
            id: "12345678",
            name: "anne",
            files: [{
              name: "openapi.yml",
            }]
          }, {
            id: "12345678",
            name: "main",
            files: [{
              name: "openapi.yml",
            }]
          }, {
            id: "12345678",
            name: "development",
            files: [{
              name: "openapi.yml",
            }]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  const defaultVersionNames = projects[0]
    .versions
    .filter(e => e.isDefault)
    .map(e => e.name)
  expect(defaultVersionNames).toEqual(["development"])
})

test("It adds remote versions from the project configuration", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
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
          },
          branches: [],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].versions).toEqual([{
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

test("It modifies ID of remote version if the ID already exists", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "bar"
          },
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
          },
          branches: [{
            id: "12345678",
            name: "bar",
            files: [{
              name: "openapi.yml"
            }]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].versions).toEqual([{
    id: "bar",
    name: "bar",
    url: "https://github.com/acme/foo-openapi/tree/bar",
    isDefault: true,
    specifications: [{
      id: "openapi.yml",
      name: "openapi.yml",
      url: "/api/blob/acme/foo-openapi/openapi.yml?ref=12345678",
      editURL: "https://github.com/acme/foo-openapi/edit/bar/openapi.yml",
      isDefault: false
    }]
  }, {
    id: "bar1",
    name: "Bar",
    isDefault: false,
    specifications: [{
      id: "baz",
      name: "Baz",
      url: `/api/remotes/${base64RemoteConfigEncoder.encode({ url: "https://example.com/baz.yml" })}`,
      isDefault: false
    }]
  }, {
    id: "bar2",
    name: "Bar",
    isDefault: false,
    specifications: [{
      id: "hello",
      name: "Hello",
      url: `/api/remotes/${base64RemoteConfigEncoder.encode({ url: "https://example.com/hello.yml" })}`,
      isDefault: false
    }]
  }])
})

test("It lets users specify the ID of a remote version", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "bar"
          },
          configYaml: {
            text: `
            remoteVersions:
              - id: some-version
                name: Bar
                specifications:
                - name: Baz
                  url: https://example.com/baz.yml
            `
          },
          branches: [],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].versions).toEqual([{
    id: "some-version",
    name: "Bar",
    isDefault: false,
    specifications: [{
      id: "baz",
      name: "Baz",
      url: `/api/remotes/${base64RemoteConfigEncoder.encode({ url: "https://example.com/baz.yml" })}`,
      isDefault: false
    }]
  }])
})

test("It lets users specify the ID of a remote specification", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "bar"
          },
          configYaml: {
            text: `
            remoteVersions:
              - name: Bar
                specifications:
                - id: some-spec
                  name: Baz
                  url: https://example.com/baz.yml
            `
          },
          branches: [],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  expect(projects[0].versions).toEqual([{
    id: "bar",
    name: "Bar",
    isDefault: false,
    specifications: [{
      id: "some-spec",
      name: "Baz",
      url: `/api/remotes/${base64RemoteConfigEncoder.encode({ url: "https://example.com/baz.yml" })}`,
      isDefault: false
    }]
  }])
})

test("It sets isDefault on the correct specification based on defaultSpecificationName in config", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          configYml: {
            text: `
            defaultSpecificationName: bar-service.yml
            remoteVersions:
              - name: Bar
                specifications:
                - id: some-spec
                  name: Baz
                  url: https://example.com/baz.yml
            `
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [
              { name: "foo-service.yml" },
              { name: "bar-service.yml" },
              { name: "baz-service.yml" }
            ]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  const specs = projects[0].versions[0].specifications
  expect(specs.find(s => s.name === "bar-service.yml")!.isDefault).toBe(true)
  expect(specs.find(s => s.name === "foo-service.yml")!.isDefault).toBe(false)
  expect(specs.find(s => s.name === "baz-service.yml")!.isDefault).toBe(false)
  expect(projects[0].versions[1].specifications.find(s => s.name === "Baz")!.isDefault).toBe(false)
})

test("It sets a remote specification as the default if specified", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
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
          },
          branches: [],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  const remoteSpecs = projects[0].versions[0].specifications
  expect(remoteSpecs.find(s => s.id === "some-spec")!.isDefault).toBe(true)
  expect(remoteSpecs.find(s => s.id === "another-spec")!.isDefault).toBe(false)
})


test("It sets isDefault to false for all specifications if defaultSpecificationName is not set", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          configYml: {
            text: ``
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [
              { name: "foo-service.yml" },
              { name: "bar-service.yml" },
              { name: "baz-service.yml" }
            ]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  const specs = projects[0].versions[0].specifications
  expect(specs.every(s => s.isDefault === false)).toBe(true)
})

test("It silently ignores defaultSpecificationName if no matching spec is found", async () => {
  const sut = new GitHubProjectDataSource({
    repositoryNameSuffix: "-openapi",
    repositoryDataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          configYml: {
            text: `defaultSpecificationName: non-existent.yml`
          },
          branches: [{
            id: "12345678",
            name: "main",
            files: [
              { name: "foo-service.yml" },
              { name: "bar-service.yml" },
              { name: "baz-service.yml" }
            ]
          }],
          tags: []
        }]
      }
    },
    encryptionService: noopEncryptionService,
    remoteConfigEncoder: base64RemoteConfigEncoder
  })
  const projects = await sut.getProjects()
  const specs = projects[0].versions[0].specifications
  expect(specs.every(s => s.isDefault === false)).toBe(true)
})
