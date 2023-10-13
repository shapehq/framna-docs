export enum Events {
    SETTINGS_CHANGED = "SETTINGS_CHANGED",
    PROJECT_CHANGED = "PROJECT_CHANGED",
    VERSION_CHANGED = "VERSION_CHANGED",
    OPEN_API_SPECIFICATION_CHANGED = "OPEN_API_SPECIFICATION_CHANGED",
}

export default abstract class BaseEvent<T> {
    constructor(public name: Events, public data: T) {}
}