/**
 * Processador de arquivos .md para criar Diamond Spans
 *
 * Extrai conversas de exports de ChatGPT/Claude e cria spans
 * com Quality Meter 5D no ledger
 */

export interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface ProcessedConversation {
  turns: ConversationTurn[]
  metadata: {
    source: 'chatgpt' | 'claude' | 'unknown'
    filename: string
    processedAt: string
  }
}

export interface DiamondSpan {
  context: string
  response: string
  quality: QualityScore
  metadata: {
    source: string
    extractedFrom: string
    timestamp: string
  }
}

export interface QualityScore {
  completeness: number
  provenance: number
  impact: number
  uniqueness: number
  coherence: number
  overall: number
}

/**
 * Processa arquivo .md e extrai conversas
 */
export async function processMDFile(file: File): Promise<ProcessedConversation> {
  const content = await file.text()

  // Detectar formato (ChatGPT vs Claude)
  const source = detectSource(content)

  // Extrair conversas baseado no formato
  const turns = source === 'chatgpt'
    ? extractChatGPTConversation(content)
    : source === 'claude'
    ? extractClaudeConversation(content)
    : extractGenericConversation(content)

  return {
    turns,
    metadata: {
      source,
      filename: file.name,
      processedAt: new Date().toISOString()
    }
  }
}

/**
 * Detecta fonte do .md
 */
function detectSource(content: string): 'chatgpt' | 'claude' | 'unknown' {
  // ChatGPT exports geralmente têm "**You:**" e "**ChatGPT:**"
  if (content.includes('**You:**') || content.includes('**ChatGPT:**')) {
    return 'chatgpt'
  }

  // Claude exports geralmente têm "## Human:" e "## Assistant:"
  if (content.includes('## Human:') || content.includes('## Assistant:')) {
    return 'claude'
  }

  return 'unknown'
}

/**
 * Extrai conversa de export do ChatGPT
 */
function extractChatGPTConversation(content: string): ConversationTurn[] {
  const turns: ConversationTurn[] = []

  // Split por linhas
  const lines = content.split('\n')
  let currentTurn: ConversationTurn | null = null

  for (const line of lines) {
    // User message
    if (line.startsWith('**You:**')) {
      if (currentTurn) turns.push(currentTurn)
      currentTurn = {
        role: 'user',
        content: line.replace('**You:**', '').trim()
      }
    }
    // Assistant message
    else if (line.startsWith('**ChatGPT:**')) {
      if (currentTurn) turns.push(currentTurn)
      currentTurn = {
        role: 'assistant',
        content: line.replace('**ChatGPT:**', '').trim()
      }
    }
    // Continuation
    else if (currentTurn && line.trim()) {
      currentTurn.content += '\n' + line
    }
  }

  if (currentTurn) turns.push(currentTurn)

  return turns
}

/**
 * Extrai conversa de export do Claude
 */
function extractClaudeConversation(content: string): ConversationTurn[] {
  const turns: ConversationTurn[] = []

  // Split por seções "## Human:" e "## Assistant:"
  const sections = content.split(/## (Human|Assistant):/g)

  for (let i = 1; i < sections.length; i += 2) {
    const role = sections[i].toLowerCase() as 'user' | 'assistant'
    const content = sections[i + 1]?.trim() || ''

    if (content) {
      turns.push({
        role: role === 'human' ? 'user' : 'assistant',
        content
      })
    }
  }

  return turns
}

/**
 * Extrai conversa de formato genérico
 */
function extractGenericConversation(content: string): ConversationTurn[] {
  const turns: ConversationTurn[] = []

  // Tenta extrair baseado em padrões comuns
  const lines = content.split('\n')
  let currentTurn: ConversationTurn | null = null

  for (const line of lines) {
    // Possíveis indicadores de user
    if (line.match(/^(User|Human|You|Q):/i)) {
      if (currentTurn) turns.push(currentTurn)
      currentTurn = {
        role: 'user',
        content: line.replace(/^(User|Human|You|Q):/i, '').trim()
      }
    }
    // Possíveis indicadores de assistant
    else if (line.match(/^(Assistant|AI|Bot|A):/i)) {
      if (currentTurn) turns.push(currentTurn)
      currentTurn = {
        role: 'assistant',
        content: line.replace(/^(Assistant|AI|Bot|A):/i, '').trim()
      }
    }
    // Continuation
    else if (currentTurn && line.trim()) {
      currentTurn.content += '\n' + line
    }
  }

  if (currentTurn) turns.push(currentTurn)

  return turns
}

/**
 * Cria Diamond Spans a partir de conversas
 *
 * Pega pares user/assistant e avalia qualidade
 */
export function createDiamondSpans(
  conversation: ProcessedConversation,
  qualityThreshold: number = 80
): DiamondSpan[] {
  const spans: DiamondSpan[] = []

  // Pega pares user/assistant
  for (let i = 0; i < conversation.turns.length - 1; i++) {
    const userTurn = conversation.turns[i]
    const assistantTurn = conversation.turns[i + 1]

    if (userTurn.role === 'user' && assistantTurn.role === 'assistant') {
      // Calcula qualidade
      const quality = calculateQuality(userTurn.content, assistantTurn.content)

      // Apenas Diamond Spans (>= threshold)
      if (quality.overall >= qualityThreshold) {
        spans.push({
          context: userTurn.content,
          response: assistantTurn.content,
          quality,
          metadata: {
            source: conversation.metadata.source,
            extractedFrom: conversation.metadata.filename,
            timestamp: conversation.metadata.processedAt
          }
        })
      }
    }
  }

  return spans
}

/**
 * Calcula Quality Meter 5D
 *
 * Por enquanto, implementação simplificada
 * TODO: Implementar avaliação real com LLM ou heurísticas avançadas
 */
function calculateQuality(context: string, response: string): QualityScore {
  // Heurísticas simples (placeholder para implementação real)

  // Completeness: baseado no tamanho da resposta vs contexto
  const completeness = Math.min(100, (response.length / context.length) * 50)

  // Provenance: assume fonte confiável (exports de Claude/GPT)
  const provenance = 85

  // Impact: baseado no tamanho e estrutura da resposta
  const hasCodeBlocks = response.includes('```')
  const hasLists = response.match(/^[-*]\s/m)
  const impact = 60 + (hasCodeBlocks ? 20 : 0) + (hasLists ? 10 : 0)

  // Uniqueness: baseado em variabilidade de palavras
  const words = response.split(/\s+/)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()))
  const uniqueness = Math.min(100, (uniqueWords.size / words.length) * 150)

  // Coherence: baseado em pontuação e estrutura
  const sentences = response.split(/[.!?]+/)
  const avgSentenceLength = response.length / sentences.length
  const coherence = Math.min(100, 50 + (avgSentenceLength > 20 ? 30 : 0))

  // Score total ponderado
  const overall = (
    completeness * 0.25 +
    provenance * 0.20 +
    impact * 0.20 +
    uniqueness * 0.15 +
    coherence * 0.20
  )

  return {
    completeness: Math.round(completeness),
    provenance: Math.round(provenance),
    impact: Math.round(impact),
    uniqueness: Math.round(uniqueness),
    coherence: Math.round(coherence),
    overall: Math.round(overall)
  }
}

/**
 * Processa múltiplos arquivos em batch
 */
export async function processMDFiles(
  files: File[],
  onProgress?: (current: number, total: number, filename: string) => void
): Promise<DiamondSpan[]> {
  const allSpans: DiamondSpan[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    if (onProgress) {
      onProgress(i + 1, files.length, file.name)
    }

    try {
      const conversation = await processMDFile(file)
      const spans = createDiamondSpans(conversation)
      allSpans.push(...spans)
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error)
    }
  }

  return allSpans
}
