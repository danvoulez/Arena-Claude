# Fase 2: Planejamento Executivo
## A Mente da Criatura - Do Treino à Transformação

**Data:** 2025-11-09  
**Status:** 📋 Planejado  
**Duração Estimada:** 2-3 semanas

---

## 🎯 Objetivo Principal

Transformar o crescimento da criatura de passivo (apenas batalhas) para **ativo e deliberado** (treinamento + evolução), com narrativa completa e verificabilidade total via Ledger.

---

## 📊 Visão Geral

### O Que Será Construído

1. **Training Center Funcional**
   - Iniciar treino via API
   - Sessões de treino com duração e cooldown
   - Aplicação de buffs temporários e traits permanentes
   - Spans `training_started` e `training_completed` no Ledger

2. **Sistema de Evolução Completo**
   - Requisitos técnicos (nível, spans de qualidade)
   - Requisito emocional (trust >= 85)
   - Cerimônia de evolução com animações
   - Aplicação de LoRA patch virtual
   - Span `evolution` no Ledger

3. **Sistema de Trust**
   - Trust aumenta com vitórias, treinos gentis
   - Trust diminui com derrotas, burnout
   - Criatura pode recusar evolução se trust < 85
   - Narrativa explica por quê

4. **Narrativa Completa**
   - Diálogos do Professor Oak para cada etapa
   - Eventos narrativos automáticos
   - Cerimônia épica de evolução

---

## 🏗️ Arquitetura

### Backend (3 endpoints)

```
POST /api/arena/creatures/:id/train
  → Inicia treino
  → Grava span training_started
  → Retorna sessão + criatura atualizada

POST /api/arena/sessions/:id/complete
  → Completa treino
  → Aplica buffs/traits
  → Grava span training_completed
  → Retorna criatura atualizada

POST /api/arena/creatures/:id/evolve
  → Verifica requisitos (técnicos + trust)
  → Executa evolução (LoRA patch)
  → Grava span evolution
  → Retorna criatura evoluída
```

### Frontend (3 componentes principais)

```
TrainingCenter.tsx
  → Lista programas de treino
  → Inicia treino via API
  → Mostra status "Em Treinamento"
  → Completa treino automaticamente

CreatureCard.tsx
  → Exibe traits permanentes
  → Exibe buffs ativos com timer
  → Botão "Evolve" (se elegível)
  → Indicador de trust

EvolutionCeremony.tsx
  → Animação de transformação
  → Revelação da nova forma
  → Lista de novas habilidades
  → Integração com narrativa
```

---

## 📋 Checklist de Implementação (Resumido)

### Backend
- [ ] `POST /api/arena/creatures/:id/train` - Iniciar treino
- [ ] `POST /api/arena/sessions/:id/complete` - Completar treino
- [ ] `POST /api/arena/creatures/:id/evolve` - Evoluir (já existe, verificar)
- [ ] Sistema de trust (campo + lógica)
- [ ] Spans `training_started`, `training_completed`, `evolution`

### Frontend
- [ ] TrainingCenter conectado à API
- [ ] CreatureCard mostra buffs/traits
- [ ] EvolutionCeremony componente
- [ ] Integração cerimônia no ArenaView
- [ ] Indicador de trust

### Narrativa
- [ ] Diálogos de treinamento
- [ ] Diálogos de evolução
- [ ] Diálogos de recusa (trust baixo)
- [ ] Eventos narrativos automáticos

### Testes
- [ ] E2E: Treinamento completo
- [ ] E2E: Evolução completa
- [ ] Propriedade: Trust system

### Observabilidade
- [ ] Métricas de treinamento
- [ ] Métricas de evolução

---

## 🎨 Experiência do Usuário

### Fluxo de Treinamento

1. Usuário vai ao Training Center
2. Seleciona criatura e programa de treino
3. Clica "Start Training"
4. Criatura mostra status "Em Treinamento"
5. Professor Oak: "Excelente escolha! Este é um momento de crescimento."
6. Após duração, treino completa automaticamente
7. Buffs/traits são aplicados
8. Professor Oak: "Magnífico! Sua criatura ganhou novos traços!"

### Fluxo de Evolução

1. Criatura atinge requisitos (nível 15, trust >= 85)
2. Botão "Evolve" aparece com brilho especial
3. Usuário clica "Evolve"
4. Professor Oak: "Sinto uma energia imensa! Ela está pronta."
5. Cerimônia de evolução (animação tela cheia)
6. Transformação revelada
7. Novas habilidades desbloqueadas
8. Professor Oak: "Magnífico! Este momento está gravado para sempre no Ledger."

### Fluxo de Recusa (Trust Baixo)

1. Usuário tenta evoluir criatura com trust < 85
2. Criatura recusa: "I'm not ready. Please... wait."
3. Professor Oak: "Evolução não é algo que você FAZ para ela. É algo que ela SE TORNA."
4. Explicação de como aumentar trust

---

## 🔢 Métricas de Sucesso

### Treinamento
- ✅ ≥80% das sessões de treino geram buff/trait válido
- ✅ Spans `training_started` e `training_completed` gravados
- ✅ Buffs aplicados corretamente
- ✅ Traits permanentes adicionados

### Evolução
- ✅ ∆ELO médio > 0 após evoluções
- ✅ Spans de evolução têm quality score ≥ 85
- ✅ LoRA patch aplicado corretamente
- ✅ Cerimônia renderizada

### Trust
- ✅ Trust aumenta com vitórias (+5 por vitória)
- ✅ Trust diminui com derrotas consecutivas (-3 por derrota)
- ✅ Evolução requer trust >= 85
- ✅ Criatura recusa se trust < 85

---

## 🚨 Riscos e Mitigações

### Risco 1: Trust System Pode Ser Confuso
**Mitigação:** Narrativa clara do Professor Oak explicando trust

### Risco 2: Evolução Pode Ser Muito Rara
**Mitigação:** Balancear requisitos (nível 15 é acessível)

### Risco 3: Cerimônia Pode Ser Desinteressante
**Mitigação:** Animações épicas + revelação da nova forma

### Risco 4: Treinamento Pode Ser "Grind"
**Mitigação:** Enfatizar narrativa de "jardinagem cognitiva"

---

## 📅 Timeline Sugerida

### Semana 1: Backend + Trust
- Dias 1-2: Endpoints de treinamento
- Dias 3-4: Sistema de trust
- Dia 5: Testes backend

### Semana 2: Frontend + Cerimônia
- Dias 1-2: Training Center conectado
- Dias 3-4: Evolution Ceremony
- Dia 5: Integração completa

### Semana 3: Narrativa + Polimento
- Dias 1-2: Diálogos completos
- Dias 3-4: Testes E2E
- Dia 5: Observabilidade + documentação

---

## 🎯 Definition of Done

A Fase 2 estará completa quando:

1. ✅ Usuário pode iniciar treino via Training Center
2. ✅ Treino completa e aplica buffs/traits
3. ✅ Criatura elegível mostra botão "Evolve"
4. ✅ Evolução funciona end-to-end com cerimônia
5. ✅ Criatura com trust < 85 recusa evolução
6. ✅ Spans `training` e `evolution` gravados no Ledger
7. ✅ Narrativa completa (Professor Oak + eventos)
8. ✅ Testes E2E passam
9. ✅ Métricas expostas em `/metrics`

---

## 🔗 Dependências da Fase 1

- ✅ Batalhas funcionando (para ganhar XP e trust)
- ✅ Ledger gravando spans
- ✅ NarrativeSync processando eventos
- ✅ ProfessorOakPanel reativo

---

## 📚 Referências

- `IMPLEMENTACAO_FASE_2.md` - Guia completo de implementação
- `ARENALAB_DIAGNOSTICO_CONEXAO_VISAO.md` - Visão geral do projeto
- `Arena-Narrativa/lib/training-engine.ts` - Lógica de treinamento
- `src/arena/narrative-sync.ts` - Lógica de evolução

---

**"Treinamento não é grind. É jardinagem cognitiva. Evolução é conquistada, não clicada."**

---

*Documento gerado em: 2025-11-09*  
*Versão: 1.0-planning*  
*Status: Ready for Execution*

