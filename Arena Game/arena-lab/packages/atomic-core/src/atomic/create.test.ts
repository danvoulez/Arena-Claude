import { describe, it, expect } from 'vitest'
import { createSpan } from './create'

/**
 * Exemplo de teste automático
 * 
 * Este arquivo demonstra como criar testes que rodam automaticamente
 * quando você faz git push.
 * 
 * Para rodar localmente:
 *   pnpm test
 * 
 * Para rodar em watch mode (atualiza quando você salva):
 *   pnpm test:watch
 */

describe('createSpan', () => {
  it('should create a span with required fields', () => {
    const span = createSpan({
      entity_type: 'test',
      this: 'test input',
      did: { actor: 'test-actor', action: 'test-action' }
    })

    // Verifica se span foi criado
    expect(span).toBeDefined()
    
    // Verifica campos obrigatórios
    expect(span.entity_type).toBe('test')
    expect(span.this).toBe('test input')
    expect(span.did).toEqual({ actor: 'test-actor', action: 'test-action' })
  })

  it('should generate a hash for the span', () => {
    const span = createSpan({
      entity_type: 'test',
      this: 'test',
      did: { actor: 'test', action: 'test' }
    })

    // Hash deve existir
    expect(span.hash).toBeDefined()
    expect(typeof span.hash).toBe('string')
    
    // BLAKE3 hash tem 64 caracteres (hex)
    expect(span.hash.length).toBeGreaterThan(0)
  })

  it('should create unique hashes for different inputs', () => {
    const span1 = createSpan({
      entity_type: 'test',
      this: 'input 1',
      did: { actor: 'test', action: 'test' }
    })

    const span2 = createSpan({
      entity_type: 'test',
      this: 'input 2',
      did: { actor: 'test', action: 'test' }
    })

    // Hashes devem ser diferentes
    expect(span1.hash).not.toBe(span2.hash)
  })

  it('should create same hash for same input', () => {
    const input = {
      entity_type: 'test',
      this: 'same input',
      did: { actor: 'test', action: 'test' }
    }

    const span1 = createSpan(input)
    const span2 = createSpan(input)

    // Hashes devem ser iguais (determinístico)
    expect(span1.hash).toBe(span2.hash)
  })

  it('should include timestamp', () => {
    const span = createSpan({
      entity_type: 'test',
      this: 'test',
      did: { actor: 'test', action: 'test' }
    })

    // Timestamp deve existir
    expect(span.when).toBeDefined()
    expect(span.when?.started_at).toBeDefined()
    
    // Deve ser uma string ISO válida
    const date = new Date(span.when!.started_at)
    expect(date.getTime()).not.toBeNaN()
  })
})

