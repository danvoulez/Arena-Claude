/**
 * Search Module - Exporta API pública para busca de spans similares
 */

export { embed, normalize } from './tfidf-embedding'
export { HNSWIndex, type HNSWNode, type SearchResult, type HNSWOptions } from './hnsw-index'
export { HybridIndex, type HybridIndexOptions } from './hybrid-index'

