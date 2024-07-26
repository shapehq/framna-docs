const isMac = () => {
  return window.navigator.userAgent.toLowerCase().includes("mac")
}

export default isMac