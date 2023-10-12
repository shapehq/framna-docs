export enum Events {
    SETTINGS_CHANGED = "SETTINGS_CHANGED",
    OPEN_API_SPECIFICATION_CHANGED = "OPEN_API_SPECIFICATION_CHANGED"
}

export default abstract class BaseEvent<T> {
    constructor(public name: Events, public data: T) {}
}