import { z } from "zod"
import { ZodJSONCoder } from "@/common"

const SampleAuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
})

type SampleAuthToken = z.infer<typeof SampleAuthTokenSchema>

test("It encodes a valid token", async () => {
  const token = {
    accessToken: "foo",
    refreshToken: "bar"
  }
  const str = ZodJSONCoder.encode(SampleAuthTokenSchema, token)
  const decodedToken = JSON.parse(str)
  expect(decodedToken.accessToken).toBe(token.accessToken)
  expect(decodedToken.refreshToken).toBe(token.refreshToken)
})

test("It decodes a valid token", async () => {
  const str = JSON.stringify({
    accessToken: "foo",
    refreshToken: "bar"
  })
  const token: SampleAuthToken = ZodJSONCoder.decode(SampleAuthTokenSchema, str)
  expect(token.accessToken).toBe("foo")
  expect(token.refreshToken).toBe("bar")
})

test("It throws an error when the returned OAuth token does not contain an access token", async () => {
  const str = JSON.stringify({
    refreshToken: "bar"
  })
  expect(() => ZodJSONCoder.decode(SampleAuthTokenSchema, str)).toThrow()
})

test("It throws an error when the returned OAuth token does not contain an refresh token", async () => {
  const str = JSON.stringify({
    accessToken: "foo"
  })
  expect(() => ZodJSONCoder.decode(SampleAuthTokenSchema, str)).toThrow()
})
