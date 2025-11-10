// Web Worker for heavy atomic span execution
import { runAtomicSpan } from "./atomic-executor"

self.onmessage = async (e) => {
  const { span } = e.data

  try {
    const result = await runAtomicSpan(span)
    self.postMessage(result)
  } catch (error: any) {
    self.postMessage({
      success: false,
      output: {},
      duration: 0,
      logs: [`Worker error: ${error.message}`],
      error: error.message,
    })
  }
}
