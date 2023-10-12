import { IDateProvider } from "./IDateProvider"

export class DateProvider implements IDateProvider {
  get now(): Date {
    return new Date()
  }
}
