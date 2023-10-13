import BaseEvent, { Events } from "./BaseEvent";

export default class SettingsChangedEvent extends BaseEvent<void> {
    constructor() {
        super(Events.SETTINGS_CHANGED, undefined);
    }
}