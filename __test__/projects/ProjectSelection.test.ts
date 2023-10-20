import {
  getProjectSelection, ProjectSelectionState
} from "../../src/features/projects/domain/ProjectSelection"

test("It enters the loading state", async () => {
  const sut = getProjectSelection({ isLoading: true })
  expect(sut.state).toEqual(ProjectSelectionState.LOADING)
})

test("It enters the error state", async () => {
  const sut = getProjectSelection({
    isLoading: false,
    error: new Error("foo")
  })
  expect(sut.state).toEqual(ProjectSelectionState.ERROR)
  expect(sut.error).toEqual(new Error("foo"))
})

test("It gracefully errors when no project has been selected", async () => {
  const sut = getProjectSelection({
    projects: [{
      id: "foo",
      name: "foo",
      versions: []
    }, {
      id: "bar",
      name: "bar",
      versions: []
    }]
  })
  expect(sut.state).toEqual(ProjectSelectionState.NO_PROJECT_SELECTED)
})

test("It selects the first project when there is only one project", async () => {
  const sut = getProjectSelection({
    projects: [{
      id: "foo",
      name: "foo",
      versions: [{
        id: "bar",
        name: "bar",
        specifications: [{
          id: "hello",
          name: "hello.yml",
          url: "https://example.com/hello.yml",
          editURL: "https://example.com/edit/hello.yml"
        }]
      }]
    }]
  })
  expect(sut.state).toEqual(ProjectSelectionState.HAS_SELECTION)
  expect(sut.selection!.project.id).toEqual("foo")
  expect(sut.selection!.version.id).toEqual("bar")
  expect(sut.selection!.specification.id).toEqual("hello")
})

test("It selects the first version and specification of the specified project", async () => {
  const sut = getProjectSelection({
    selectedProjectId: "bar",
    projects: [{
      id: "foo",
      name: "foo",
      versions: []
    }, {
      id: "bar",
      name: "bar",
      versions: [{
        id: "baz1",
        name: "baz1",
        specifications: [{
          id: "hello1",
          name: "hello1.yml",
          url: "https://example.com/hello.yml",
          editURL: "https://example.com/edit/hello.yml"
        }, {
          id: "hello2",
          name: "hello2.yml",
          url: "https://example.com/hello.yml",
          editURL: "https://example.com/edit/hello.yml"
        }]
      }, {
        id: "baz2",
        name: "baz2",
        specifications: []
      }]
    }]
  })
  expect(sut.state).toEqual(ProjectSelectionState.HAS_SELECTION)
  expect(sut.selection!.project.id).toEqual("bar")
  expect(sut.selection!.version.id).toEqual("baz1")
  expect(sut.selection!.specification.id).toEqual("hello1")
})

test("It selects the first specification of the specified project and version", async () => {
  const sut = getProjectSelection({
    selectedProjectId: "bar",
    selectedVersionId: "baz2",
    projects: [{
      id: "foo",
      name: "foo",
      versions: []
    }, {
      id: "bar",
      name: "bar",
      versions: [{
        id: "baz1",
        name: "baz1",
        specifications: []
      }, {
        id: "baz2",
        name: "baz2",
        specifications: [{
          id: "hello1",
          name: "hello1.yml",
          url: "https://example.com/hello.yml",
          editURL: "https://example.com/edit/hello.yml"
        }]
      }]
    }]
  })
  expect(sut.state).toEqual(ProjectSelectionState.HAS_SELECTION)
  expect(sut.selection!.project.id).toEqual("bar")
  expect(sut.selection!.version.id).toEqual("baz2")
  expect(sut.selection!.specification.id).toEqual("hello1")
})

test("It selects the specification of the specified version", async () => {
  const sut = getProjectSelection({
    selectedProjectId: "bar",
    selectedVersionId: "baz2",
    projects: [{
      id: "foo",
      name: "foo",
      versions: []
    }, {
      id: "bar",
      name: "bar",
      versions: [{
        id: "baz1",
        name: "baz1",
        specifications: []
      }, {
        id: "baz2",
        name: "baz2",
        specifications: [{
          id: "hello1",
          name: "hello1.yml",
          url: "https://example.com/hello.yml",
          editURL: "https://example.com/edit/hello.yml"
        }, {
          id: "hello2",
          name: "hello2.yml",
          url: "https://example.com/hello.yml",
          editURL: "https://example.com/edit/hello.yml"
        }]
      }]
    }]
  })
  expect(sut.state).toEqual(ProjectSelectionState.HAS_SELECTION)
  expect(sut.selection!.project.id).toEqual("bar")
  expect(sut.selection!.version.id).toEqual("baz2")
  expect(sut.selection!.specification.id).toEqual("hello1")
})

test("It selects the specified project, version, and specification", async () => {
  const sut = getProjectSelection({
    selectedProjectId: "bar",
    selectedVersionId: "baz2",
    selectedSpecificationId: "hello2",
    projects: [{
      id: "foo",
      name: "foo",
      versions: []
    }, {
      id: "bar",
      name: "bar",
      versions: [{
        id: "baz1",
        name: "baz1",
        specifications: []
      }, {
        id: "baz2",
        name: "baz2",
        specifications: [{
          id: "hello1",
          name: "hello1.yml",
          url: "https://example.com/hello.yml",
          editURL: "https://example.com/edit/hello.yml"
        }, {
          id: "hello2",
          name: "hello2.yml",
          url: "https://example.com/hello.yml",
          editURL: "https://example.com/edit/hello.yml"
        }]
      }]
    }]
  })
  expect(sut.state).toEqual(ProjectSelectionState.HAS_SELECTION)
  expect(sut.selection!.project.id).toEqual("bar")
  expect(sut.selection!.version.id).toEqual("baz2")
  expect(sut.selection!.specification.id).toEqual("hello2")
})

test("It errors when the selected project cannot be found", async () => {
  const sut = getProjectSelection({
    selectedProjectId: "foo",
    projects: [{
      id: "bar",
      name: "bar",
      versions: []
    }]
  })
  expect(sut.state).toEqual(ProjectSelectionState.PROJECT_NOT_FOUND)
})

test("It errors when the selected version cannot be found", async () => {
  const sut = getProjectSelection({
    selectedProjectId: "foo",
    selectedVersionId: "bar",
    projects: [{
      id: "foo",
      name: "foo",
      versions: [{
        id: "baz",
        name: "baz",
        specifications: []
      }]
    }]
  })
  expect(sut.state).toEqual(ProjectSelectionState.VERSION_NOT_FOUND)
})

test("It errors when the selected specification cannot be found", async () => {
  const sut = getProjectSelection({
    selectedProjectId: "foo",
    selectedVersionId: "bar",
    selectedSpecificationId: "baz",
    projects: [{
      id: "foo",
      name: "foo",
      versions: [{
        id: "bar",
        name: "bar",
        specifications: [{
          id: "hello",
          name: "hello.yml",
          url: "https://example.com/hello.yml",
          editURL: "https://example.com/edit/hello.yml"
        }]
      }]
    }]
  })
  expect(sut.state).toEqual(ProjectSelectionState.SPECIFICATION_NOT_FOUND)
})

test("It errors when the selected project has no versions", async () => {
  const sut = getProjectSelection({
    selectedProjectId: "foo",
    projects: [{
      id: "foo",
      name: "foo",
      versions: []
    }]
  })
  expect(sut.state).toEqual(ProjectSelectionState.VERSION_NOT_FOUND)
})

test("It errors when the selected version has no specifications", async () => {
  const sut = getProjectSelection({
    selectedProjectId: "foo",
    selectedVersionId: "bar",
    projects: [{
      id: "foo",
      name: "foo",
      versions: [{
        id: "bar",
        name: "bar",
        specifications: []
      }]
    }]
  })
  expect(sut.state).toEqual(ProjectSelectionState.SPECIFICATION_NOT_FOUND)
})

