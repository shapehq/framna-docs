import IMutex from "./IMutex"

export default async function withMutex<T>(
  mutex: IMutex,
  f: () => Promise<T>
): Promise<T> {
  console.log("⏳ Wait for lock")
  await mutex.acquire()
  console.log("🔐 Lock acquired")
  try {
    const value = await f()
    await mutex.release()
    console.log("🔑 Lock released")
    return value
  } catch(error) {
    await mutex.release()
    console.log("🔑 Lock released")
    throw error
  }
}
