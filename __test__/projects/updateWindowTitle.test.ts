import { updateWindowTitle } from "../../src/features/projects/domain"

test("It uses default title when there is no selection", async () => {
  const store: { title: string } = { title: "" }
  updateWindowTitle({
    storage: store,
    defaultTitle: "Demo Docs"
  })
  expect(store.title).toEqual("Demo Docs")
})

test("It leaves out specification when the specification has a generic name", async () => {
  const store: { title: string } = { title: "" }
  updateWindowTitle({
    storage: store,
    defaultTitle: "Demo Docs",
    project: {
      id: "foo",
      name: "foo",
      displayName: "foo",
      versions: [],
      owner: "acme",
      ownerUrl: "https://example.com/acme"
    },
    version: {
      id: "bar",
      name: "bar",
      isDefault: false,
      specifications: [{
        id: "hello.yml",
        name: "hello.yml",
        url: "https://example.com/hello.yml"
      }, {
        id: "openapi.yml",
        name: "openapi.yml",
        url: "https://example.com/openapi.yml"
      }]
    },
    specification: {
      id: "openapi.yml",
      name: "openapi.yml",
      url: "https://example.com/openapi.yml"
    }
  })
  expect(store.title).toEqual("foo / bar")
})

test("It leaves out version when it is the defualt version", async () => {
  const store: { title: string } = { title: "" }
  updateWindowTitle({
    storage: store,
    defaultTitle: "Demo Docs",
    project: {
      id: "foo",
      name: "foo",
      displayName: "foo",
      versions: [],
      owner: "acme",
      ownerUrl: "https://example.com/acme"
    },
    version: {
      id: "bar",
      name: "bar",
      isDefault: true,
      specifications: [{
        id: "openapi.yml",
        name: "openapi.yml",
        url: "https://example.com/openapi.yml"
      }]
    },
    specification: {
      id: "openapi.yml",
      name: "openapi.yml",
      url: "https://example.com/openapi.yml"
    }
  })
  expect(store.title).toEqual("foo")
})

test("It adds version when it is not the defualt version", async () => {
  const store: { title: string } = { title: "" }
  updateWindowTitle({
    storage: store,
    defaultTitle: "Demo Docs",
    project: {
      id: "foo",
      name: "foo",
      displayName: "foo",
      versions: [],
      owner: "acme",
      ownerUrl: "https://example.com/acme"
    },
    version: {
      id: "bar",
      name: "bar",
      isDefault: false,
      specifications: [{
        id: "openapi.yml",
        name: "openapi.yml",
        url: "https://example.com/openapi.yml"
      }]
    },
    specification: {
      id: "openapi.yml",
      name: "openapi.yml",
      url: "https://example.com/openapi.yml"
    }
  })
  expect(store.title).toEqual("foo / bar")
})
