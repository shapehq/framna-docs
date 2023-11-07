import { KeyValueUserDataRepository } from "../../../src/common"

test("It reads the expected key", async () => {
  let readKey: string | undefined
  const sut = new KeyValueUserDataRepository({
    async get(key) {
      readKey = key
      return ""
    },
    async set() {},
    async delete() {}
  }, "foo")
  await sut.get("123")
  expect(readKey).toBe("foo[123]")
})

test("It stores values under the expected key", async () => {
  let storedKey: string | undefined
  const sut = new KeyValueUserDataRepository({
    async get() {
      return ""
    },
    async set(key) {
      storedKey = key
    },
    async delete() {}
  }, "foo")
  await sut.set("123", "bar")
  expect(storedKey).toBe("foo[123]")
})


test("It deletes the expected key", async () => {
  let deletedKey: string | undefined
  const sut = new KeyValueUserDataRepository({
    async get() {
      return ""
    },
    async set() {},
    async delete(key) {
      deletedKey = key
    }
  }, "foo")
  await sut.delete("123")
  expect(deletedKey).toBe("foo[123]")
})
