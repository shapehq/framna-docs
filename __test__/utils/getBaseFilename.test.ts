import { getBaseFilename } from "@/common"

test("It returns base filename for file in root", async () => {
  const result = getBaseFilename("foo.yml")
  expect(result).toEqual("foo")
})

test("It returns base filename for file path including dot", async () => {
  const result = getBaseFilename("foo.bar.yml")
  expect(result).toEqual("foo.bar")
})

test("It returns base filename for file in folder", async () => {
  const result = getBaseFilename("foo/bar.yml")
  expect(result).toEqual("bar")
})

test("It returns base filename when file path starts with a slash", async () => {
  const result = getBaseFilename("/foo/bar.yml")
  expect(result).toEqual("bar")
})

test("It returns base filename when file path does not contain an extension", async () => {
  const result = getBaseFilename("foo")
  expect(result).toEqual("foo")
})

test("It returns empty string for the empty string", async () => {
  const result = getBaseFilename("")
  expect(result).toEqual("")
})
