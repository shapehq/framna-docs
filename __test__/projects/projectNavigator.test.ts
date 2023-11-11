import { ProjectNavigator } from "../../src/features/projects/domain"

test("It navigates to the correct path", async () => {
  let pushedPath: string | undefined
  const sut = new ProjectNavigator({
    pathnameReader: {
      get pathname() {
        return "/"
      }
    },
    router: {
      push: (path: string) => {
        pushedPath = path
      },
      replace: () => {}
    }
  })
  sut.navigate("foo", "bar", "hello.yml")
  expect(pushedPath).toEqual("/foo/bar/hello.yml")
})

test("It navigates to first specification when changing version", async () => {
  const project = {
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
  }
  let pushedPath: string | undefined
  const sut = new ProjectNavigator({
    pathnameReader: {
      get pathname() {
        return "/"
      }
    },
    router: {
      push: (path: string) => {
        pushedPath = path
      },
      replace: () => {}
    }
  })
  sut.navigateToVersion(project, "hello", "baz.yml")
  expect(pushedPath).toEqual("/foo/hello/world.yml")
})

test("It finds a specification with the same name when changing version", async () => {
  const project = {
    id: "foo",
    name: "foo",
    displayName: "foo",
    versions: [{
      id: "bar",
      name: "bar",
      isDefault: false,
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
      isDefault: false,
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
  }
  let pushedPath: string | undefined
  const sut = new ProjectNavigator({
    pathnameReader: {
      get pathname() {
        return "/"
      }
    },
    router: {
      push: (path: string) => {
        pushedPath = path
      },
      replace: () => {}
    }
  })
  sut.navigateToVersion(project, "baz", "earth.yml")
  expect(pushedPath).toEqual("/foo/baz/earth.yml")
})

test("It skips navigating when URL matches selection", async () => {
  let didNavigate = false
  const sut = new ProjectNavigator({
    pathnameReader: {
      get pathname() {
        return "/foo/bar/baz"
      }
    },
    router: {
      push: () => {},
      replace: () => {
        didNavigate = true
      }
    }
  })
  sut.navigateIfNeeded({
    projectId: "foo",
    versionId: "bar",
    specificationId: "baz"
  }, {
    projectId: "foo",
    versionId: "bar",
    specificationId: "baz"
  })
  expect(didNavigate).toBeFalsy()
})

test("It navigates when project ID in URL does not match ID of selected project", async () => {
  let didNavigate = false
  const sut = new ProjectNavigator({
    pathnameReader: {
      get pathname() {
        return "/hello/bar/baz"
      }
    },
    router: {
      push: () => {},
      replace: () => {
        didNavigate = true
      }
    }
  })
  sut.navigateIfNeeded({
    projectId: "foo",
    versionId: "bar",
    specificationId: "baz"
  }, {
    projectId: "hello",
    versionId: "bar",
    specificationId: "baz"
  })
  expect(didNavigate).toBeTruthy()
})

test("It navigates when version ID in URL does not match ID of selected version", async () => {
  let didNavigate = false
  const sut = new ProjectNavigator({
    pathnameReader: {
      get pathname() {
        return "/foo/hello/baz"
      }
    },
    router: {
      push: () => {},
      replace: () => {
        didNavigate = true
      }
    }
  })
  sut.navigateIfNeeded({
    projectId: "foo",
    versionId: "bar",
    specificationId: "baz"
  }, {
    projectId: "foo",
    versionId: "hello",
    specificationId: "baz"
  })
  expect(didNavigate).toBeTruthy()
})

test("It navigates when specification ID in URL does not match ID of selected specification", async () => {
  let didNavigate = false
  const sut = new ProjectNavigator({
    pathnameReader: {
      get pathname() {
        return "/foo/bar/hello"
      }
    },
    router: {
      push: () => {},
      replace: () => {
        didNavigate = true
      }
    }
  })
  sut.navigateIfNeeded({
    projectId: "foo",
    versionId: "bar",
    specificationId: "baz"
  }, {
    projectId: "foo",
    versionId: "bar",
    specificationId: "hello"
  })
  expect(didNavigate).toBeTruthy()
})
