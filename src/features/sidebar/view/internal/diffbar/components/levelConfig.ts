export type Level = 1 | 2 | 3

export const getLevelConfig = (level: Level) => {
  switch (level) {
    case 3:
      return { label: "breaking", color: "#ff5555" }
    case 2:
      return { label: "warn", color: "#ffaa33" }
    case 1:
    default:
      return { label: "info", color: "#44ddee" }
  }
}
