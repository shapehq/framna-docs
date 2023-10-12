import { DocumentationVisualizer } from "../components/DocumentationViewerComponent";
import { ISettings } from "../components/SettingsComponent";
import SettingsChangedEvent from "../events/SettingsChangeEvent";
import { publish } from "./EventsUtils";

const LOCAL_STORAGE_SETTINGS_KEY = "settings";

export function getSettings(): ISettings {
    const savedSettings = window.localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    return savedSettings ? JSON.parse(savedSettings) : getDefaultSettings();
}

export function setSettings(settings: ISettings) {
    window.localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    publish(new SettingsChangedEvent())
}

function getDefaultSettings(): ISettings {
    return {
        documentationVisualizer: DocumentationVisualizer.SWAGGER,
    };
}