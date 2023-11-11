export default class WindowPathnameReader {
  get pathname() {
    if (typeof window === "undefined") {
      return ""
    }
    return window.location.pathname
  }
}
