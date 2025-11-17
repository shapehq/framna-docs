import { ZodType, z } from "zod"

export default class ZodJSONCoder {
  static encode<Schema extends ZodType>(schema: Schema, value: z.input<Schema>): string {
    const validatedValue = schema.parse(value)
    return JSON.stringify(validatedValue)
  }
  
  static decode<Schema extends ZodType>(schema: Schema, string: string): z.output<Schema> {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let obj: any | undefined
    try {
      obj = JSON.parse(string)
    } catch {
      throw new Error("Could not parse JSON.")
    }
    return schema.parse(obj)
  }
}
