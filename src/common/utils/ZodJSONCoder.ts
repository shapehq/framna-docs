import { ZodType } from "zod"

export default class ZodJSONCoder {
  static encode<Schema extends ZodType, T>(schema: Schema, value: T): string {
    console.log("Encode")
    const validatedValue = schema.parse(value)
    return JSON.stringify(validatedValue)
  }
  
  static decode<Schema extends ZodType, T>(schema: Schema, string: string): T {
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    let obj: any | undefined
    try {
      obj = JSON.parse(string)
    } catch(error) {
      throw new Error("Could not parse JSON.")
    }
    return schema.parse(obj)
  }
}
