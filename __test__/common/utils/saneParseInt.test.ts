import { saneParseInt } from "@/common"

test("It parses an integer", async () => {
  // @ts-ignore
  const val = saneParseInt(42 as string)
  expect(val).toBe(42)
})

test("It parses a string representing an integer", async () => {
  const val = saneParseInt("42")
  expect(val).toBe(42)
})

test("It fails parsing a string representing a float", async () => {
  const val = saneParseInt("4.2")
  expect(val).toBeUndefined()
})

test("It fails parsing a string", async () => {
  const val = saneParseInt("foo")
  expect(val).toBeUndefined()
})

test("It fails parsing a UUID", async () => {
  const val = saneParseInt("30729470-25e4-4a50-8a0a-106fc67948f1")
  expect(val).toBeUndefined()
})
