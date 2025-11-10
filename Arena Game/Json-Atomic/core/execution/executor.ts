import type { Atomic, ExecutionResult as ExecResult } from '../../types.js'
import type { Ledger } from '../ledger/ledger.js'
import { hashAtomic } from '../crypto.js'

export class CodeExecutor {
  async execute(_code: string, _context: Record<string, unknown> = {}): Promise<ExecResult> {
    // Stub implementation - in production would use vm2 or isolated-vm
    console.warn('CodeExecutor.execute is not implemented')
    return {
      status: 'error',
      error: 'Code execution not implemented',
      duration_ms: 0
    }
  }
}

export class AtomicExecutor {
  constructor(private ledger: Ledger) {}

  async execute(_atomic: Atomic): Promise<ExecResult> {
    // Stub implementation - in production would execute based on entity_type
    console.warn('AtomicExecutor.execute is not implemented')
    return {
      status: 'error',
      error: 'Atomic execution not implemented',
      duration_ms: 0
    }
  }

  /**
   * Process an atomic: execute it, create result span, and append to ledger
   * Returns the processed atomic with updated status and output
   */
  async processAtomic(atomic: Atomic): Promise<Atomic> {
    const startedAt = new Date().toISOString()
    const startTime = Date.now()

    // Update atomic status to 'running'
    const runningAtomic: Atomic = {
      ...atomic,
      status: {
        state: 'running',
        result: undefined,
        message: 'Processing...'
      },
      when: {
        ...atomic.when,
        started_at: atomic.when?.started_at || startedAt
      }
    }

    try {
      // Execute the atomic
      const execResult = await this.execute(atomic)
      const completedAt = new Date().toISOString()
      const durationMs = Date.now() - startTime

      // Create completed atomic with result
      const completedAtomic: Atomic = {
        ...runningAtomic,
        prev: atomic.hash || hashAtomic(atomic),
        output: {
          ...atomic.output,
          result: execResult.output,
          error: execResult.error,
          duration_ms: execResult.duration_ms || durationMs
        },
        status: {
          state: execResult.status === 'success' ? 'completed' : 'failed',
          result: execResult.status === 'success' ? 'ok' : 'error',
          message: execResult.error || 'Completed successfully'
        },
        when: {
          ...runningAtomic.when,
          completed_at: completedAt
        }
      }

      // Add hash if not present
      if (!completedAtomic.hash) {
        completedAtomic.hash = hashAtomic(completedAtomic)
      }

      // Append to ledger
      await this.ledger.append(completedAtomic)

      return completedAtomic
    } catch (err) {
      const completedAt = new Date().toISOString()
      const durationMs = Date.now() - startTime

      // Create failed atomic
      const failedAtomic: Atomic = {
        ...runningAtomic,
        prev: atomic.hash || hashAtomic(atomic),
        output: {
          ...atomic.output,
          error: err instanceof Error ? err.message : String(err),
          duration_ms: durationMs
        },
        status: {
          state: 'failed',
          result: 'error',
          message: err instanceof Error ? err.message : String(err)
        },
        when: {
          ...runningAtomic.when,
          completed_at: completedAt
        }
      }

      // Add hash if not present
      if (!failedAtomic.hash) {
        failedAtomic.hash = hashAtomic(failedAtomic)
      }

      // Append to ledger
      await this.ledger.append(failedAtomic)

      return failedAtomic
    }
  }
}