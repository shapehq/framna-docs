import BaseEvent, { Events } from "./BaseEvent"

function subscribe(eventName: Events, listener: () => void) {
  document.addEventListener(eventName, listener)
}

function unsubscribe(eventName: Events, listener: () => void) {
  document.removeEventListener(eventName, listener)
}

function publish<T>(event: BaseEvent<T>) {
  const customEvent = new CustomEvent(event.name, {
    detail: event.data
  })
  document.dispatchEvent(customEvent)
}

export { publish, subscribe, unsubscribe }