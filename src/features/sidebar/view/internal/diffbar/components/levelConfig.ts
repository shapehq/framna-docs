export type Level = 1 | 2 | 3

export const getLevelConfig = (level: Level) => {
  switch (level) {
    case 3:
      return { label: "breaking", color: "#e88388" }
    case 2:
      return { label: "warn", color: "#dbab79" }
    case 1:
    default:
      return { label: "info", color: "#66c2cd" }
  }
}
