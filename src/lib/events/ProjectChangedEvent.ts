import BaseEvent, { Events } from "./BaseEvent";

export interface ProjectChangedEventData {
    projectName: string;
}

export default class ProjectChangedEvent extends BaseEvent<ProjectChangedEventData> {
    constructor(projectName: string) {
        super(Events.PROJECT_CHANGED, {projectName});
    }
}