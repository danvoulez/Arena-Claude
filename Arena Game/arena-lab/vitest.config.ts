import { defineConfig } from 'vitest/config'

/**
 * Configuração do Vitest para testes automáticos
 * 
 * Como funciona:
 * 1. Vitest roda testes em paralelo
 * 2. Detecta arquivos *.test.ts e *.spec.ts
 * 3. Gera coverage reports
 * 4. Funciona com TypeScript nativamente
 */
export default defineConfig({
  test: {
    // Ambiente de teste (node para backend, jsdom para frontend)
    environment: 'node',
    
    // Habilitar globals (describe, it, expect sem import)
    globals: true,
    
    // Arquivos de teste
    include: [
      '**/*.{test,spec}.{ts,tsx}',
      '**/__tests__/**/*.{ts,tsx}'
    ],
    
    // Excluir
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage'
    ],
    
    // Coverage (relatório de cobertura de código)
    coverage: {
      provider: 'v8', // ou 'istanbul'
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/__tests__/**'
      ]
    },
    
    // Timeout para cada teste (30 segundos)
    testTimeout: 30000,
    
    // Configurações de relatório
    reporters: ['verbose'],
    
    // Rodar testes em paralelo
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
  }
})

