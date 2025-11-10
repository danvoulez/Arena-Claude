import type { AtomicSpan, ExecutionResult } from "./atomic-types"
import type { ModelCreature } from "./creature-types"

// Sandbox executor - runs atomic operations locally
export async function runAtomicSpan(span: AtomicSpan, creature?: ModelCreature): Promise<ExecutionResult> {
  const startTime = performance.now()
  const logs: string[] = []

  try {
    logs.push(`[v0] Starting span ${span.id} of kind ${span.kind}`)

    let output: Record<string, any> = {}

    switch (span.kind) {
      case "training":
        output = await executeTraining(span.input, creature, logs)
        break
      case "evaluation":
        output = await executeEvaluation(span.input, creature, logs)
        break
      case "battle":
        output = await executeBattle(span.input, creature, logs)
        break
      case "sandbox":
        output = await executeSandbox(span.input, logs)
        break
      default:
        throw new Error(`Unknown span kind: ${span.kind}`)
    }

    const duration = performance.now() - startTime
    logs.push(`[v0] Completed span ${span.id} in ${duration.toFixed(2)}ms`)

    return {
      success: true,
      output,
      duration,
      logs,
    }
  } catch (error: any) {
    const duration = performance.now() - startTime
    logs.push(`[v0] Failed span ${span.id}: ${error.message}`)

    return {
      success: false,
      output: {},
      duration,
      logs,
      error: error.message,
    }
  }
}

// Execute training simulation (LoRA virtual, patches)
async function executeTraining(
  input: Record<string, any>,
  creature: ModelCreature | undefined,
  logs: string[],
): Promise<Record<string, any>> {
  logs.push(`[v0] Simulating training: ${input.programType}`)

  const { dataset, learningRate, epochs } = input

  // Simulate CPU-based training
  await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate compute

  const xpGained = Math.floor(Math.random() * 30) + 20
  const accuracyGain = Math.random() * 5 + 2

  logs.push(`[v0] Processed ${dataset?.length || 0} examples`)
  logs.push(`[v0] Gained ${xpGained} XP, +${accuracyGain.toFixed(1)} accuracy`)

  return {
    xpGained,
    accuracyGain,
    epochs: epochs || 3,
    notes: "Training completed on CPU sandbox",
  }
}

// Execute evaluation
async function executeEvaluation(
  input: Record<string, any>,
  creature: ModelCreature | undefined,
  logs: string[],
): Promise<Record<string, any>> {
  logs.push(`[v0] Running evaluation: ${input.benchmarkName}`)

  const { prompts, expectedOutputs } = input

  // Simulate evaluation
  const results = prompts?.map((prompt: string, i: number) => ({
    prompt,
    expected: expectedOutputs?.[i],
    score: Math.random(),
  }))

  const avgScore = results?.reduce((sum: number, r: any) => sum + r.score, 0) / (results?.length || 1)

  logs.push(`[v0] Evaluated ${results?.length || 0} prompts`)
  logs.push(`[v0] Average score: ${(avgScore * 100).toFixed(1)}%`)

  return {
    score: avgScore,
    results,
    passed: avgScore > 0.7,
  }
}

// Execute battle simulation
async function executeBattle(
  input: Record<string, any>,
  creature: ModelCreature | undefined,
  logs: string[],
): Promise<Record<string, any>> {
  logs.push(`[v0] Simulating battle`)

  const { opponentId, prompt } = input

  // Simulate battle mechanics
  const damage = Math.floor(Math.random() * 20) + 10
  const xpGained = Math.floor(Math.random() * 15) + 5

  logs.push(`[v0] Dealt ${damage} damage`)
  logs.push(`[v0] Gained ${xpGained} XP`)

  return {
    damage,
    xpGained,
    winner: Math.random() > 0.5 ? "self" : "opponent",
  }
}

// Execute arbitrary sandbox code (whitelist-based)
async function executeSandbox(input: Record<string, any>, logs: string[]): Promise<Record<string, any>> {
  logs.push(`[v0] Running sandbox operation`)

  const { operation, args } = input

  // Whitelist of allowed operations
  const allowedOps = ["simulateLoRA", "calculateAccuracy", "mutateWeights"]

  if (!allowedOps.includes(operation)) {
    throw new Error(`Operation not allowed: ${operation}`)
  }

  // Execute whitelisted operation
  const result = await sandboxOperations[operation as keyof typeof sandboxOperations]?.(args, logs)

  return result || {}
}

// Whitelisted sandbox operations
const sandboxOperations = {
  simulateLoRA: async (args: any, logs: string[]) => {
    const { dataset, learningRate } = args
    logs.push(`[v0] LoRA simulation: LR=${learningRate}`)

    return {
      xpGained: 24,
      notes: "Learned faster on positive prompts",
    }
  },

  calculateAccuracy: async (args: any, logs: string[]) => {
    const { predictions, labels } = args
    const correct = predictions?.filter((p: any, i: number) => p === labels?.[i]).length || 0
    const accuracy = correct / (predictions?.length || 1)

    logs.push(`[v0] Accuracy: ${(accuracy * 100).toFixed(1)}%`)

    return { accuracy }
  },

  mutateWeights: async (args: any, logs: string[]) => {
    const { weights, mutationRate } = args
    logs.push(`[v0] Mutating weights with rate ${mutationRate}`)

    return {
      mutatedCount: Math.floor((weights?.length || 0) * mutationRate),
    }
  },
}

// Worker-based execution (for heavy operations)
export function runInWorker(span: AtomicSpan): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./atomic-worker.ts", import.meta.url), { type: "module" })

    worker.postMessage({ span })

    worker.onmessage = (e) => {
      resolve(e.data)
      worker.terminate()
    }

    worker.onerror = (error) => {
      reject(error)
      worker.terminate()
    }
  })
}
