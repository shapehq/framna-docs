import { DocumentationVisualizer } from "../components/DocumentationViewerComponent";
import { ISettings } from "../components/SettingsComponent";

const LOCAL_STORAGE_SETTINGS_KEY = "settings";

export function getSettings(): ISettings {
    const savedSettings = window.localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    return savedSettings ? JSON.parse(savedSettings) : getDefaultSettings();
}

export function setSettings(settings: ISettings) {
    window.localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
}

function getDefaultSettings(): ISettings {
    return {
        documentationVisualizer: DocumentationVisualizer.SWAGGER,
    };
}