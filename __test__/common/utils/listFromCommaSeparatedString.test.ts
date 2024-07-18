import listFromCommaSeparatedString from "@/common/utils/listFromCommaSeparatedString"

test("It returns an empty list given undefined", async () => {
  const result = listFromCommaSeparatedString(undefined)
  expect(result).toEqual([])
})

test("It returns an empty list given an empty string", async () => {
  const result = listFromCommaSeparatedString("")
  expect(result).toEqual([])
})

test("It returns an empty list given a string white a single whitespace", async () => {
  const result = listFromCommaSeparatedString(" ")
  expect(result).toEqual([])
})

test("It returns an empty list given a string white multiple whitespaces", async () => {
  const result = listFromCommaSeparatedString("     ")
  expect(result).toEqual([])
})

test("It returns a single element", async () => {
  const result = listFromCommaSeparatedString("foo")
  expect(result).toEqual(["foo"])
})

test("It returns multiple elements", async () => {
  const result = listFromCommaSeparatedString("foo,bar")
  expect(result).toEqual(["foo", "bar"])
})

test("It trims elements for whitespace", async () => {
  const result = listFromCommaSeparatedString("foo, bar")
  expect(result).toEqual(["foo", "bar"])
})

test("It returns an empty list for a string containing a single comma", async () => {
  const result = listFromCommaSeparatedString(",")
  expect(result).toEqual([])
})

test("It returns an empty list for a string containing multiple commas", async () => {
  const result = listFromCommaSeparatedString(",,,")
  expect(result).toEqual([])
})
