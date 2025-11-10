import type { ModelCreature, TrainingType } from "./creature-types"
import { TRAINING_PROGRAMS, startTraining, canTrain } from "./training-engine"

/**
 * CPU-based training sandbox that simulates LoRA and patches without GPU
 * Perfect for local development and testing
 */

export interface SandboxSession {
  sessionId: string
  creature: ModelCreature
  program: TrainingType
  startedAt: string
  estimatedComplete: string
  cpuUsage: number
  memoryUsage: number
  logs: string[]
}

export interface TrainingSandbox {
  activeSessions: Map<string, SandboxSession>
  completedSessions: SandboxSession[]
}

export class TrainerSandbox {
  private sessions: Map<string, SandboxSession> = new Map()
  private completedSessions: SandboxSession[] = []

  // Start CPU-based training
  async startCPUTraining(
    creature: ModelCreature,
    programId: TrainingType,
  ): Promise<{ session: SandboxSession; error?: string }> {
    // Check if creature can train
    const { canTrain: allowed, reason } = canTrain(creature)
    if (!allowed) {
      return { session: null as any, error: reason }
    }

    const program = TRAINING_PROGRAMS[programId]

    // CPU-only programs
    if (program.requiresGPU) {
      return { session: null as any, error: "This program requires GPU - use sandbox GPU mode or cloud training" }
    }

    // Create training session
    const { session: trainingSession, event } = startTraining(creature, programId)

    const sandboxSession: SandboxSession = {
      sessionId: trainingSession.id,
      creature,
      program: programId,
      startedAt: trainingSession.startedAt,
      estimatedComplete: trainingSession.completesAt,
      cpuUsage: Math.floor(Math.random() * 40 + 30), // 30-70%
      memoryUsage: Math.floor(Math.random() * 2000 + 500), // 500-2500 MB
      logs: [
        `[${new Date().toISOString()}] Training started: ${program.name}`,
        `[${new Date().toISOString()}] Loading model weights...`,
        `[${new Date().toISOString()}] Applying virtual LoRA patch...`,
        `[${new Date().toISOString()}] CPU cores: ${navigator.hardwareConcurrency || 4}`,
        `[${new Date().toISOString()}] Estimated completion: ${program.duration} minutes`,
      ],
    }

    this.sessions.set(sandboxSession.sessionId, sandboxSession)

    // Simulate training progress
    this.simulateTraining(sandboxSession, program.duration)

    return { session: sandboxSession }
  }

  // Simulate training with live updates
  private simulateTraining(session: SandboxSession, durationMinutes: number) {
    const intervalMs = (durationMinutes * 60 * 1000) / 10 // 10 progress updates

    const interval = setInterval(() => {
      const currentSession = this.sessions.get(session.sessionId)
      if (!currentSession) {
        clearInterval(interval)
        return
      }

      // Add progress log
      const progress = ((Date.now() - new Date(session.startedAt).getTime()) / (durationMinutes * 60 * 1000)) * 100
      currentSession.logs.push(
        `[${new Date().toISOString()}] Training progress: ${Math.min(100, progress).toFixed(1)}%`,
      )

      // Update CPU/memory usage
      currentSession.cpuUsage = Math.floor(Math.random() * 40 + 30)
      currentSession.memoryUsage = Math.floor(Math.random() * 2000 + 500)

      // Check if complete
      if (Date.now() >= new Date(session.estimatedComplete).getTime()) {
        currentSession.logs.push(`[${new Date().toISOString()}] Training completed successfully!`)
        currentSession.logs.push(`[${new Date().toISOString()}] Applying buffs and traits...`)

        this.completedSessions.push(currentSession)
        this.sessions.delete(session.sessionId)
        clearInterval(interval)
      }
    }, intervalMs)
  }

  // Get session status
  getSession(sessionId: string): SandboxSession | undefined {
    return this.sessions.get(sessionId)
  }

  // Get all active sessions
  getActiveSessions(): SandboxSession[] {
    return Array.from(this.sessions.values())
  }

  // Get completed sessions
  getCompletedSessions(): SandboxSession[] {
    return this.completedSessions
  }

  // Cancel training
  cancelTraining(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.logs.push(`[${new Date().toISOString()}] Training cancelled by user`)
      this.sessions.delete(sessionId)
      return true
    }
    return false
  }

  // Export session logs
  exportLogs(sessionId: string): string {
    const session = this.sessions.get(sessionId) || this.completedSessions.find((s) => s.sessionId === sessionId)
    if (!session) return ""

    return session.logs.join("\n")
  }

  // Get resource usage stats
  getResourceStats(): { totalCPU: number; totalMemory: number; activeSessions: number } {
    let totalCPU = 0
    let totalMemory = 0

    for (const session of this.sessions.values()) {
      totalCPU += session.cpuUsage
      totalMemory += session.memoryUsage
    }

    return {
      totalCPU,
      totalMemory,
      activeSessions: this.sessions.size,
    }
  }
}

// Singleton instance
export const trainerSandbox = new TrainerSandbox()
