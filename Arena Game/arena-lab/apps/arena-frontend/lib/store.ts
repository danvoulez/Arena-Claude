import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ModelCreature, DuelRecord, LifeEvent, TrainingSession } from "./creature-types"
import type { ProfessorOakMessage } from "./professor-oak"
import { atomicAPI } from "./atomic-api"

export interface PipelineNode {
  id: string
  type: string
  label: string
  position: { x: number; y: number }
  data: Record<string, any>
  status?: "idle" | "running" | "success" | "error"
}

export interface PipelineEdge {
  id: string
  source: string
  target: string
}

export interface Pipeline {
  id: string
  name: string
  nodes: PipelineNode[]
  edges: PipelineEdge[]
  createdAt: string
  updatedAt: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  pipelines: Pipeline[]
  createdAt: string
}

export interface Environment {
  id: string
  name: string
  variables: Record<string, string>
  isActive: boolean
}

export interface ArenaModel {
  id: string
  name: string
  provider: string
  elo: number
  wins: number
  losses: number
  draws: number
  battles: ArenaBattle[]
}

export interface ArenaBattle {
  id: string
  modelAId: string
  modelBId: string
  prompt: string
  responseA: string
  responseB: string
  winner: "A" | "B" | "draw" | null
  timestamp: string
  metrics?: {
    latencyA: number
    latencyB: number
    tokensA: number
    tokensB: number
  }
}

interface ArenaState {
  // Collections
  collections: Collection[]
  activeCollectionId: string | null
  addCollection: (name: string, description?: string) => void
  deleteCollection: (id: string) => void

  // Pipelines
  activePipelineId: string | null
  addPipeline: (collectionId: string, name: string) => void
  updatePipeline: (pipelineId: string, updates: Partial<Pipeline>) => void
  deletePipeline: (pipelineId: string) => void
  setActivePipeline: (pipelineId: string) => void

  // Nodes
  addNode: (node: PipelineNode) => void
  updateNode: (nodeId: string, updates: Partial<PipelineNode>) => void
  deleteNode: (nodeId: string) => void

  // Edges
  addEdge: (edge: PipelineEdge) => void
  deleteEdge: (edgeId: string) => void

  // Environments
  environments: Environment[]
  activeEnvironmentId: string | null
  addEnvironment: (name: string, variables: Record<string, string>) => void
  updateEnvironment: (id: string, updates: Partial<Environment>) => void
  deleteEnvironment: (id: string) => void
  setActiveEnvironment: (id: string) => void

  // UI State
  selectedNodeId: string | null
  setSelectedNode: (nodeId: string | null) => void

  arenaModels: ArenaModel[]
  arenaBattles: ArenaBattle[]
  addArenaModel: (model: Omit<ArenaModel, "id" | "elo" | "wins" | "losses" | "draws" | "battles">) => void
  updateArenaModel: (id: string, updates: Partial<ArenaModel>) => void
  deleteArenaModel: (id: string) => void
  addArenaBattle: (battle: Omit<ArenaBattle, "id" | "timestamp">) => void
  recordBattleResult: (battleId: string, winner: "A" | "B" | "draw") => void

  // Creature System State
  creatures: ModelCreature[]
  duelRecords: DuelRecord[]
  lifeEvents: LifeEvent[]
  addCreature: (
    creature: Omit<
      ModelCreature,
      | "id"
      | "xp"
      | "level"
      | "health"
      | "maxHealth"
      | "stamina"
      | "maxStamina"
      | "charisma"
      | "accuracy"
      | "creativity"
      | "reasoning"
      | "winCount"
      | "lossCount"
      | "drawCount"
      | "statusEffects"
      | "createdAt"
      | "lastUsed"
      | "lastRested"
      | "totalBattles"
      | "traits"
      | "activeBuffs"
      | "publicKey"
    >,
  ) => void
  updateCreature: (id: string, updates: Partial<ModelCreature>) => void
  deleteCreature: (id: string) => void
  addDuelRecord: (record: DuelRecord) => void
  addLifeEvent: (event: LifeEvent) => void
  restCreature: (id: string) => void

  // Training Session State
  trainingSessions: TrainingSession[]
  addTrainingSession: (session: TrainingSession) => void
  updateTrainingSession: (id: string, updates: Partial<TrainingSession>) => void
  completeTrainingSession: (id: string) => void

  // Progression System State
  onboardingStep: number
  completedOnboarding: boolean
  unlockedAchievements: string[]
  completeOnboardingStep: (step: number) => void
  skipOnboarding: () => void
  unlockAchievement: (achievementId: string) => void

  // Professor Oak / BYOK State
  professorOakKey: string | null
  professorOakProvider: "openai" | "anthropic" | "google" | null
  professorOakMessages: ProfessorOakMessage[]
  recentNarrativeEvents: Array<{ type: string; timestamp?: string; data: Record<string, any> }>
  arenaActive: boolean
  setProfessorOak: (apiKey: string, provider: "openai" | "anthropic" | "google") => void
  clearProfessorOak: () => void
  addOakMessage: (message: ProfessorOakMessage) => void
  setRecentNarrativeEvents: (events: Array<{ type: string; timestamp?: string; data: Record<string, any> }>) => void
}

export const useArenaStore = create<ArenaState>()(
  persist(
    (set, get) => ({
      // Initial Collections
      collections: [
        {
          id: "default",
          name: "My Pipelines",
          description: "Default collection",
          pipelines: [
            {
              id: "pipeline-1",
              name: "Fine-tune GPT",
              nodes: [],
              edges: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
        },
      ],
      activeCollectionId: "default",

      addCollection: (name, description) => {
        const newCollection: Collection = {
          id: `col-${Date.now()}`,
          name,
          description,
          pipelines: [],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ collections: [...state.collections, newCollection] }))
      },

      deleteCollection: (id) => {
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
          activeCollectionId: state.activeCollectionId === id ? state.collections[0]?.id : state.activeCollectionId,
        }))
      },

      // Pipelines
      activePipelineId: "pipeline-1",

      addPipeline: (collectionId, name) => {
        const newPipeline: Pipeline = {
          id: `pipe-${Date.now()}`,
          name,
          nodes: [],
          edges: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId ? { ...col, pipelines: [...col.pipelines, newPipeline] } : col,
          ),
          activePipelineId: newPipeline.id,
        }))
      },

      updatePipeline: (pipelineId, updates) => {
        set((state) => ({
          collections: state.collections.map((col) => ({
            ...col,
            pipelines: col.pipelines.map((pipe) =>
              pipe.id === pipelineId ? { ...pipe, ...updates, updatedAt: new Date().toISOString() } : pipe,
            ),
          })),
        }))
      },

      deletePipeline: (pipelineId) => {
        set((state) => ({
          collections: state.collections.map((col) => ({
            ...col,
            pipelines: col.pipelines.filter((p) => p.id !== pipelineId),
          })),
          activePipelineId: state.activePipelineId === pipelineId ? null : state.activePipelineId,
        }))
      },

      setActivePipeline: (pipelineId) => {
        set({ activePipelineId: pipelineId })
      },

      // Nodes
      addNode: (node) => {
        const { activePipelineId } = get()
        if (!activePipelineId) return

        set((state) => ({
          collections: state.collections.map((col) => ({
            ...col,
            pipelines: col.pipelines.map((pipe) =>
              pipe.id === activePipelineId
                ? { ...pipe, nodes: [...pipe.nodes, node], updatedAt: new Date().toISOString() }
                : pipe,
            ),
          })),
        }))
      },

      updateNode: (nodeId, updates) => {
        const { activePipelineId } = get()
        if (!activePipelineId) return

        set((state) => ({
          collections: state.collections.map((col) => ({
            ...col,
            pipelines: col.pipelines.map((pipe) =>
              pipe.id === activePipelineId
                ? {
                    ...pipe,
                    nodes: pipe.nodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node)),
                    updatedAt: new Date().toISOString(),
                  }
                : pipe,
            ),
          })),
        }))
      },

      deleteNode: (nodeId) => {
        const { activePipelineId } = get()
        if (!activePipelineId) return

        set((state) => ({
          collections: state.collections.map((col) => ({
            ...col,
            pipelines: col.pipelines.map((pipe) =>
              pipe.id === activePipelineId
                ? {
                    ...pipe,
                    nodes: pipe.nodes.filter((n) => n.id !== nodeId),
                    edges: pipe.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
                    updatedAt: new Date().toISOString(),
                  }
                : pipe,
            ),
          })),
          selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        }))
      },

      // Edges
      addEdge: (edge) => {
        const { activePipelineId } = get()
        if (!activePipelineId) return

        set((state) => ({
          collections: state.collections.map((col) => ({
            ...col,
            pipelines: col.pipelines.map((pipe) =>
              pipe.id === activePipelineId
                ? { ...pipe, edges: [...pipe.edges, edge], updatedAt: new Date().toISOString() }
                : pipe,
            ),
          })),
        }))
      },

      deleteEdge: (edgeId) => {
        const { activePipelineId } = get()
        if (!activePipelineId) return

        set((state) => ({
          collections: state.collections.map((col) => ({
            ...col,
            pipelines: col.pipelines.map((pipe) =>
              pipe.id === activePipelineId
                ? {
                    ...pipe,
                    edges: pipe.edges.filter((e) => e.id !== edgeId),
                    updatedAt: new Date().toISOString(),
                  }
                : pipe,
            ),
          })),
        }))
      },

      // Environments
      environments: [
        { id: "dev", name: "Development", variables: {}, isActive: true },
        { id: "staging", name: "Staging", variables: {}, isActive: false },
        { id: "prod", name: "Production", variables: {}, isActive: false },
      ],
      activeEnvironmentId: "dev",

      addEnvironment: (name, variables) => {
        const newEnv: Environment = {
          id: `env-${Date.now()}`,
          name,
          variables,
          isActive: false,
        }
        set((state) => ({ environments: [...state.environments, newEnv] }))
      },

      updateEnvironment: (id, updates) => {
        set((state) => ({
          environments: state.environments.map((env) => (env.id === id ? { ...env, ...updates } : env)),
        }))
      },

      deleteEnvironment: (id) => {
        set((state) => ({
          environments: state.environments.filter((e) => e.id !== id),
          activeEnvironmentId: state.activeEnvironmentId === id ? state.environments[0]?.id : state.activeEnvironmentId,
        }))
      },

      setActiveEnvironment: (id) => {
        set((state) => ({
          environments: state.environments.map((env) => ({
            ...env,
            isActive: env.id === id,
          })),
          activeEnvironmentId: id,
        }))
      },

      // UI State
      selectedNodeId: null,
      setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

      arenaModels: [
        {
          id: "model-1",
          name: "GPT-4o-mini",
          provider: "OpenAI",
          elo: 1842,
          wins: 23,
          losses: 7,
          draws: 2,
          battles: [],
        },
        {
          id: "model-2",
          name: "Claude Sonnet 3.5",
          provider: "Anthropic",
          elo: 1756,
          wins: 18,
          losses: 12,
          draws: 3,
          battles: [],
        },
        {
          id: "model-3",
          name: "Gemini 2.0 Flash",
          provider: "Google",
          elo: 1698,
          wins: 15,
          losses: 14,
          draws: 1,
          battles: [],
        },
      ],
      arenaBattles: [],

      addArenaModel: (model) => {
        const newModel: ArenaModel = {
          ...model,
          id: `model-${Date.now()}`,
          elo: 1500,
          wins: 0,
          losses: 0,
          draws: 0,
          battles: [],
        }
        set((state) => ({ arenaModels: [...state.arenaModels, newModel] }))
      },

      updateArenaModel: (id, updates) => {
        set((state) => ({
          arenaModels: state.arenaModels.map((model) => (model.id === id ? { ...model, ...updates } : model)),
        }))
      },

      deleteArenaModel: (id) => {
        set((state) => ({
          arenaModels: state.arenaModels.filter((m) => m.id !== id),
        }))
      },

      addArenaBattle: (battle) => {
        const newBattle: ArenaBattle = {
          ...battle,
          id: `battle-${Date.now()}`,
          timestamp: new Date().toISOString(),
        }
        set((state) => ({ arenaBattles: [newBattle, ...state.arenaBattles] }))
      },

      recordBattleResult: (battleId, winner) => {
        const battle = get().arenaBattles.find((b) => b.id === battleId)
        if (!battle) return

        const modelA = get().arenaModels.find((m) => m.id === battle.modelAId)
        const modelB = get().arenaModels.find((m) => m.id === battle.modelBId)
        if (!modelA || !modelB) return

        // Calculate ELO changes
        const K = 32 // K-factor
        const expectedA = 1 / (1 + Math.pow(10, (modelB.elo - modelA.elo) / 400))
        const expectedB = 1 / (1 + Math.pow(10, (modelA.elo - modelB.elo) / 400))

        let scoreA = 0
        let scoreB = 0

        if (winner === "A") {
          scoreA = 1
          scoreB = 0
        } else if (winner === "B") {
          scoreA = 0
          scoreB = 1
        } else {
          scoreA = 0.5
          scoreB = 0.5
        }

        const newEloA = modelA.elo + K * (scoreA - expectedA)
        const newEloB = modelB.elo + K * (scoreB - expectedB)

        set((state) => ({
          arenaBattles: state.arenaBattles.map((b) => (b.id === battleId ? { ...b, winner } : b)),
          arenaModels: state.arenaModels.map((model) => {
            if (model.id === modelA.id) {
              return {
                ...model,
                elo: Math.round(newEloA),
                wins: winner === "A" ? model.wins + 1 : model.wins,
                losses: winner === "B" ? model.losses + 1 : model.losses,
                draws: winner === "draw" ? model.draws + 1 : model.draws,
              }
            }
            if (model.id === modelB.id) {
              return {
                ...model,
                elo: Math.round(newEloB),
                wins: winner === "B" ? model.wins + 1 : model.wins,
                losses: winner === "A" ? model.losses + 1 : model.losses,
                draws: winner === "draw" ? model.draws + 1 : model.draws,
              }
            }
            return model
          }),
        }))
      },

      // Creature System State
      creatures: [
        {
          id: "creature-1",
          name: "GPT-4o-mini",
          provider: "openai",
          version: "gpt-4o-mini",
          xp: 450,
          level: 3,
          health: 85,
          maxHealth: 120,
          stamina: 70,
          maxStamina: 100,
          charisma: 75,
          accuracy: 82,
          creativity: 78,
          reasoning: 85,
          winCount: 23,
          lossCount: 7,
          drawCount: 2,
          statusEffects: ["energized"],
          traits: [], // Added traits
          activeBuffs: [], // Added active buffs
          publicKey: "public-key-1",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lastRested: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          totalBattles: 32,
          color: "#10b981",
        },
        {
          id: "creature-2",
          name: "Claude Sonnet 3.5",
          provider: "anthropic",
          version: "claude-3-5-sonnet",
          xp: 320,
          level: 2,
          health: 95,
          maxHealth: 100,
          stamina: 85,
          maxStamina: 100,
          charisma: 88,
          accuracy: 90,
          creativity: 85,
          reasoning: 92,
          winCount: 18,
          lossCount: 12,
          drawCount: 3,
          statusEffects: ["focused"],
          traits: ["Strategic"], // Added trait
          activeBuffs: [], // Added active buffs
          publicKey: "public-key-2",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          lastRested: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          totalBattles: 33,
          color: "#8b5cf6",
        },
        {
          id: "creature-3",
          name: "Gemini 2.0 Flash",
          provider: "google",
          version: "gemini-2.0-flash",
          xp: 180,
          level: 2,
          health: 60,
          maxHealth: 100,
          stamina: 45,
          maxStamina: 100,
          charisma: 70,
          accuracy: 75,
          creativity: 80,
          reasoning: 78,
          winCount: 15,
          lossCount: 14,
          drawCount: 1,
          statusEffects: ["tired"],
          traits: [], // Added traits
          activeBuffs: [], // Added active buffs
          publicKey: "public-key-3",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsed: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
          lastRested: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          totalBattles: 30,
          color: "#f59e0b",
        },
      ],
      duelRecords: [],
      lifeEvents: [],

      // Training Session State
      trainingSessions: [],

      addTrainingSession: (session) => {
        set((state) => ({ trainingSessions: [...state.trainingSessions, session] }))
      },

      updateTrainingSession: (id, updates) => {
        set((state) => ({
          trainingSessions: state.trainingSessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }))
      },

      completeTrainingSession: (id) => {
        const session = get().trainingSessions.find((s) => s.id === id)
        if (!session) return

        const creature = get().creatures.find((c) => c.id === session.creatureId)
        if (!creature) return

        const { completeTraining } = require("./training-engine")
        const { creature: trained, event } = completeTraining(creature, session)

        set((state) => ({
          creatures: state.creatures.map((c) => (c.id === creature.id ? trained : c)),
          trainingSessions: state.trainingSessions.map((s) =>
            s.id === id ? { ...s, status: "completed" as const } : s,
          ),
          lifeEvents: [event, ...state.lifeEvents],
        }))
      },

      addCreature: (creature) => {
        const newCreature: ModelCreature = {
          ...creature,
          id: `creature-${Date.now()}`,
          xp: 0,
          level: 1,
          health: 100,
          maxHealth: 100,
          stamina: 100,
          maxStamina: 100,
          winCount: 0,
          lossCount: 0,
          drawCount: 0,
          statusEffects: [],
          traits: [],
          activeBuffs: [],
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          lastRested: new Date().toISOString(),
          totalBattles: 0,
          publicKey: "", // Initialize with empty string instead of undefined
        }

        atomicAPI
          .generateIdentity()
          .then(({ publicKey }) => {
            set((state) => ({
              creatures: state.creatures.map((c) => (c.id === newCreature.id ? { ...c, publicKey } : c)),
            }))
          })
          .catch((err) => {
            console.error("[v0] Failed to generate creature identity:", err)
          })

        set((state) => ({ creatures: [...state.creatures, newCreature] }))
      },

      updateCreature: (id, updates) => {
        set((state) => ({
          creatures: state.creatures.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      deleteCreature: (id) => {
        set((state) => ({
          creatures: state.creatures.filter((c) => c.id !== id),
        }))
      },

      addDuelRecord: (record) => {
        set((state) => ({ duelRecords: [record, ...state.duelRecords] }))
      },

      addLifeEvent: (event) => {
        set((state) => ({ lifeEvents: [event, ...state.lifeEvents] }))
      },

      restCreature: (id) => {
        const creature = get().creatures.find((c) => c.id === id)
        if (!creature) return

        const { rest } = require("./creature-engine")
        const { creature: rested, event } = rest(creature)

        set((state) => ({
          creatures: state.creatures.map((c) => (c.id === id ? rested : c)),
          lifeEvents: [event, ...state.lifeEvents],
        }))
      },

      // Progression System State
      onboardingStep: 1,
      completedOnboarding: false,
      unlockedAchievements: [],

      completeOnboardingStep: (step) => {
        set((state) => ({
          onboardingStep: step + 1,
          completedOnboarding: step >= 7, // 7 total steps
        }))
      },

      skipOnboarding: () => {
        set({ completedOnboarding: true, onboardingStep: 8 })
      },

      unlockAchievement: (achievementId) => {
        set((state) => {
          if (state.unlockedAchievements.includes(achievementId)) return state
          return {
            unlockedAchievements: [...state.unlockedAchievements, achievementId],
          }
        })
      },

      // Professor Oak / BYOK State
      professorOakKey: null,
      professorOakProvider: null,
      professorOakMessages: [],
      recentNarrativeEvents: [],
      arenaActive: false,

      setProfessorOak: (apiKey, provider) => {
        set({
          professorOakKey: apiKey,
          professorOakProvider: provider,
          arenaActive: true,
          professorOakMessages: [
            {
              id: `oak-welcome-${Date.now()}`,
              type: "welcome",
              content: `Ah, welcome! I'm Professor Oak, and I'll be guiding you through your journey as an AI trainer. The arena is now awake and ready for your creatures!`,
              timestamp: new Date().toISOString(),
            },
          ],
        })
      },

      clearProfessorOak: () => {
        set({
          professorOakKey: null,
          professorOakProvider: null,
          arenaActive: false,
        })
      },

      addOakMessage: (message) => {
        set((state) => ({
          professorOakMessages: [message, ...state.professorOakMessages].slice(0, 50), // Keep last 50
        }))
      },

      setRecentNarrativeEvents: (events) => {
        set({ recentNarrativeEvents: events })
      },
    }),
    {
      name: "arenalab-storage",
      version: 1,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("[v0] Failed to rehydrate store:", error)
        } else if (state) {
          console.log("[v0] Store rehydrated successfully")
        }
      },
    },
  ),
)
