import { IOpenApiSpecification } from "../projects/IOpenAPISpecification";
import BaseEvent, { Events } from "./BaseEvent";

export interface OpenApiSpecificationChangedEventData {
    openApiSpecification: IOpenApiSpecification;
}

export default class OpenApiSpecificationChangedEvent extends BaseEvent<OpenApiSpecificationChangedEventData> {
    constructor(openApiSpecification: IOpenApiSpecification) {
        super(Events.OPEN_API_SPECIFICATION_CHANGED, { openApiSpecification });
    }
}