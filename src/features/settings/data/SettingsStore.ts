import DocumentationVisualizer from "../domain/DocumentationVisualizer"
import ISettingsStore from "../domain/ISettingsStore"
import SettingsChangedEvent from "@/common/events/SettingsChangedEvent"
import { publish } from "@/common/events/utils"

const LOCAL_STORAGE_SETTINGS_KEY = "settings"

export default class SettingsStore implements ISettingsStore {
  get documentationVisualizer(): DocumentationVisualizer {
    return getSettings().documentationVisualizer
  }
  
  set documentationVisualizer(documentationVisualizer: DocumentationVisualizer) {
    setSettings({ ...getSettings(), documentationVisualizer })
  }
}

interface ISettings {
  documentationVisualizer: DocumentationVisualizer
}

function getSettings(): ISettings {
  const savedSettings = window.localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY)
  return savedSettings ? JSON.parse(savedSettings) : getDefaultSettings()
}

function setSettings(settings: ISettings) {
  window.localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings))
  publish(new SettingsChangedEvent())
}

function getDefaultSettings(): ISettings {
  return {
    documentationVisualizer: DocumentationVisualizer.SWAGGER
  }
}
