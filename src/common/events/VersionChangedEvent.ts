import BaseEvent, { Events } from "./BaseEvent"

export interface VersionChangedEventData {
  versionName: string
}

export default class VersionChangedEvent extends BaseEvent<VersionChangedEventData> {
  constructor(versionName: string) {
    super(Events.VERSION_CHANGED, { versionName })
  }
}