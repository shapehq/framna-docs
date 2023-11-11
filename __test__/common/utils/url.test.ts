import {
  getProjectId,
  getVersionId,
  getSpecificationId
} from "../../../src/common"

test("It reads path containing project only", async () => {
  const url = "/foo"
  const projectId = getProjectId(url)
  const versionId = getVersionId(url)
  const specificationId = getSpecificationId(url)
  expect(projectId).toEqual("foo")
  expect(versionId).toBeUndefined()
  expect(specificationId).toBeUndefined()
})

test("It reads path containing project and version", async () => {
  const url = "/foo/bar"
  const projectId = getProjectId(url)
  const versionId = getVersionId(url)
  const specificationId = getSpecificationId(url)
  expect(projectId).toEqual("foo")
  expect(versionId).toEqual("bar")
  expect(specificationId).toBeUndefined()
})

test("It reads path containing project, version, and specification with .yml extension", async () => {
  const url = "/foo/bar/openapi.yml"
  const projectId = getProjectId(url)
  const versionId = getVersionId(url)
  const specificationId = getSpecificationId(url)
  expect(projectId).toEqual("foo")
  expect(versionId).toEqual("bar")
  expect(specificationId).toBe("openapi.yml")
})

test("It reads path containing project, version, and specification with .yaml extension", async () => {
  const url = "/foo/bar/openapi.yaml"
  const projectId = getProjectId(url)
  const versionId = getVersionId(url)
  const specificationId = getSpecificationId(url)
  expect(projectId).toEqual("foo")
  expect(versionId).toEqual("bar")
  expect(specificationId).toBe("openapi.yaml")
})

test("It parses specification without trailing file extension", async () => {
  const url = "/foo/bar/baz"
  const projectId = getProjectId(url)
  const versionId = getVersionId(url)
  const specificationId = getSpecificationId(url)
  expect(projectId).toEqual("foo")
  expect(versionId).toEqual("bar")
  expect(specificationId).toBe("baz")
})

test("It read specification when version contains a slash", async () => {
  const url = "/foo/bar/baz/openapi.yml"
  const projectId = getProjectId(url)
  const versionId = getVersionId(url)
  const specificationId = getSpecificationId(url)
  expect(projectId).toEqual("foo")
  expect(versionId).toEqual("bar/baz")
  expect(specificationId).toBe("openapi.yml")
})

test("It read specification when version contains three slashes", async () => {
  const url = "/foo/bar/baz/hello/openapi.yml"
  const projectId = getProjectId(url)
  const versionId = getVersionId(url)
  const specificationId = getSpecificationId(url)
  expect(projectId).toEqual("foo")
  expect(versionId).toEqual("bar/baz/hello")
  expect(specificationId).toBe("openapi.yml")
})

test("It does not remove \"-openapi\" suffix from project", async () => {
  const url = "/foo-openapi"
  const projectId = getProjectId(url)
  const versionId = getVersionId(url)
  const specificationId = getSpecificationId(url)
  expect(projectId).toEqual("foo-openapi")
  expect(versionId).toBeUndefined()
  expect(specificationId).toBeUndefined()
})
