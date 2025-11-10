# 🌐 Nova Arquitetura: ArenaLab 100% Browser-Native

**Status**: 📋 Proposta  
**Data**: 2025-11-10  
**Fonte**: `Sugestao-Nova-Arquitetura.md`

---

## 🎯 Visão Geral

Migração completa do ArenaLab para rodar **100% no browser**, sem Node.js, como PWA (Progressive Web App) para iPhone e outros dispositivos.

### Três Pilares

1. **Motor 100% JSON✯Atomic no Browser** (Zero Node.js)
2. **Estratégia Híbrida de Armazenamento** (Google OAuth, backup seamless, zero nuvem do admin)
3. **LLM como "Prompt-First Game Engine"** (App esqueleto com prompts)

---

## 🟢 1. Motor 100% JSON✯Atomic no Browser

### Core Principles

- **Ledger**: Append-only usando **IndexedDB** (Dexie.js/idb-keyval)
- **Crypto**: JavaScript puro (Ed25519/BLAKE3 via @noble/ed25519, @noble/hashes)
- **Sem Node.js**: Nada de `fs/promises`, nada de backend obrigatório
- **Arquitetura Off/Online**: Funciona offline, todas operações locais

### O Que Funciona 100% no Browser

- ✅ Ledger Append-Only: Spans gravados em IndexedDB
- ✅ JSON✯Atomic Hash, Assinatura, Validação: Tudo JS puro
- ✅ Engine de Trajectory Matching: HNSW, TF-IDF, busca vetorial (JS/TS puro)
- ✅ Gameplay completa: UI, lógica, narrativa, stats, animações
- ✅ EventBus/ECS/Data-driven: Arquitetura flexível

### O Que Precisa de Ajuste

- ⚪ FileSystem/Assets: Carregamento via fetch/cache
- ⚪ Persistência multi-machine: Export/import ou Sync API
- ⚪ API/leaderboard: Dependente de sync com backend (mas gameplay funciona offline)

### Limitações

- 🔴 Escalabilidade gigantesca (milhões de spans): IndexedDB tem limites (~GBs)
- 🔴 Segurança (chave privada): Precisa store seguro/external wallet ou WebCrypto
- 🔴 Integração BYOK LLM: Precisa CORS liberado ou browser plugin

### Arquitetura Sugerida

```
┌────────────────────┐
│   UI (React/Svelte/Vue) 
└────┬───────────────┘
     │
     ▼
┌────────────────────────┐
│  EventBus / ECS        │
└────┬───────────────┬───┘
     │               │
     ▼               ▼
┌──────────────┐   ┌────────────────┐
│ Ledger (IDB) │   │ Crypto (JS/Web)│
│ Json✯Atomic  │   │ - Ed25519/BLAKE3│
└────┬─────────┘   └───────────────┘
     │
     ▼
┌─────────────────────────────┐
│  Trajectory Matcher         │
│  (TF-IDF, HNSW, Busca vetorial) │
└─────────────▲───────────────┘
              │
        ┌───────────────┐
        │  DataLoader   │
        │  (YAML/JSON)  │
        └───────────────┘
```

### Implementação

#### A. Ledger Append-Only com IndexedDB (Dexie.js)

```typescript
import Dexie from "dexie";
import { hashJsonAtomic, signJsonAtomic } from './crypto'

export class ArenaLedger extends Dexie {
  public spans: Dexie.Table<any, string>;
  
  constructor() {
    super("ArenaLedger");
    this.version(1).stores({
      spans: "++id,hash,who,did,when"
    });
  }
  
  async append(span: any) {
    const canonical = canonicalizeJson(span);
    const hash = hashJsonAtomic(canonical);
    const signature = await signJsonAtomic(canonical, await getUserPrivateKey());
    return this.spans.add({ ...span, hash, signature });
  }
  
  async all() { return this.spans.toArray(); }
  async scan(filter = {}) { return this.spans.where(filter).toArray(); }
}

export const ledger = new ArenaLedger();
```

#### B. Canonicalização JSON

```typescript
function canonicalizeJson(obj: any): string {
  // Ordenação das keys para garantir determinismo
  return JSON.stringify(obj, Object.keys(obj).sort());
}
```

#### C. Hash BLAKE3 e Assinatura Ed25519

```typescript
import { blake3 } from '@noble/hashes/blake3'
import { sign, verify, getPublicKey } from '@noble/ed25519'

export function hashJsonAtomic(canonical: string): string {
  return blake3(canonical, { dkLen: 32 })
    .reduce((str, b) => str + b.toString(16).padStart(2, '0'), '');
}

export async function signJsonAtomic(canonical: string, privKey: Uint8Array): Promise<string> {
  const hash = blake3(canonical, { dkLen: 32 });
  const sig = await sign(hash, privKey);
  return Buffer.from(sig).toString("hex");
}

export async function verifyJsonAtomic(canonical: string, signature: string, pubKey: Uint8Array): Promise<boolean> {
  const hash = blake3(canonical, { dkLen: 32 });
  return verify(Buffer.from(signature, "hex"), hash, pubKey);
}
```

#### D. Geração de Chave do Usuário

```typescript
import { utils } from '@noble/ed25519';

// Geração
const privateKey = utils.randomPrivateKey();
const publicKey = await getPublicKey(privateKey);

// Salvando (criptografado com WebCrypto + opcional biometria)
// Para produção: proteger com passphrase/biometria (WebAuthn)
```

#### E. Criar e Gravar Span

```typescript
async function createBattleSpan(event) {
  // 1. Monta span
  const span = {
    id: uuidv4(),
    who: event.creatureId,
    did: "battle",
    this: {
      prompt: event.prompt,
      opponent: event.opponentId,
      result: event.result,
    },
    when: new Date().toISOString(),
    status: "completed",
    metadata: { elo: event.elo, hp: event.hp }
  };

  // 2. Canonicaliza
  const canonical = canonicalizeJson(span);

  // 3. Hash + assinatura
  const hash = hashJsonAtomic(canonical);
  const signature = await signJsonAtomic(canonical, getPrivateKey());

  // 4. Merge resultado
  const atomicSpan = { ...span, hash, signature };

  // 5. Persiste
  await ledger.append(atomicSpan);
}
```

#### F. Exportação/Importação

```typescript
import { gzipSync, gunzipSync } from "fflate";

// Exportação
async function exportLedger() {
  const allSpans = await ledger.all();
  const text = allSpans.map(span => JSON.stringify(span)).join('\n');
  const compressed = gzipSync(text);
  const blob = new Blob([compressed], { type: "application/gzip" });
  downloadBlob(blob, "arena_ledger_backup.gz");
}

// Importação
async function importLedger(file) {
  const arrayBuffer = await file.arrayBuffer();
  const text = gunzipSync(new Uint8Array(arrayBuffer), { to: "string" });
  const spans = text.split('\n').map(JSON.parse);
  
  // Validação individual
  for (const span of spans) {
    const canonical = canonicalizeJson(span);
    const valid = await verifyJsonAtomic(canonical, span.signature, getPublicKey());
    if (!valid) throw new Error("Ledger corrupt - invalid signature");
    await ledger.append(span);
  }
}
```

### Prós

- 🔒 **Segurança**: Chave privada nunca sai do device
- 🪶 **Leveza**: Zero backend obrigatório; serverless ou PWA
- 💻 **Offline**: Tudo funciona offline, Ledger local
- 🕹️ **Ultra rápido**: Trajectory Matching roda em ms
- 🔎 **Auditável**: Usuário exporta/examina todos os spans localmente

### Contras

- 🔑 Gerenciamento de chave privada é delicado para usuários leigos
- 🔌 Sync/social depende de compartilhamento manual ou sync API extra
- 🔁 Backup/Cross-device requer export/import (ou cloud opcional)
- ⚠️ Assets grandes podem depender de preload/CDN externo
- ⚡ Heavy ML (Transformer, milhões de spans) não é prático, mas trajectory matching <50k spans é viável

---

## 🟡 2. Estratégia Híbrida de Armazenamento

### Visão

- **Login via Google OAuth** (localOnly by default, sem backup obrigatório)
- **Backup automático** em `/Apps/ArenaLab/` no Google Drive do próprio usuário
- **Restauro automático ao login** (zero ação manual)
- **Opcional "paranoia mode"**: Ledger encriptado antes do upload
- **Exportação manual & import como fallback**: Sempre disponível

### Como Funciona

1. Usuário faz login Google via OAuth
2. App pede permissão SÓ para `appDataFolder` (pasta privada)
3. Ledger é compactado (gzip) e opcionalmente encriptado
4. Upload automático para Google Drive do usuário
5. Ao abrir em outro device: login → busca backup → restaura automaticamente

### Para o Admin

- ✅ **ZERO custo**: App nunca armazena, só orquestra
- ✅ **ZERO infra**: Google cuida de tudo
- ✅ **ZERO risco legal**: Dados nunca passam por servidores seus

### Implementação

#### Setup Google Cloud

1. Criar projeto no Google Cloud Console
2. Ativar "Google Drive API"
3. Criar credenciais OAuth 2.0 Web Application
4. Pegar `client_id`

#### Integração Frontend

```typescript
// Inicialização
gapi.load('client:auth2', () => {
  gapi.client.init({
    clientId: '<SEU_CLIENT_ID>',
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  });
});

// Login
async function loginWithGoogle() {
  await gapi.auth2.getAuthInstance().signIn();
}

// Backup
async function exportAndBackupLedger() {
  const spans = await ledger.all();
  const text = spans.map(s => JSON.stringify(s)).join('\n');
  const compressed = gzipSync(text);

  const metadata = {
    name: "ledger_backup.gz",
    parents: ["appDataFolder"] // Pasta privada
  };
  const file = new Blob([compressed], { type: "application/gzip" });
  
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append('file', file);

  await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token,
    },
    body: form
  });
}

// Restore
async function restoreLedgerFromDrive() {
  const resp = await gapi.client.drive.files.list({
    spaces: 'appDataFolder',
    fields: 'files(id, name, createdTime)',
    pageSize: 10,
    orderBy: 'createdTime desc'
  });
  if (resp.result.files.length === 0) return;

  const fileId = resp.result.files[0].id;
  const res = await gapi.client.drive.files.get({ fileId, alt: 'media' });
  const compressed = res.body;
  
  const ledgerText = gunzipSync(new Uint8Array(compressed), {to:'string'});
  const spans = ledgerText.split('\n').map(JSON.parse);
  for (const span of spans) {
    await ledger.append(span);
  }
}
```

#### Paranoia Mode (Criptografia Opcional)

```typescript
// Antes de subir backup
const key = await deriveKey(userPassword, salt);
const encrypted = await encryptAes(backupBytes, key);
// Envia encrypted para Drive
```

### UX

- **Primeiro acesso**: "Progresso será salvo localmente. Quer ativar backup automático via Google?" (☑️ Ativar recomendado)
- **Login**: 1 click OAuth
- **Restore**: Automático ao fazer login em outro device
- **Paranoia**: Opção de proteger backup com senha

### Vantagens

- ✅ Seamless: Login = história restaurada
- ✅ Privacidade: Zero custo seu, zero armazenamento seu
- ✅ Custo: ZERO para admin
- ✅ Segurança: appDataFolder é privado

---

## 🟠 3. LLM como "Prompt-First Game Engine"

### Visão

- App entrega só o **esqueleto/nav** e **prompts distribuídos**
- **TODO o conteúdo textual** (mensagens, diálogos, cenas, missões, tutoriais) é gerado ad-hoc por LLM usando a chave (BYOK) do usuário
- **Salva apenas** o que for crítico para gameplay/replay (ledger de spans, stats, config minimal)

### Estrutura

#### Diretório de Prompts

```
data/prompts/
├── onboarding.yaml
├── battle.yaml
├── quests.yaml
├── dna.yaml
└── tips.yaml
```

#### Hook Universal: useLLM

```typescript
export function useLLM() {
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const userKey = loadUserKeyFromStorageOrContext();

  const callLLM = async (prompt: string, params = {}) => {
    setLoading(true);
    // Endpoint usa chave do usuário armazenada local/criptografada
    const response = await fetch(BYOK_URL, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${userApiKey}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ prompt, ...params })
    }).then(r => r.json());
    setOutput(response.output);
    setLoading(false);
  };
  
  return { callLLM, output, loading };
}
```

#### Exemplo de Uso

```typescript
import { useLLM } from '../hooks/useLLM'
import prompts from '../data/prompts/onboarding.yaml'

function WelcomeScreen({userName, starters}) {
  const {output, loading, callLLM} = useLLM()
  
  useEffect(() => {
    callLLM(
      prompts.welcome
        .replace('{{username}}', userName)
        .replace('{{starters}}', starters.join(', '))
    )
  }, [userName])

  if (loading) return <Spinner/>
  return <MarkdownRenderer source={output}/>
}
```

### Exemplos de Prompts

#### Onboarding

```yaml
welcome: |
  Você é Professor Carvalho. Dê as boas-vindas a {{username}} ao ArenaLab.
  Explique em termos épicos o que é o ArenaLab e as opções iniciais.
  Formato Markdown.

choose_creature: |
  Apresente três criaturas: Lyria, Logikon, Tactile. Para cada uma explique em 2 frases suas forças, fraquezas e "alma".
  Diga ao jogador: "{{username}}", siga seu coração ou mente para escolher. Formato Markdown.
```

#### Batalha

```yaml
battle_intro: |
  Simule o início de uma batalha entre {{my_creature}} (traços: {{traits}}) e {{opponent}} (traços: {{opponent_traits}}), no cenário {{arena}}.
  Gere narração rápida, frases de efeito das criaturas e uma provocação do Professor Carvalho. Formato Markdown.

battle_turn: |
  Descreva o turno atual: {{player_action}} contra {{opponent_action}}.
  Liste o resultado em estilo narrativo e com flavour. Se possível, adicione uma dica motivacional.
```

#### Missões

```yaml
new_quest: |
  Analise o histórico da criatura {{creature}} (spans recentes: {{recent_spans}}).
  Crie uma missão personalizada que:
    - Torne o jogo mais interessante,
    - Desafie em {{weak_domains}},
    - Tenha um NPC associado,
    - Defina nome, história, objetivo, e recompensa.
  Responda em Markdown.
```

#### DNA Timeline

```yaml
timeline: |
  Dado o histórico dos eventos (abaixo), escreva uma timeline narrativa para {{creature}} com 4-8 fatos marcantes.
  Destaque batalhas épicas e vitórias importantes. Formato Markdown datado.
```

### Benefícios

- ✅ **Ultra enxuto**: Só UI, prompts, ledger, useLLM hook
- ✅ **Personalização REAL**: Two users, two keys, two worlds
- ✅ **Sem backend**: Zero cloud admin
- ✅ **Experiência única**: Cada jogada pode ser diferente
- ✅ **Escalável**: Não precisa inventar 100 quests, só modelar prompts

### Pontos de Atenção

- ⚠️ **Prompt Engineering**: Cuidado para evitar vazamento de contexto
- ⚠️ **Determinismo**: Ledger garante replay/auditoria
- ⚠️ **Consistência**: Guardar últimas respostas importantes no ledger

---

## 📱 PWA no iPhone

### Funcionalidades

- ✅ **IndexedDB funciona** no iOS Safari
- ✅ **Crypto JS puro** roda perfeitamente
- ✅ **Instalação**: Safari > Share > Add to Home Screen
- ✅ **Standalone**: Tela cheia, sem barra de endereço
- ✅ **Offline**: Ledger local, assets pré-carregados

### Limitações

- 🔴 **Quota Storage**: IndexedDB limitado a ~50MB por app
- 🔴 **Sem multitasking real**: Só uma instância por vez
- 🔴 **Notificações push**: Limitadas até iOS 16.4+

### Estratégias de Contorno

1. **Compressão automática**: Ledger > 10MB → compacta automaticamente
2. **Exportação periódica**: Sugerir exportar quando próximo do limite
3. **Segmentação**: Dividir ledger por data/mês
4. **Backup automático**: Google Drive (seamless)

---

## 🏗️ Estrutura de Projeto Sugerida

```
arenalab-pwa/
├── public/
│   ├── index.html
│   └── manifest.json    # PWA config
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── ui/
│   │   ├── WelcomeScreen.tsx
│   │   ├── CreatureSelectScreen.tsx
│   │   ├── BattleScreen.tsx
│   │   ├── MissionScreen.tsx
│   │   ├── DnaTimelineScreen.tsx
│   │   └── ConfigScreen.tsx
│   ├── hooks/
│   │   └── useLLM.ts        # Universal LLM hook
│   ├── ledger/
│   │   └── index.ts         # IndexedDB/Dexie Ledger
│   ├── crypto/
│   │   └── index.ts         # Ed25519+BLAKE3
│   ├── cloud/
│   │   └── google-backup.ts # (Opcional: backup Drive)
│   ├── data/
│   │   ├── prompts/
│   │   │   ├── onboarding.yaml
│   │   │   ├── battle.yaml
│   │   │   ├── dna.yaml
│   │   │   ├── tips.yaml
│   │   │   └── quests.yaml
│   │   └── creatures.yaml
│   └── utils/
│       └── canonicalizeJson.ts
└── package.json
```

---

## 🎯 Diagrama Final

```
┌───────────────┐
│    UI SPA     │
└─────┬─────────┘
      │
      ▼
┌──────────────────────────────────────┐
│   Prompts distribuídos (YAML/JSON)   │
├──────────────────────────────────────┤
│   useLLM: faz chamada ao LLM via BYOK│
└─────┬────────────────────────────────┘
      │            │
      ▼            ▼
┌────────────┐  ┌──────────────┐
│ Ledger(☑️) │  │ Google Drive │
│ IndexedDB  │  │ backup auto  │
└────────────┘  └──────────────┘
      │            ▲
      │            │
      ▼            │
┌───────────────┐  │
│ Crypto JS     │◀─┘  (opcional encriptação do backup no client)
└───────────────┘
```

---

## ✅ Checklist de Implementação

### Motor JSON✯Atomic
- [ ] Setup Dexie.js
- [ ] Implementar canonicalização JSON
- [ ] Implementar hash BLAKE3
- [ ] Implementar assinatura Ed25519
- [ ] Geração e gerenciamento de chave
- [ ] Função `createSpan` completa
- [ ] Exportação/importação com compressão

### Backup Google Drive
- [ ] Configurar Google Cloud Project
- [ ] Integrar Google API JS Client
- [ ] Implementar login OAuth
- [ ] Implementar backup automático
- [ ] Implementar restore automático
- [ ] Modo paranoia (criptografia opcional)

### Prompt-First Engine
- [ ] Criar estrutura de prompts (YAML)
- [ ] Implementar hook `useLLM` universal
- [ ] Integrar prompts nas telas
- [ ] Parser de respostas (Markdown/JSON)
- [ ] Cache de respostas importantes

### PWA
- [ ] Manifest.json configurado
- [ ] Service Worker
- [ ] Ícones e assets
- [ ] Teste no iPhone Safari
- [ ] Teste modo standalone

---

## 🔗 Referências

- **Documento Original**: `Sugestao-Nova-Arquitetura.md`
- **Arquitetura Atual**: `ARQUITETURA_ATUAL_MOTOR.md`
- **Visão Geral**: `VISAO_GERAL.md`

---

## ⚠️ Nota Importante

**Esta é uma PROPOSTA de nova arquitetura.** A implementação atual usa Node.js + Express. Esta migração seria um **refactor completo** do motor para browser-native.

**Considerações:**
- ✅ Viável tecnicamente
- ✅ Alinha com visão de PWA/iPhone
- ✅ Reduz custos de infra
- ⚠️ Requer refatoração significativa
- ⚠️ Perde algumas funcionalidades server-side (se houver)

**Recomendação**: Avaliar trade-offs antes de migrar completamente.

---

**Status**: Proposta documentada  
**Última atualização**: 2025-11-10


