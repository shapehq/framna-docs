import { DateProviding } from "@/lib/date/DateProviding"

export class MockDateProvider implements DateProviding {
  now = new Date()
}
