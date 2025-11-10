/**
 * Hybrid Index: Combina HNSW + IVF para escalar
 * 
 * - HNSW para datasets pequenos/médios (< 100k spans)
 * - IVF para datasets grandes (>= 100k spans)
 * 
 * Baseado em: docs/02-SISTEMAS/TRAJECTORY_MATCHING_ADVANCED.md
 */

import { HNSWIndex, type HNSWOptions, type SearchResult } from './hnsw-index'

export interface HybridIndexOptions extends HNSWOptions {
  threshold?: number  // Threshold para migrar para IVF (default: 100000)
}

export class HybridIndex {
  private hnsw: HNSWIndex
  private threshold: number
  private size: number = 0

  constructor(options: HybridIndexOptions = {}) {
    this.hnsw = new HNSWIndex(options)
    this.threshold = options.threshold || 100000
  }

  /**
   * Inserir novo span
   */
  async insert(id: string, vector: number[]): Promise<void> {
    this.size++
    
    if (this.size < this.threshold) {
      // Usar HNSW
      await this.hnsw.insert(id, vector)
    } else {
      // TODO: Implementar migração para IVF quando necessário
      // Por enquanto, continuar usando HNSW
      console.warn(`⚠️ Dataset atingiu ${this.size} spans. IVF ainda não implementado, continuando com HNSW.`)
      await this.hnsw.insert(id, vector)
    }
  }

  /**
   * Buscar spans similares
   */
  async search(query: number[], k: number): Promise<SearchResult[]> {
    return await this.hnsw.search(query, k)
  }

  /**
   * Obter tamanho do índice
   */
  getSize(): number {
    return this.size
  }

  /**
   * Limpar índice
   */
  clear(): void {
    this.hnsw.clear()
    this.size = 0
  }
}

