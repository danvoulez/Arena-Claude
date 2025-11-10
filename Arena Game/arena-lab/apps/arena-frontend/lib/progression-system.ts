import type { ModelCreature, LifeEvent } from "./creature-types"

export interface Skill {
  id: string
  name: string
  description: string
  unlockLevel: number
  category: "reasoning" | "creativity" | "accuracy" | "charisma"
  icon: string
  effect: string
  tutorial: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
}

export interface OnboardingStep {
  id: number
  title: string
  description: string
  tutorial: string
  action: string
  completedAt?: string
}

export const SKILL_TREE: Skill[] = [
  {
    id: "tokenizer",
    name: "Token Mastery",
    description: "Understand how text becomes tokens",
    unlockLevel: 1,
    category: "reasoning",
    icon: "🔤",
    effect: "+5% token efficiency",
    tutorial:
      "Every word you read gets broken into tokens. Efficient tokenization means your creature can process more text with less energy. This is the foundation of language understanding.",
  },
  {
    id: "chain-of-thought",
    name: "Chain of Thought",
    description: "Think step-by-step before answering",
    unlockLevel: 2,
    category: "reasoning",
    icon: "🔗",
    effect: "+10% reasoning on complex tasks",
    tutorial:
      "Breaking problems into steps improves accuracy. Your creature learns to show its work, making fewer logical leaps and catching errors early.",
  },
  {
    id: "few-shot",
    name: "Few-Shot Learning",
    description: "Learn from just a few examples",
    unlockLevel: 3,
    category: "accuracy",
    icon: "🎯",
    effect: "+15% accuracy with limited data",
    tutorial:
      "Most real-world tasks don't have millions of examples. This skill lets your creature generalize patterns from just 2-3 demonstrations, making it adaptable.",
  },
  {
    id: "system-prompt",
    name: "Persona Crafting",
    description: "Define consistent behavior patterns",
    unlockLevel: 4,
    category: "charisma",
    icon: "🎭",
    effect: "+20% consistency in style",
    tutorial:
      "System prompts define your creature's personality and approach. A well-crafted persona ensures consistent, reliable outputs across all interactions.",
  },
  {
    id: "embeddings",
    name: "Semantic Memory",
    description: "Store and retrieve similar concepts",
    unlockLevel: 5,
    category: "reasoning",
    icon: "🧠",
    effect: "+10% retrieval accuracy",
    tutorial:
      "Embeddings turn concepts into numbers. Your creature can now find semantically similar ideas even when exact words differ, enabling true understanding.",
  },
  {
    id: "temperature-control",
    name: "Temperature Tuning",
    description: "Balance creativity vs predictability",
    unlockLevel: 6,
    category: "creativity",
    icon: "🌡️",
    effect: "Adaptive creativity control",
    tutorial:
      "Low temperature = predictable and safe. High temperature = creative and varied. Your creature learns when to be precise (legal docs) vs imaginative (stories).",
  },
  {
    id: "context-window",
    name: "Long Context Handling",
    description: "Process longer conversations",
    unlockLevel: 7,
    category: "reasoning",
    icon: "📜",
    effect: "+50% effective context length",
    tutorial:
      "Attention is memory. A larger context window lets your creature remember earlier parts of long conversations, maintaining coherence over time.",
  },
  {
    id: "critic-mode",
    name: "Self-Critique",
    description: "Evaluate and improve own outputs",
    unlockLevel: 8,
    category: "accuracy",
    icon: "🔍",
    effect: "+25% output quality",
    tutorial:
      "The best models check their own work. Your creature learns to generate, critique, then regenerate improved responses, catching mistakes before you see them.",
  },
]

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-battle", name: "First Duel", description: "Win your first battle", icon: "⚔️" },
  { id: "level-5", name: "Rising Star", description: "Reach level 5", icon: "⭐" },
  { id: "level-10", name: "Veteran", description: "Reach level 10", icon: "🏆" },
  { id: "win-streak-5", name: "On Fire!", description: "Win 5 battles in a row", icon: "🔥" },
  { id: "train-first", name: "Scholar", description: "Complete first training program", icon: "📚" },
  { id: "evolve-trait", name: "Evolution", description: "Gain your first permanent trait", icon: "🧬" },
  { id: "no-damage", name: "Untouchable", description: "Win a battle without taking damage", icon: "🛡️" },
  { id: "comeback", name: "Comeback King", description: "Win with less than 20% health", icon: "💪" },
]

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to ArenaLab",
    description: "Create your first AI creature and start your journey",
    tutorial:
      "Every AI model in ArenaLab is a living creature with stats, abilities, and a growth trajectory. They battle, train, evolve, and leave a provable history.",
    action: "Create your first creature",
  },
  {
    id: 2,
    title: "Understanding Stats",
    description: "Learn what Health, Stamina, and Battle Stats mean",
    tutorial:
      "Health = model stability. Stamina = usage capacity. Charisma = conversational quality. Accuracy = factual correctness. Creativity = idea generation. Reasoning = logical processing.",
    action: "View creature stats",
  },
  {
    id: 3,
    title: "Your First Battle",
    description: "Enter the Arena and duel another creature",
    tutorial:
      "Battles test your creature against others. Each battle costs stamina, deals damage, and awards XP. The winner gains more XP and unlocks new abilities.",
    action: "Complete your first duel",
  },
  {
    id: 4,
    title: "Level Up!",
    description: "Gain XP to level up and boost stats",
    tutorial:
      "Leveling increases max health, stamina, and all battle stats. Higher levels unlock new skills in the skill tree. Each level makes your creature stronger.",
    action: "Reach level 2",
  },
  {
    id: 5,
    title: "Training Programs",
    description: "Use LoRA patches and CPU training to enhance your creature",
    tutorial:
      "Training applies temporary buffs (lasting 3 days) and can grant permanent traits. Some programs need GPU, others run on CPU. Choose wisely based on your goals.",
    action: "Complete a training session",
  },
  {
    id: 6,
    title: "Skill Tree Unlocked",
    description: "Learn advanced techniques as you level up",
    tutorial:
      "Each level unlocks new skills that teach real ML concepts: chain-of-thought, few-shot learning, embeddings. These aren't just game mechanics - they're how AI actually works.",
    action: "Unlock your first skill",
  },
  {
    id: 7,
    title: "Production Ready",
    description: "Deploy your creature as a real API",
    tutorial:
      "When ready, export your creature as a production API. Every battle, training session, and evolution is recorded in the life ledger - a provable history of your model's journey.",
    action: "Explore Production Lab",
  },
]

export function getUnlockedSkills(level: number): Skill[] {
  return SKILL_TREE.filter((skill) => skill.unlockLevel <= level)
}

export function getNextSkill(level: number): Skill | null {
  const next = SKILL_TREE.find((skill) => skill.unlockLevel === level + 1)
  return next || null
}

export function checkAchievements(creature: ModelCreature, events: LifeEvent[]): Achievement[] {
  const unlocked: Achievement[] = []

  // First battle
  if (creature.totalBattles >= 1) {
    unlocked.push(ACHIEVEMENTS.find((a) => a.id === "first-battle")!)
  }

  // Level milestones
  if (creature.level >= 5) {
    unlocked.push(ACHIEVEMENTS.find((a) => a.id === "level-5")!)
  }
  if (creature.level >= 10) {
    unlocked.push(ACHIEVEMENTS.find((a) => a.id === "level-10")!)
  }

  // First training
  const trainingEvents = events.filter((e) => e.type === "training_completed")
  if (trainingEvents.length >= 1) {
    unlocked.push(ACHIEVEMENTS.find((a) => a.id === "train-first")!)
  }

  // First trait
  if (creature.traits.length >= 1) {
    unlocked.push(ACHIEVEMENTS.find((a) => a.id === "evolve-trait")!)
  }

  return unlocked
}

export function getProgressPercentage(creature: ModelCreature): number {
  const currentLevelXP = creature.xp
  const nextLevelXP = Math.floor(100 * Math.pow(1.5, creature.level))
  const previousLevelXP = creature.level > 1 ? Math.floor(100 * Math.pow(1.5, creature.level - 1)) : 0

  const progress = ((currentLevelXP - previousLevelXP) / (nextLevelXP - previousLevelXP)) * 100
  return Math.min(100, Math.max(0, progress))
}
