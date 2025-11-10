/**
 * TF-IDF Embedding: Embeddings determinísticos baseados em TF-IDF
 * 
 * Sem ML, sem gradientes, puramente determinístico.
 * Usado para criar vetores de busca para Trajectory Matching.
 */

/**
 * Calcula TF (Term Frequency) de um termo em um documento
 */
function termFrequency(term: string, document: string): number {
  const words = document.toLowerCase().split(/\s+/)
  const termLower = term.toLowerCase()
  const count = words.filter(w => w === termLower).length
  return count / words.length
}

/**
 * Calcula IDF (Inverse Document Frequency) de um termo no corpus
 */
function inverseDocumentFrequency(term: string, corpus: string[]): number {
  const termLower = term.toLowerCase()
  const documentsContainingTerm = corpus.filter(doc => 
    doc.toLowerCase().includes(termLower)
  ).length
  
  if (documentsContainingTerm === 0) return 0
  
  return Math.log(corpus.length / documentsContainingTerm)
}

/**
 * Extrai termos únicos de um texto
 */
function extractTerms(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/)
  return [...new Set(words)].filter(w => w.length > 0)
}

/**
 * Cria embedding TF-IDF para um texto dado um corpus
 * 
 * @param text Texto para embedar
 * @param corpus Corpus de documentos para calcular IDF
 * @returns Vetor de embeddings (array de números)
 */
export function embed(text: string, corpus: string[]): number[] {
  const terms = extractTerms(text)
  const allTerms = new Set<string>()
  
  // Coleta todos os termos únicos do corpus
  corpus.forEach(doc => {
    extractTerms(doc).forEach(term => allTerms.add(term))
  })
  
  // Cria vetor de embeddings
  const embedding: number[] = []
  const sortedTerms = Array.from(allTerms).sort()
  
  sortedTerms.forEach(term => {
    const tf = termFrequency(term, text)
    const idf = inverseDocumentFrequency(term, corpus)
    const tfidf = tf * idf
    embedding.push(tfidf)
  })
  
  return embedding
}

/**
 * Normaliza um vetor de embeddings (L2 normalization)
 */
export function normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(
    vector.reduce((sum, val) => sum + val * val, 0)
  )
  
  if (magnitude === 0) return vector
  
  return vector.map(val => val / magnitude)
}

