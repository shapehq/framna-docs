import ProjectPageSelection from "../../src/features/projects/domain/ProjectPageSelection"
import projectNavigator from "../../src/features/projects/domain/projectNavigator"

test("It navigates to the correct path", async () => {
  let pushedPath: string | undefined
  const router = {
    push: (path: string) => {
      pushedPath = path
    },
    replace: (_path: string) => {}
  }
  projectNavigator.navigate(router, "foo", "bar", "hello.yml")
  expect(pushedPath).toEqual("/foo/bar/hello.yml")
})

test("It navigates to first specification when changing version", async () => {
  const selection: ProjectPageSelection = {
    project: {
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
    },
    version: {
      id: "bar",
      name: "bar",
      specifications: []
    },
    specification: {
      id: "baz.yml",
      name: "baz.yml",
      url: "https://example.com/baz.yml"
    }
  }
  let pushedPath: string | undefined
  const router = {
    push: (path: string) => {
      pushedPath = path
    },
    replace: (_path: string) => {}
  }
  projectNavigator.navigateToVersion(router, selection, "hello")
  expect(pushedPath).toEqual("/foo/hello/world.yml")
})

test("It finds a specification with the same name when changing version", async () => {
  const selection: ProjectPageSelection = {
    project: {
      id: "foo",
      name: "foo",
      versions: [{
        id: "bar",
        name: "bar",
        specifications: [{
          id: "hello.yml",
          name: "hello.yml",
          url: "https://example.com/hello.yml"
        }, {
          id: "earth.yml",
          name: "earth.yml",
          url: "https://example.com/earth.yml"
        }]
      }, {
        id: "baz",
        name: "baz",
        specifications: [{
          id: "moon.yml",
          name: "moon.yml",
          url: "https://example.com/moon.yml"
        }, {
          id: "saturn.yml",
          name: "saturn.yml",
          url: "https://example.com/saturn.yml"
        }, {
          id: "earth.yml",
          name: "earth.yml",
          url: "https://example.com/earth.yml"
        }, {
          id: "jupiter.yml",
          name: "jupiter.yml",
          url: "https://example.com/jupiter.yml"
        }]
      }]
    },
    version: {
      id: "bar",
      name: "bar",
      specifications: []
    },
    specification: {
      id: "earth.yml",
      name: "earth.yml",
      url: "https://example.com/earth.yml"
    }
  }
  let pushedPath: string | undefined
  const router = {
    push: (path: string) => {
      pushedPath = path
    },
    replace: (_path: string) => {}
  }
  projectNavigator.navigateToVersion(router, selection, "baz")
  expect(pushedPath).toEqual("/foo/baz/earth.yml")
})
