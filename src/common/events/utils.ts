import BaseEvent, { Events } from "./BaseEvent"

function subscribe(eventName: Events, listener: (event: CustomEvent<any>) => void) {
  document.addEventListener(eventName, listener as () => void);
}

function unsubscribe(eventName: Events, listener: (event: CustomEvent<any>) => void) {
  document.removeEventListener(eventName, listener as () => void);
}

function publish<T>(event: BaseEvent<T>) {
  const customEvent = new CustomEvent(event.name, {
    detail: event.data
  });
  document.dispatchEvent(customEvent);
}

export { publish, subscribe, unsubscribe };