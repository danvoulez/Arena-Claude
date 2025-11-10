/**
 * HNSW (Hierarchical Navigable Small World) Index
 * 
 * Busca vetorial ultrarrápida para encontrar spans similares
 * Complexidade: O(log N) - escala para milhões de spans
 * 
 * Baseado em: docs/02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md
 */

export interface HNSWNode {
  id: string
  vector: number[]
  level: number
  neighbors: HNSWNode[][]  // Vizinhos por camada
}

export interface SearchResult {
  id: string
  distance: number
  similarity: number  // 1 - distance (para cosine similarity)
}

export interface HNSWOptions {
  M?: number              // Max connections per node (default: 16)
  efConstruction?: number // Construction quality (default: 200)
  efSearch?: number      // Search quality (default: 50)
}

export class HNSWIndex {
  private layers: HNSWNode[][] = []
  private entryPoint: HNSWNode | null = null
  private nodes: Map<string, HNSWNode> = new Map()
  private M: number
  private efConstruction: number
  private efSearch: number

  constructor(options: HNSWOptions = {}) {
    this.M = options.M || 16
    this.efConstruction = options.efConstruction || 200
    this.efSearch = options.efSearch || 50
  }

  /**
   * Inserir novo span no índice
   */
  async insert(id: string, vector: number[]): Promise<void> {
    // 1. Determinar nível do node (exponential decay)
    const level = this.selectLevel()
    
    // 2. Criar node
    const node: HNSWNode = {
      id,
      vector,
      level,
      neighbors: Array(level + 1).fill(null).map(() => [])
    }
    
    this.nodes.set(id, node)
    
    // 3. Garantir que temos camadas suficientes
    while (this.layers.length <= level) {
      this.layers.push([])
    }
    this.layers[level].push(node)
    
    // 4. Se é o primeiro, vira entry point
    if (!this.entryPoint) {
      this.entryPoint = node
      return
    }
    
    // 5. Procurar vizinhos mais próximos em cada camada (de cima para baixo)
    let currentNearest = [this.entryPoint]
    
    // Buscar do nível mais alto até o nível do novo node
    const maxLevel = Math.min(level, this.entryPoint.level)
    for (let lc = maxLevel; lc >= 0; lc--) {
      currentNearest = this.searchLayer(
        vector,
        currentNearest,
        lc,
        this.efConstruction
      )
    }
    
    // 6. Conectar bidirecionalmente em cada camada
    for (let lc = 0; lc <= level; lc++) {
      const candidates = this.searchLayer(
        vector,
        lc === 0 ? currentNearest : [this.entryPoint],
        lc,
        this.efConstruction
      )
      
      const M = lc === 0 ? this.M * 2 : this.M
      const selected = candidates.slice(0, M)
      
      for (const neighbor of selected) {
        // Conectar bidirecionalmente
        node.neighbors[lc].push(neighbor)
        neighbor.neighbors[lc].push(node)
        
        // Podar se necessário (manter só M melhores)
        if (neighbor.neighbors[lc].length > M) {
          neighbor.neighbors[lc] = this.pruneConnections(
            neighbor,
            lc,
            M
          )
        }
      }
    }
    
    // 7. Atualizar entry point se necessário
    if (level > this.entryPoint.level) {
      this.entryPoint = node
    }
  }

  /**
   * Buscar K vizinhos mais próximos
   */
  async search(
    query: number[],
    k: number = 10
  ): Promise<SearchResult[]> {
    if (!this.entryPoint) {
      return []
    }
    
    // 1. Buscar entry point na camada mais alta
    let currentNearest = [this.entryPoint]
    
    // 2. Descer pelas camadas (de cima para baixo)
    for (let lc = this.entryPoint.level; lc > 0; lc--) {
      currentNearest = this.searchLayer(
        query,
        currentNearest,
        lc,
        this.efSearch
      )
    }
    
    // 3. Buscar na camada 0 (mais detalhada)
    currentNearest = this.searchLayer(
      query,
      currentNearest,
      0,
      Math.max(this.efSearch, k)
    )
    
    // 4. Retornar top K
    return currentNearest
      .slice(0, k)
      .map(node => ({
        id: node.id,
        distance: this.distance(query, node.vector),
        similarity: 1 - this.distance(query, node.vector)
      }))
      .sort((a, b) => a.distance - b.distance)
  }

  /**
   * Buscar em uma camada específica
   */
  private searchLayer(
    query: number[],
    entryPoints: HNSWNode[],
    layer: number,
    ef: number
  ): HNSWNode[] {
    const candidates = new Set<HNSWNode>(entryPoints)
    const visited = new Set<string>()
    const distances = new Map<HNSWNode, number>()
    
    // Inicializar distâncias
    entryPoints.forEach(node => {
      distances.set(node, this.distance(query, node.vector))
      visited.add(node.id)
    })
    
    // Manter lista ordenada por distância
    const sortedCandidates = Array.from(candidates).sort(
      (a, b) => (distances.get(a) || Infinity) - (distances.get(b) || Infinity)
    )
    
    let bestDistance = sortedCandidates[0] 
      ? (distances.get(sortedCandidates[0]) || Infinity)
      : Infinity
    
    // Buscar explorando vizinhos
    while (sortedCandidates.length > 0) {
      const current = sortedCandidates.shift()!
      const currentDist = distances.get(current) || Infinity
      
      // Se não melhorar, parar
      if (currentDist > bestDistance) {
        break
      }
      
      // Explorar vizinhos
      if (current.neighbors[layer]) {
        for (const neighbor of current.neighbors[layer]) {
          if (visited.has(neighbor.id)) continue
          
          visited.add(neighbor.id)
          const neighborDist = this.distance(query, neighbor.vector)
          distances.set(neighbor, neighborDist)
          
          if (neighborDist < bestDistance || candidates.size < ef) {
            candidates.add(neighbor)
            sortedCandidates.push(neighbor)
            sortedCandidates.sort(
              (a, b) => (distances.get(a) || Infinity) - (distances.get(b) || Infinity)
            )
            
            if (neighborDist < bestDistance) {
              bestDistance = neighborDist
            }
          }
        }
      }
    }
    
    // Retornar top ef
    return Array.from(candidates)
      .sort((a, b) => (distances.get(a) || Infinity) - (distances.get(b) || Infinity))
      .slice(0, ef)
  }

  /**
   * Calcular distância entre dois vetores (cosine distance)
   */
  private distance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length')
    }
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
    if (magnitude === 0) return 1
    
    const cosineSimilarity = dotProduct / magnitude
    return 1 - cosineSimilarity  // Converter para distância (0 = idêntico, 1 = oposto)
  }

  /**
   * Selecionar nível aleatório (exponential decay)
   */
  private selectLevel(): number {
    const mL = 1.0 / Math.log(2.0)
    return Math.floor(-Math.log(Math.random()) * mL)
  }

  /**
   * Podar conexões (manter só M melhores)
   */
  private pruneConnections(
    node: HNSWNode,
    layer: number,
    M: number
  ): HNSWNode[] {
    return node.neighbors[layer]
      .sort((a, b) => 
        this.distance(node.vector, a.vector) - 
        this.distance(node.vector, b.vector)
      )
      .slice(0, M)
  }

  /**
   * Obter node por ID
   */
  getNode(id: string): HNSWNode | undefined {
    return this.nodes.get(id)
  }

  /**
   * Obter tamanho do índice
   */
  size(): number {
    return this.nodes.size
  }

  /**
   * Limpar índice
   */
  clear(): void {
    this.nodes.clear()
    this.layers = []
    this.entryPoint = null
  }
}

