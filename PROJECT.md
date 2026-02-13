# PROJECT.md — Desafio Dev Full Stack NewSun Energy

## Sumario

- [Visao Geral](#visao-geral)
- [Como Executar](#como-executar)
- [Stack Tecnologica](#stack-tecnologica)
- [Arquitetura do Backend](#arquitetura-do-backend)
- [Arquitetura do Frontend](#arquitetura-do-frontend)
- [Modelo de Dados](#modelo-de-dados)
- [Endpoints da API](#endpoints-da-api)
- [Regras de Negocio](#regras-de-negocio)
- [Integracao com API Externa (magic-pdf)](#integracao-com-api-externa-magic-pdf)
- [Validacao com Zod](#validacao-com-zod)
- [Tratamento de Erros](#tratamento-de-erros)
- [Gerenciamento de Estado (Frontend)](#gerenciamento-de-estado-frontend)
- [Testes](#testes)
- [Infraestrutura Docker](#infraestrutura-docker)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Decisoes Tecnicas e Justificativas](#decisoes-tecnicas-e-justificativas)
- [Estrutura de Pastas Completa](#estrutura-de-pastas-completa)
- [Fluxo Completo da Aplicacao](#fluxo-completo-da-aplicacao)

---

## Visao Geral

Aplicacao full stack para **simulacao de compensacao energetica**. O usuario submete um formulario com dados pessoais e contas de energia em PDF. O backend decodifica os PDFs via API externa (magic-pdf), extrai dados estruturados de consumo e persiste no banco de dados.

**Duas telas:**

- `/simular` — Formulario de submissao da simulacao
- `/listagem` — Consulta das simulacoes registradas com filtros e detalhamento

**Tres endpoints:**

- `POST /leads` — Registrar simulacao (multipart/form-data com PDFs)
- `GET /leads` — Listar simulacoes com filtros opcionais
- `GET /leads/:id` — Buscar simulacao por ID com dados completos

---

## Como Executar

### Pre-requisitos

- Docker e Docker Compose instalados
- Portas 3000, 3306 e 5173 disponiveis

### Subir a aplicacao completa

```bash
git clone <repositorio>
cd desafio-dev-fullstack
docker compose up --build
```

Aguarde os 3 servicos ficarem saudaveis. O MySQL inicia primeiro (com healthcheck), o backend aguarda o MySQL, e o frontend aguarda o backend.

### Acessos

| Servico                | URL                                                                     |
| ---------------------- | ----------------------------------------------------------------------- |
| Frontend               | http://localhost:5173                                                   |
| Backend API            | http://localhost:3000                                                   |
| Swagger (Documentacao) | http://localhost:3000/api/docs                                          |
| MySQL                  | localhost:3306 (user: root, password: root123, database: newsun_energy) |

### Desenvolvimento local (sem Docker)

```bash
# Backend
cd backend
cp .env.example .env          # Configurar variaveis de ambiente
npm install
npm run db:generate            # Gerar migrations
npm run db:migrate             # Aplicar migrations
npm run start:dev              # Servidor dev com hot reload

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev                    # Vite dev server
```

### Rodar testes

```bash
cd backend
npm test                       # Testes unitarios (Jest)
npm run test:cov               # Testes com cobertura
```

---

## Stack Tecnologica

### Backend

| Tecnologia  | Versao      | Funcao                                                          |
| ----------- | ----------- | --------------------------------------------------------------- |
| NestJS      | 11.0.1      | Framework HTTP com injecao de dependencia e arquitetura modular |
| TypeScript  | 5.7.3       | Tipagem estatica em todo o projeto                              |
| Drizzle ORM | 0.45.1      | ORM type-safe com query builder e API relacional                |
| MySQL       | 8           | Banco de dados relacional                                       |
| mysql2      | 3.17.0      | Driver MySQL nativo com pool de conexoes                        |
| Zod         | 4.3.6       | Validacao de schemas em runtime (entrada, saida, env)           |
| Swagger     | 11.2.6      | Documentacao automatica da API                                  |
| Jest        | 30.0.0      | Framework de testes unitarios                                   |
| Node.js     | 22 (Alpine) | Runtime com fetch nativo e crypto.randomUUID                    |

### Frontend

| Tecnologia           | Versao  | Funcao                                          |
| -------------------- | ------- | ----------------------------------------------- |
| React                | 19.2.0  | Biblioteca de UI                                |
| TypeScript           | 5.9.3   | Tipagem estatica                                |
| Vite                 | 7.3.1   | Build tool e dev server                         |
| TanStack Router      | 1.159.5 | Roteamento file-based com tipagem               |
| TanStack React Query | 5.90.21 | Cache e sincronizacao de estado servidor        |
| React Hook Form      | 7.71.1  | Gerenciamento de formularios                    |
| Zod                  | 4.3.6   | Validacao de formularios                        |
| Tailwind CSS         | 4.1.18  | Estilizacao utility-first                       |
| shadcn/ui            | 3.8.4   | Componentes UI acessiveis (Radix UI + Tailwind) |
| Sonner               | -       | Notificacoes toast                              |
| Lucide React         | 0.563.0 | Icones                                          |

### Infraestrutura

| Tecnologia              | Funcao                                                   |
| ----------------------- | -------------------------------------------------------- |
| Docker Compose          | Orquestracao dos 3 servicos (MySQL + Backend + Frontend) |
| Docker (Node 22 Alpine) | Containers multi-stage para backend e frontend           |

---

## Arquitetura do Backend

O backend segue uma **arquitetura limpa (Clean Architecture)** com separacao clara de responsabilidades em camadas. A logica de negocio e desacoplada do framework (NestJS) e do banco (Drizzle).

### Camadas

```
Controller (HTTP) → Use Case (Logica) → Repository (Dados)
     ↓                    ↓                     ↓
  Recebe request     Orquestra fluxo      Acessa banco
  Valida entrada     Aplica regras        Transacoes
  Retorna response   Lanca erros          Queries/Inserts
```

### Modulos NestJS

```
AppModule (raiz)
├── DatabaseModule (@Global)     → Conexao Drizzle com MySQL
├── MagicPdfModule               → Client HTTP para API externa
└── LeadModule                   → Dominio principal (controller + use cases + repository)
```

#### DatabaseModule (`shared/config/`)

Modulo global que exporta a conexao Drizzle como provider injetavel via `DATABASE_CONNECTION` (Symbol). Usa pool de conexoes MySQL com limite de 10 conexoes simultaneas. Os schemas Drizzle (tabelas + relations) sao passados no construtor do `drizzle()` para habilitar a API relacional (`db.query.*`).

#### MagicPdfModule (`modules/magic-pdf/`)

Encapsula toda a comunicacao com a API externa de decodificacao de PDFs. Composto por:

- **`magic-pdf.dto.ts`** — Schema Zod que valida a resposta da API externa. Garante que a resposta tem o formato esperado antes de processar.
- **`magic-pdf.service.ts`** — Service injetavel que recebe um Buffer (PDF), monta FormData, faz POST via fetch nativo, valida resposta com Zod e retorna dados tipados.
- **`magic-pdf.mapper.ts`** — Funcao pura que converte a resposta da API para o modelo de dominio. Ordena invoices por data, pega os 12 mais recentes, e mapeia campos.

#### LeadModule (`modules/lead/`)

Modulo principal do dominio. Implementa o padrao **Repository** com inversao de dependencia:

- **`lead.repository.ts`** — Interface abstrata que define o contrato de acesso a dados. Os use cases dependem apenas desta interface.
- **`drizzle-lead.repository.ts`** — Implementacao concreta usando Drizzle ORM. Registrada via `{ provide: LEAD_REPOSITORY, useClass: DrizzleLeadRepository }`.
- **Use Cases** — Tres classes injetaveis, cada uma com um unico metodo `execute()`:
  - `CreateLeadUseCase` — Decodifica PDFs, valida regras, persiste em transacao
  - `ListLeadsUseCase` — Lista com filtros opcionais
  - `GetLeadByIdUseCase` — Busca por ID com 404 se nao encontrado
- **`lead.controller.ts`** — Controller HTTP com 3 endpoints, decorators Swagger, e validacao via `ZodValidationPipe`.
- **DTOs** — Schemas Zod para validacao de entrada (`create-lead.dto.ts`, `list-leads-query.dto.ts`) e documentacao de saida (`lead-response.dto.ts`).

### Schemas Drizzle (Tabelas + Relations)

Os schemas Drizzle definem tanto as tabelas quanto as relacoes entre elas:

- `lead.schema.ts` — Tabela `leads` + relacao `one-to-many` com unidades
- `unidade.schema.ts` — Tabela `unidades` + relacao `many-to-one` com leads + `one-to-many` com consumos
- `consumo.schema.ts` — Tabela `consumos` + relacao `many-to-one` com unidades

As relations sao exportadas junto com as tabelas via barrel export (`index.ts`) e passadas para o `drizzle()` na configuracao da conexao. Isso habilita queries relacionais como:

```ts
db.query.leads.findMany({
  with: { unidades: { with: { consumos: true } } },
});
```

### Shared (Infra transversal)

- **`env.ts`** — Validacao de variaveis de ambiente com Zod. Se alguma variavel obrigatoria estiver ausente ou invalida, o processo encerra com mensagem detalhada.
- **`zod-validation.pipe.ts`** — Pipe reutilizavel que recebe um schema Zod e valida body/query/params. Retorna erros formatados com campo + mensagem.
- **`domain-error.filter.ts`** — Exception filter global que captura erros de dominio (`DomainError`) e retorna `{ statusCode, message }`.
- **Erros de dominio** — Hierarquia de classes que estendem `DomainError`:
  - `EmailAlreadyExistsError` (409)
  - `UnitCodeAlreadyExistsError` (409)
  - `NoFilesProvidedError` (400)

---

## Arquitetura do Frontend

O frontend segue uma arquitetura de **componentes compostos** com separacao entre UI, logica de dados e estado.

### Roteamento (TanStack Router)

Roteamento file-based com tipagem automatica. O plugin `TanStackRouterVite` observa a pasta `src/routes/` e gera `routeTree.gen.ts` com a arvore de rotas tipada.

```
routes/
├── __root.tsx     → Layout raiz (header com navegacao + Outlet + Toaster)
├── index.tsx      → Redirect automatico / → /simular
├── simular.tsx    → Pagina do formulario (Card + SimulationForm)
└── listagem.tsx   → Pagina de listagem (Filtros + Tabela + Dialog)
```

- **`__root.tsx`** — Renderiza em todas as paginas. Contem o header com links de navegacao (usando `<Link>` do TanStack Router com classe `.active` automatica) e o `<Toaster />` para notificacoes.
- **`index.tsx`** — Usa `throw redirect({ to: '/simular' })` no `beforeLoad` para redirecionar antes de renderizar.

### Componentes

| Componente         | Responsabilidade                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `SimulationForm`   | Formulario completo com react-hook-form + zodResolver. Campos de texto via `register`, upload via `Controller`.                             |
| `FileUpload`       | Area de drag & drop para PDFs. Componente controlado (value/onChange). Filtra apenas PDFs, acumula arquivos, permite remocao.               |
| `LeadFilters`      | 3 campos de filtro (nome, email, codigo UC) com debounce de 300ms via `useEffect` + `setTimeout`.                                           |
| `LeadTable`        | Tabela shadcn com 3 estados: loading (skeleton), vazio (mensagem), dados (linhas clicaveis).                                                |
| `LeadDetailDialog` | Modal com dados completos do lead. Para cada unidade: badges (enquadramento, modelo fasico), dados gerais e tabela dos 12 meses de consumo. |

### Hooks (TanStack Query)

| Hook            | Tipo     | Funcao                                                                         |
| --------------- | -------- | ------------------------------------------------------------------------------ |
| `useCreateLead` | Mutation | Monta FormData, chama API, invalida cache, navega para /listagem, mostra toast |
| `useLeads`      | Query    | Busca lista de leads com filtros. queryKey: `['leads', filters]`               |
| `useLeadById`   | Query    | Busca lead por ID. `enabled: !!id` — so busca quando ha ID selecionado         |

### Client HTTP (`services/api.ts`)

Objeto `api` com 3 metodos tipados usando `fetch` nativo:

- `createLead(formData)` — POST multipart
- `getLeads(filters?)` — GET com query params via `URLSearchParams`
- `getLeadById(id)` — GET por ID

Base URL configuravel via `VITE_API_URL` (variavel de ambiente do Vite).

### Stores (`stores/`)

Dois stores simples para persistencia de estado em memoria durante a sessao:

- **`simulation-store.ts`** — Persiste valores do formulario (nome, email, telefone) entre navegacoes
- **`filter-store.ts`** — Persiste valores dos filtros da listagem

### Validacao Frontend (`schemas/simulation.schema.ts`)

Schema Zod que valida o formulario de simulacao:

- `nomeCompleto` — string, minimo 3 caracteres
- `email` — formato de email valido
- `telefone` — string, 10 a 15 digitos
- `files` — array de `File`, minimo 1, todos devem ser PDF (`application/pdf`)

Integrado ao react-hook-form via `@hookform/resolvers/zod`.

### Tipagem (`types/lead.ts`)

Interfaces TypeScript centralizadas que refletem o modelo de dados retornado pela API:

- `Lead` — Lead com unidades aninhadas
- `Unidade` — Unidade com consumos aninhados
- `Consumo` — Registro individual de consumo
- `LeadFilters` — Filtros opcionais para listagem

---

## Modelo de Dados

### Diagrama Entidade-Relacionamento

```
leads (1) ──────── (N) unidades (1) ──────── (N) consumos
```

### Tabela `leads`

| Coluna        | Tipo         | Restricoes                           |
| ------------- | ------------ | ------------------------------------ |
| id            | VARCHAR(36)  | PK, UUID v4                          |
| nome_completo | VARCHAR(255) | NOT NULL                             |
| email         | VARCHAR(255) | NOT NULL, UNIQUE                     |
| telefone      | VARCHAR(20)  | NOT NULL                             |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW()              |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW(), auto-update |

### Tabela `unidades`

| Coluna                        | Tipo          | Restricoes                                        |
| ----------------------------- | ------------- | ------------------------------------------------- |
| id                            | VARCHAR(36)   | PK, UUID v4                                       |
| lead_id                       | VARCHAR(36)   | FK → leads.id, CASCADE DELETE                     |
| codigo_da_unidade_consumidora | VARCHAR(50)   | NOT NULL, UNIQUE                                  |
| modelo_fasico                 | ENUM          | NOT NULL, ('monofasico', 'bifasico', 'trifasico') |
| enquadramento                 | ENUM          | NOT NULL, ('AX', 'B1', 'B2', 'B3')                |
| consumo_em_reais              | DECIMAL(10,2) | NOT NULL                                          |
| mes_de_referencia             | DATE          | NOT NULL                                          |
| created_at                    | TIMESTAMP     | NOT NULL, DEFAULT NOW()                           |
| updated_at                    | TIMESTAMP     | NOT NULL, DEFAULT NOW(), auto-update              |

### Tabela `consumos`

| Coluna                    | Tipo          | Restricoes                       |
| ------------------------- | ------------- | -------------------------------- |
| id                        | VARCHAR(36)   | PK, UUID v4                      |
| unidade_id                | VARCHAR(36)   | FK → unidades.id, CASCADE DELETE |
| consumo_fora_ponta_em_kwh | DECIMAL(10,2) | NOT NULL                         |
| mes_do_consumo            | DATE          | NOT NULL                         |
| created_at                | TIMESTAMP     | NOT NULL, DEFAULT NOW()          |
| —                         | UNIQUE        | (unidade_id, mes_do_consumo)     |

### Relacionamentos e Cascade

- **Lead → Unidades:** Um lead tem N unidades (minimo 1). Deletar um lead deleta todas as suas unidades.
- **Unidade → Consumos:** Uma unidade tem exatamente 12 consumos (historico mensal). Deletar uma unidade deleta todos os seus consumos.
- **CASCADE DELETE** em todas as foreign keys garante integridade referencial automatica.

### Migrations

As migrations sao geradas pelo `drizzle-kit` a partir dos schemas TypeScript e ficam em `backend/drizzle/`. A migration `0000_numerous_firedrake.sql` cria as 3 tabelas com todas as constraints, indices e foreign keys.

---

## Endpoints da API

Todos os endpoints estao sob o prefixo `/leads` e documentados via Swagger em `/api/docs`.

### POST /leads

**Descricao:** Registrar uma nova simulacao de compensacao energetica.

**Content-Type:** `multipart/form-data`

**Campos do body:**
| Campo | Tipo | Obrigatorio | Validacao |
|-------|------|------------|-----------|
| nomeCompleto | string | Sim | Minimo 3 caracteres |
| email | string | Sim | Formato de email valido |
| telefone | string | Sim | 10 a 15 caracteres |
| files | File[] | Sim | Minimo 1 arquivo PDF |

**Respostas:**
| Status | Descricao |
|--------|-----------|
| 201 | Lead criado com sucesso. Retorna lead completo com unidades e consumos. |
| 400 | Dados invalidos ou nenhum arquivo enviado. |
| 409 | Email ja cadastrado ou codigo de unidade consumidora ja existente. |

**Fluxo interno:**

1. `ZodValidationPipe` valida body (nome, email, telefone)
2. `FilesInterceptor` do Multer extrai os PDFs
3. `CreateLeadUseCase.execute()`:
   - Verifica unicidade do email (`existsByEmail`)
   - Para cada PDF: chama `MagicPdfService.decodePdf()` (em paralelo via `Promise.all`)
   - Mapeia cada resposta para dominio via `mapMagicPdfToUnidade()`
   - Verifica unicidade de cada codigo UC (`existsByUnitCode`)
   - Persiste lead + unidades + consumos em transacao atomica

### GET /leads

**Descricao:** Listar simulacoes com filtros opcionais.

**Query Parameters:**
| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|------------|-----------|
| nome | string | Nao | Busca parcial por nome (LIKE %nome%) |
| email | string | Nao | Busca parcial por email (LIKE %email%) |
| codigoDaUnidadeConsumidora | string | Nao | Busca por codigo da unidade |
| page | number | Nao | Pagina (default: 1) |
| limit | number | Nao | Itens por pagina (default: 20, max: 100) |

**Respostas:**
| Status | Descricao |
|--------|-----------|
| 200 | Array de leads com unidades e consumos aninhados. |

### GET /leads/:id

**Descricao:** Buscar simulacao por ID com dados completos.

**Respostas:**
| Status | Descricao |
|--------|-----------|
| 200 | Lead completo com unidades e consumos. |
| 404 | Lead nao encontrado. |

### Formato da resposta (Lead completo)

```json
{
  "id": "uuid",
  "nomeCompleto": "Joao da Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "createdAt": "2025-10-05T00:00:00.000Z",
  "updatedAt": "2025-10-05T00:00:00.000Z",
  "unidades": [
    {
      "id": "uuid",
      "codigoDaUnidadeConsumidora": "14476614",
      "modeloFasico": "trifasico",
      "enquadramento": "B3",
      "consumoEmReais": "802.72",
      "mesDeReferencia": "2025-10-05",
      "consumos": [
        {
          "id": "uuid",
          "mesDoConsumo": "2025-10-05",
          "consumoForaPontaEmKWH": "7800.00"
        }
      ]
    }
  ]
}
```

---

## Regras de Negocio

| #   | Regra                                                  | Implementacao                                                                                                                     |
| --- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Email unico por lead                                   | `existsByEmail()` no use case + constraint UNIQUE no banco                                                                        |
| 2   | Codigo da unidade consumidora unico globalmente        | `existsByUnitCode()` no use case + constraint UNIQUE no banco                                                                     |
| 3   | Lead deve ter no minimo 1 unidade                      | `NoFilesProvidedError` no use case + validacao Zod no frontend (`files.min(1)`)                                                   |
| 4   | Cada unidade deve ter exatamente 12 meses de historico | API retorna 13 meses, mapper faz `slice(0, 12)` dos mais recentes. Schema Zod da resposta exige `invoice.min(12)`.                |
| 5   | Validacao de entrada com Zod                           | Backend: `ZodValidationPipe` no controller. Frontend: `zodResolver` no react-hook-form.                                           |
| 6   | Transacao atomica na criacao                           | `db.transaction()` no repository: lead + unidades + consumos inseridos juntos. Se qualquer insert falhar, tudo faz rollback.      |
| 7   | PDF nao e armazenado                                   | O backend recebe o PDF, envia para a API magic-pdf, extrai dados e descarta o arquivo. Apenas dados estruturados sao persistidos. |

---

## Integracao com API Externa (magic-pdf)

### Endpoint

```
POST https://magic-pdf.solarium.newsun.energy/v1/magic-pdf
Content-Type: multipart/form-data
Body: { file: <PDF> }
```

### Resposta da API

```json
{
  "valor": 802.72,
  "barcode": "836300000087...",
  "chargingModel": "B3",
  "phaseModel": "trifasico",
  "unit_key": "14476614",
  "invoice": [
    {
      "consumo_date": "2025-10-05T00:00:00.000Z",
      "consumo_fp": 7800,
      "consumo_p": 0
    }
  ],
  "energy_company_id": "uuid"
}
```

### Mapeamento API → Dominio

| Campo API                 | Campo Dominio                | Transformacao                                   |
| ------------------------- | ---------------------------- | ----------------------------------------------- |
| `unit_key`                | `codigoDaUnidadeConsumidora` | Direto                                          |
| `chargingModel`           | `enquadramento`              | Direto (AX, B1, B2, B3)                         |
| `phaseModel`              | `modeloFasico`               | Direto (monofasico, bifasico, trifasico)        |
| `valor`                   | `consumoEmReais`             | Direto (number)                                 |
| `invoice[0].consumo_date` | `mesDeReferencia`            | Mais recente apos ordenacao, formato YYYY-MM-DD |
| `invoice[].consumo_fp`    | `consumoForaPontaEmKWH`      | Para cada um dos 12 meses                       |
| `invoice[].consumo_date`  | `mesDoConsumo`               | ISO string → YYYY-MM-DD                         |

### Tratamento dos 13 meses

A API retorna 13 meses de historico. O dominio exige exatamente 12. O mapper:

1. Ordena invoices por `consumo_date` em ordem descendente
2. Faz `slice(0, 12)` para pegar os 12 mais recentes
3. O primeiro item apos ordenacao e o mes de referencia

### Validacao da resposta

A resposta da API e validada com `magicPdfResponseSchema` (Zod). Se a API retornar dados em formato inesperado, o parse falha e o erro e propagado ao usuario. Campos opcionais (`barcode`, `energy_company_id`) sao aceitos mas nao utilizados no dominio.

---

## Validacao com Zod

A validacao com Zod esta presente em **ambas as camadas** (frontend e backend), garantindo consistencia:

### Backend

| Local                     | Schema                   | Funcao                                        |
| ------------------------- | ------------------------ | --------------------------------------------- |
| `env.ts`                  | `envSchema`              | Valida variaveis de ambiente na inicializacao |
| `magic-pdf.dto.ts`        | `magicPdfResponseSchema` | Valida resposta da API externa                |
| `create-lead.dto.ts`      | `createLeadSchema`       | Valida body do POST /leads                    |
| `list-leads-query.dto.ts` | `listLeadsQuerySchema`   | Valida query params do GET /leads             |
| `lead-response.dto.ts`    | `leadResponseSchema`     | Documenta formato de saida                    |

### Frontend

| Local                  | Schema                 | Funcao                            |
| ---------------------- | ---------------------- | --------------------------------- |
| `simulation.schema.ts` | `simulationFormSchema` | Valida formulario antes do submit |

### ZodValidationPipe

Pipe reutilizavel do NestJS que:

1. Recebe um schema Zod no construtor
2. Executa `safeParse` no valor recebido
3. Se invalido: lanca `BadRequestException` com `{ message, errors: [{ field, message }] }`
4. Se valido: retorna `result.data` (com defaults e coercoes aplicados)

---

## Tratamento de Erros

### Hierarquia de erros de dominio

```
Error (nativo)
└── DomainError (abstrato, com statusCode)
    ├── EmailAlreadyExistsError (409)
    ├── UnitCodeAlreadyExistsError (409)
    └── NoFilesProvidedError (400)
```

### DomainErrorFilter

Exception filter global registrado no `main.ts` via `app.useGlobalFilters()`. Captura qualquer instancia de `DomainError` e retorna:

```json
{
  "statusCode": 409,
  "message": "Ja existe um lead cadastrado com o email: joao@email.com"
}
```

### Erros de validacao (Zod)

Retornados pelo `ZodValidationPipe` como `BadRequestException`:

```json
{
  "statusCode": 400,
  "message": "Erro de validacao",
  "errors": [
    { "field": "email", "message": "Email invalido" },
    { "field": "telefone", "message": "Telefone invalido" }
  ]
}
```

### Erros do NestJS

O `NotFoundException` do NestJS e usado no `GetLeadByIdUseCase` para 404. O NestJS trata automaticamente e retorna `{ statusCode: 404, message }`.

### Frontend

Erros da API sao capturados pelo TanStack Query no `onError` da mutation/query e exibidos como toast via Sonner. Erros de validacao do formulario sao exibidos inline abaixo de cada campo.

---

## Gerenciamento de Estado (Frontend)

### Estado do servidor (TanStack React Query)

| Query Key            | Dados          | Atualiza quando                                 |
| -------------------- | -------------- | ----------------------------------------------- |
| `['leads', filters]` | Lista de leads | Filtros mudam, cache expira, invalidacao manual |
| `['leads', id]`      | Lead completo  | Dialog abre com ID                              |

Configuracao global:

- `staleTime: 60s` — Dados ficam frescos por 1 minuto
- `refetchOnWindowFocus: false` — Sem re-fetch ao voltar a aba

### Estado do formulario (React Hook Form)

Gerenciado internamente pelo `useForm` com `zodResolver`. Campos de texto usam `register`, upload de arquivos usa `Controller`.

### Estado de UI (Stores)

Dois stores simples em memoria:

- `simulationStore` — Persiste valores do formulario entre navegacoes
- `filterStore` — Persiste valores dos filtros da listagem

### Estado local (useState)

- `filters` em `/listagem` — Objeto de filtros ativos
- `selectedLeadId` em `/listagem` — ID do lead selecionado para o dialog

---

## Testes

### Framework

Backend usa **Jest 30** (padrao do ecossistema NestJS). Testes unitarios com mocks.

### Testes implementados

| Arquivo                           | Tipo     | Cenarios                                                                                        |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `create-lead.use-case.spec.ts`    | Unitario | Sucesso, sem arquivos, email duplicado, codigo UC duplicado, multiplos PDFs, ordem de validacao |
| `list-leads.use-case.spec.ts`     | Unitario | Sem filtros, com filtros, lista com dados                                                       |
| `get-lead-by-id.use-case.spec.ts` | Unitario | Lead encontrado, lead nao encontrado (404)                                                      |
| `magic-pdf.mapper.spec.ts`        | Unitario | Mapeamento de campos, slice de 12 meses, ordenacao, formato de data, imutabilidade              |

### Estrategia de mocking

- **LeadRepository** — Mock completo de todas as funcoes (`jest.Mocked<LeadRepository>`)
- **MagicPdfService** — Mock de `decodePdf` retornando resposta fake
- **Mapper** — Funcao pura testada sem mocks (input → output)

### Rodar testes

```bash
cd backend
npm test                # Todos os testes
npm run test:watch      # Watch mode
npm run test:cov        # Com cobertura
```

---

## Infraestrutura Docker

### docker-compose.yml

3 servicos orquestrados:

#### MySQL (`newsun-mysql`)

```yaml
image: mysql:8
ports: "3306:3306"
volumes: mysql_data (persistente)
healthcheck: mysqladmin ping (10s interval, 5 retries)
environment:
  MYSQL_ROOT_PASSWORD: root123
  MYSQL_DATABASE: newsun_energy
```

#### Backend (`newsun-backend`)

```yaml
build: ./backend/Dockerfile
ports: "3000:3000"
depends_on: mysql (condition: service_healthy)
develop.watch: sincroniza ./backend/src → /app/src
environment: credenciais do banco
```

#### Frontend (`newsun-frontend`)

```yaml
build: ./frontend/Dockerfile
ports: "5173:5173"
depends_on: backend
develop.watch: sincroniza ./frontend/src → /app/src
environment: VITE_API_URL=http://localhost:3000
```

### Dockerfiles

Ambos usam padrao multi-stage com **Node 22 Alpine**:

```
Stage 1 (base): Define WORKDIR /app
Stage 2 (deps): Copia package*.json e roda npm ci
Stage 3 (dev): Copia codigo fonte, expoe porta, roda dev server
```

O `npm ci` no stage de deps garante instalacao deterministica a partir do `package-lock.json`. A separacao em stages permite cache de layers — se o codigo mudar mas as dependencias nao, o stage de deps e reaproveitado.

---

## Variaveis de Ambiente

### `.env` (raiz — usado pelo docker-compose)

```env
# MySQL
MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=newsun_energy

# Backend
DATABASE_HOST=mysql
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root123
DATABASE_NAME=newsun_energy
PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000
```

### Backend (`backend/.env`)

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root123
DATABASE_NAME=newsun_energy
PORT=3000
MAGIC_PDF_API_URL=https://magic-pdf.solarium.newsun.energy/v1/magic-pdf
```

A `MAGIC_PDF_API_URL` tem default no schema Zod — funciona sem configurar.

---

## Decisoes Tecnicas e Justificativas

### 1. NestJS como framework backend

**Por que:** Arquitetura modular com injecao de dependencia nativa. Facilita separacao de responsabilidades (controller, service, repository) e testes unitarios com mocks. O sistema de modulos isola cada dominio.

**Alternativas consideradas:** Express puro (menos estrutura), Fastify (NestJS suporta como adapter se necessario).

### 2. Drizzle ORM ao inves de Prisma/TypeORM

**Por que:** Type-safe sem code generation. Os schemas sao TypeScript puro — o tipo das queries e inferido diretamente. A API relacional (`db.query.*`) permite queries com joins sem SQL manual. Performance superior ao Prisma em queries complexas.

**Trade-off:** Ecossistema menor que Prisma, menos documentacao. Compensado pela tipagem superior e controle total das queries.

### 3. Zod em ambas as camadas

**Por que:** Um unico paradigma de validacao no frontend e backend. Schemas sao reutilizaveis como fonte de verdade para tipos TypeScript via `z.infer`. No backend, valida entrada (body/query), saida (resposta da API externa) e configuracao (env). No frontend, integra nativamente com react-hook-form via `@hookform/resolvers/zod`.

### 4. Repository Pattern com inversao de dependencia

**Por que:** Os use cases dependem de uma interface (`LeadRepository`), nao da implementacao (`DrizzleLeadRepository`). Isso permite:

- Testar use cases com mocks (sem banco real)
- Trocar o ORM/banco sem alterar logica de negocio
- Separacao clara entre dominio e infraestrutura

### 5. TanStack Router (file-based) ao inves de React Router

**Por que:** Roteamento type-safe com geracao automatica de tipos. O plugin Vite gera `routeTree.gen.ts` com tipagem completa — `<Link to="...">` tem autocomplete e validacao de paths. Code splitting automatico por rota.

**Trade-off:** Mais setup inicial que React Router v6. Compensado pela seguranca de tipos em navegacao.

### 6. TanStack React Query para estado do servidor

**Por que:** Cache automatico, deduplicacao de requests, invalidacao seletiva, loading/error states gratuitos. Elimina a necessidade de gerenciamento manual de estado para dados do servidor (Redux, Context, etc).

### 7. fetch nativo ao inves de axios

**Por que:** Node 22 tem `fetch` global estavel. Menos uma dependencia. No frontend, `fetch` com `FormData` define `Content-Type: multipart/form-data` automaticamente (axios requer configuracao manual).

### 8. UUIDs v4 como chaves primarias

**Por que:** Gerados no application layer (`crypto.randomUUID()`), nao no banco. Permite criar o ID antes do insert (util para retornar o lead recem-criado sem query adicional). Sem colisao entre ambientes.

**Trade-off:** Indices B-tree sao menos eficientes com UUIDs aleatarios que com auto-increment. Aceitavel para o volume de dados deste projeto.

### 9. shadcn/ui como sistema de componentes

**Por que:** Componentes copiados para o projeto (nao instalados como dependencia). Customizaveis, acessiveis (baseados em Radix UI), e estilizados com Tailwind. O `components.json` configura o estilo (New York) e o sistema de cores.

### 10. Jest no backend, potencial Vitest no frontend

**Por que:** Jest e o padrao do NestJS — `@nestjs/testing` e feito para ele. Trocar para Vitest no backend exigiria reconfigurar transforms e mocks sem ganho real. No frontend, Vitest seria natural por integrar com Vite, mas nao foi necessario implementar testes de frontend para este desafio.

---

## Estrutura de Pastas Completa

```
desafio-dev-fullstack/
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
├── PROJECT.md
├── PLANO-EXECUCAO.md
├── README.md
├── conta-de-energia/                          # PDFs de exemplo para teste
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── nest-cli.json
│   ├── drizzle.config.ts
│   ├── .env
│   ├── .prettierrc
│   ├── eslint.config.mjs
│   │
│   ├── drizzle/
│   │   ├── 0000_numerous_firedrake.sql        # Migration: cria 3 tabelas
│   │   └── meta/
│   │       ├── 0000_snapshot.json
│   │       └── _journal.json
│   │
│   ├── src/
│   │   ├── main.ts                            # Bootstrap: CORS, Swagger, DomainErrorFilter
│   │   ├── app.module.ts                      # Root module (Database + MagicPdf + Lead)
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── config/
│   │   │   │   ├── env.ts                     # Validacao Zod das variaveis de ambiente
│   │   │   │   ├── database.ts                # Conexao Drizzle + pool MySQL
│   │   │   │   └── database.module.ts         # Modulo global DATABASE_CONNECTION
│   │   │   ├── errors/
│   │   │   │   ├── domain.error.ts            # Classe base abstrata
│   │   │   │   ├── email-already-exists.error.ts
│   │   │   │   ├── unit-code-already-exists.error.ts
│   │   │   │   └── no-files-provided.error.ts
│   │   │   ├── pipes/
│   │   │   │   └── zod-validation.pipe.ts     # Pipe reutilizavel de validacao Zod
│   │   │   └── filters/
│   │   │       └── domain-error.filter.ts     # Exception filter para DomainError
│   │   │
│   │   └── modules/
│   │       ├── magic-pdf/
│   │       │   ├── magic-pdf.module.ts
│   │       │   ├── magic-pdf.service.ts       # Client HTTP (fetch + FormData)
│   │       │   ├── magic-pdf.mapper.ts        # Funcao pura: API → dominio
│   │       │   ├── magic-pdf.mapper.spec.ts   # Testes do mapper
│   │       │   └── dto/
│   │       │       └── magic-pdf.dto.ts       # Schema Zod da resposta da API
│   │       │
│   │       └── lead/
│   │           ├── lead.module.ts
│   │           ├── lead.controller.ts         # 3 endpoints (POST, GET, GET/:id)
│   │           ├── schemas/
│   │           │   ├── lead.schema.ts         # Tabela leads + relations
│   │           │   ├── unidade.schema.ts      # Tabela unidades + relations
│   │           │   ├── consumo.schema.ts      # Tabela consumos + relations
│   │           │   └── index.ts               # Barrel export
│   │           ├── repositories/
│   │           │   ├── lead.repository.ts     # Interface + tipos + token LEAD_REPOSITORY
│   │           │   └── drizzle-lead.repository.ts  # Implementacao Drizzle
│   │           ├── use-cases/
│   │           │   ├── create-lead.use-case.ts
│   │           │   ├── create-lead.use-case.spec.ts
│   │           │   ├── list-leads.use-case.ts
│   │           │   ├── list-leads.use-case.spec.ts
│   │           │   ├── get-lead-by-id.use-case.ts
│   │           │   └── get-lead-by-id.use-case.spec.ts
│   │           └── dto/
│   │               └── request/
│   │                   ├── create-lead.dto.ts
│   │                   ├── list-leads-query.dto.ts
│   │                   └── response/
│   │                       └── lead-response.dto.ts
│   │
│   └── test/
│       ├── jest-e2e.json
│       └── app.e2e-spec.ts
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── vite.config.ts                         # React + Tailwind + TanStack Router plugin
    ├── components.json                        # Config shadcn (New York style)
    ├── index.html
    ├── eslint.config.js
    │
    └── src/
        ├── main.tsx                           # QueryClient + Router providers
        ├── index.css                          # Tailwind globals + shadcn theme (oklch)
        ├── routeTree.gen.ts                   # Gerado automaticamente pelo plugin
        │
        ├── routes/
        │   ├── __root.tsx                     # Layout: header + nav + Outlet + Toaster
        │   ├── index.tsx                      # Redirect / → /simular
        │   ├── simular.tsx                    # Card + SimulationForm
        │   └── listagem.tsx                   # Filtros + Tabela + Dialog
        │
        ├── components/
        │   ├── ui/                            # shadcn: button, input, label, card, table,
        │   │                                  #         dialog, badge, sonner
        │   ├── simulation-form.tsx            # Formulario completo (RHF + Zod)
        │   ├── file-upload.tsx                # Drag & drop de PDFs
        │   ├── lead-filters.tsx               # Filtros com debounce
        │   ├── lead-table.tsx                 # Tabela de leads (3 estados)
        │   └── lead-detail-dialog.tsx         # Modal de detalhes
        │
        ├── hooks/
        │   ├── use-create-lead.ts             # Mutation (POST /leads)
        │   ├── use-leads.ts                   # Query (GET /leads)
        │   └── use-lead-by-id.ts              # Query (GET /leads/:id)
        │
        ├── services/
        │   └── api.ts                         # Client HTTP (fetch)
        │
        ├── schemas/
        │   └── simulation.schema.ts           # Zod schema do formulario
        │
        ├── types/
        │   └── lead.ts                        # Interfaces TS (Lead, Unidade, Consumo, Filters)
        │
        ├── stores/
        │   ├── simulation-store.ts            # Persistencia do formulario
        │   └── filter-store.ts                # Persistencia dos filtros
        │
        └── lib/
            └── utils.ts                       # cn() para classNames
```

---

## Fluxo Completo da Aplicacao

### Fluxo de Cadastro (Simulacao)

```
Usuario acessa /simular
    │
    ▼
Preenche formulario (nome, email, telefone)
    │
    ▼
seleciona PDFs de contas de energia
    │
    ▼
Clica "Simular compensacao"
    │
    ▼
[Frontend] Zod valida campos + arquivos
    │ (erro? → mensagem inline)
    ▼
[Frontend] useCreateLead monta FormData, chama POST /leads
    │
    ▼
[Backend] ZodValidationPipe valida body
    │
    ▼
[Backend] CreateLeadUseCase:
    │
    ├── existsByEmail? → 409 EmailAlreadyExistsError
    │
    ├── Para cada PDF (Promise.all):
    │   ├── MagicPdfService.decodePdf() → POST para API externa
    │   ├── Zod valida resposta da API
    │   └── mapMagicPdfToUnidade() → ordena, slice 12, mapeia campos
    │
    ├── Para cada unidade: existsByUnitCode? → 409 UnitCodeAlreadyExistsError
    │
    └── repository.create() → transacao atomica:
        ├── INSERT lead
        ├── INSERT unidades (1 por PDF)
        └── INSERT consumos (12 por unidade)
    │
    ▼
[Backend] Retorna lead completo (201)
    │
    ▼
[Frontend] Toast "Simulacao registrada com sucesso!"
    │
    ▼
[Frontend] Invalida cache ['leads'], navega para /listagem
    │
    ▼
Usuario ve o lead recem-criado na listagem
```

### Fluxo de Consulta (Listagem)

```
Usuario acessa /listagem
    │
    ▼
[Frontend] useLeads() dispara GET /leads
    │
    ▼
[Backend] ListLeadsUseCase → repository.findAll()
    │ (query relacional: leads + unidades + consumos)
    ▼
[Frontend] LeadTable renderiza resultados
    │
    ├── [Filtros] Usuario digita no campo "Nome"
    │   └── Debounce 300ms → useLeads({ nome: "..." }) → re-fetch
    │
    └── [Detalhes] Usuario clica numa linha
        │
        ▼
    [Frontend] setSelectedLeadId(id) → dialog abre
        │
        ▼
    [Frontend] useLeadById(id) → GET /leads/:id
        │
        ▼
    [Backend] GetLeadByIdUseCase → repository.findById()
        │
        ▼
    [Frontend] LeadDetailDialog renderiza:
        ├── Dados do lead (nome, email, telefone, data)
        ├── Para cada unidade:
        │   ├── Badges (enquadramento, modelo fasico)
        │   ├── Codigo UC, valor, mes de referencia
        │   └── Tabela dos 12 meses de consumo
        └── Fechar → setSelectedLeadId(null)
```
