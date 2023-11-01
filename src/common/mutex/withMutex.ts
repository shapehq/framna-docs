import IMutex from "./IMutex"

export default async function withMutex<T>(
  mutex: IMutex,
  f: () => Promise<T>
): Promise<T> {
  await mutex.acquire()
  try {
    const value = await f()
    await mutex.release()
    return value
  } catch(error) {
    await mutex.release()
    throw error
  }
}
