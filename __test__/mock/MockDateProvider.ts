import { IDateProvider } from "@/lib/date/IDateProvider"

export class MockDateProvider implements IDateProvider {
  now = new Date()
}
