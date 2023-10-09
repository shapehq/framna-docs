import { DateProviding } from "./DateProviding"

export class DateProvider implements DateProviding {
  get now(): Date {
    return new Date()
  }
}
