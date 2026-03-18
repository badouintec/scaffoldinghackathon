# 🏛️ Municipio App — Scaffolding Hackathon

Plataforma full-stack para la interacción entre **Municipio, Empresas y Ciudadanía**, con chatbot IA integrado, tablero de tickets y panel de reportes empresariales.

---

## 📐 Arquitectura general

```mermaid
graph TD
    subgraph Cliente["🌐 Cliente (Browser)"]
        WEB["apps/web<br/>Vite + React + TypeScript"]
    end

    subgraph Servidor["⚙️ Servidor"]
        API["apps/api<br/>Hono (Node.js)"]
        DB[("SQLite / Turso<br/>Drizzle ORM")]
        AI["Anthropic Claude<br/>claude-sonnet-4"]
    end

    subgraph Shared["📦 Shared"]
        TYPES["packages/shared<br/>Tipos TypeScript"]
    end

    WEB -- "HTTP /api/*" --> API
    API --> DB
    API --> AI
    WEB -. "Tipos compartidos" .-> TYPES
    API -. "Tipos compartidos" .-> TYPES
```

---

## 📁 Estructura de directorios

```
municipio-app/
├── package.json            ← Monorepo (npm workspaces)
├── tsconfig.base.json      ← Config TypeScript compartida
├── .env.example
│
├── apps/
│   ├── api/                ← Backend Hono
│   └── web/                ← Frontend Vite + React
│
└── packages/
    └── shared/             ← Tipos compartidos API ↔ Frontend
```

---

## 🗄️ Modelo de datos

```mermaid
erDiagram
    users {
        text id PK
        text name
        text email
        text role
        integer created_at
    }
    conversations {
        text id PK
        text user_id FK
        text title
        integer created_at
        integer updated_at
    }
    messages {
        text id PK
        text conversation_id FK
        text role
        text content
        integer created_at
    }
    tickets {
        text id PK
        text user_id FK
        text subject
        text description
        text status
        text category
        integer created_at
        integer updated_at
    }
    reports {
        text id PK
        text company_id FK
        text title
        text period
        text data
        integer created_at
    }

    users ||--o{ conversations : "tiene"
    conversations ||--o{ messages : "contiene"
    users ||--o{ tickets : "crea"
    users ||--o{ reports : "sube"
```

---

## 🔀 Flujo del chatbot (ciudadano)

```mermaid
sequenceDiagram
    actor Usuario
    participant Web as Web (React)
    participant API as API (Hono)
    participant DB as Base de datos
    participant AI as Claude SDK

    Usuario->>Web: Escribe mensaje
    Web->>API: POST /api/chat/send
    API->>DB: Carga historial de conversación
    DB-->>API: Mensajes previos
    API->>DB: Guarda mensaje del usuario
    API->>AI: Envía historial + nuevo mensaje
    AI-->>API: Respuesta del asistente
    API->>DB: Guarda respuesta del asistente
    API-->>Web: { reply: "..." }
    Web-->>Usuario: Muestra burbuja de respuesta
```

---

## 🎭 Roles de usuario

```mermaid
graph LR
    subgraph Roles
        C["👤 Ciudadano"]
        E["🏢 Empresa"]
        M["🏛️ Municipio"]
    end

    C -- "Chatbot + Tickets" --> ChatPlus["ChatPage<br/>+ DashboardCiudadanía"]
    E -- "Chatbot + Reportes" --> Empresa["ChatPage<br/>+ DashboardEmpresas"]
    M -- "Gestión global" --> Admin["Todos los tableros"]
```

---

## 🔌 API — Endpoints

```mermaid
graph LR
    subgraph Chat
        C1["POST /api/chat/send"]
        C2["POST /api/chat/conversations"]
    end
    subgraph Mensajes
        M1["GET /api/messages/:conversationId"]
    end
    subgraph Usuarios
        U1["POST /api/users/register"]
        U2["GET /api/users/:id"]
    end
    subgraph Tickets
        T1["GET /api/tickets"]
        T2["POST /api/tickets"]
        T3["PATCH /api/tickets/:id"]
    end
    subgraph Reportes
        R1["GET /api/reports"]
        R2["POST /api/reports"]
    end
```

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/health` | Estado del servidor | ✗ |
| `POST` | `/api/users/register` | Registrar usuario | ✗ |
| `GET` | `/api/users/:id` | Obtener usuario | ✗ |
| `POST` | `/api/chat/conversations` | Nueva conversación | ✓ |
| `POST` | `/api/chat/send` | Enviar mensaje al chatbot | ✓ |
| `GET` | `/api/messages/:conversationId` | Historial de mensajes | ✓ |
| `GET` | `/api/tickets` | Listar tickets | ✓ |
| `POST` | `/api/tickets` | Crear ticket | ✓ |
| `PATCH` | `/api/tickets/:id` | Actualizar estado de ticket | ✓ |
| `GET` | `/api/reports` | Listar reportes | ✓ |
| `POST` | `/api/reports` | Subir reporte | ✓ |

---

## 🖥️ Frontend — Páginas y componentes

```mermaid
graph TD
    App["App.tsx<br/>(React Router)"]

    App --> ChatPage["ChatPage"]
    App --> DashCiud["DashboardCiudadanía"]
    App --> DashEmp["DashboardEmpresas"]

    ChatPage --> ChatWindow["ChatWindow"]
    ChatWindow --> MessageBubble["MessageBubble"]
    ChatWindow --> InputBar["InputBar"]

    ChatPage -. "useChat()" .-> HookChat["hooks/useChat.ts"]
    DashCiud -. "useTickets()" .-> HookTickets["hooks/useTickets.ts"]

    HookChat --> ApiClient["api/client.ts"]
    HookTickets --> ApiClient
```

---

## ⚡ Quick Start

### 1. Prerrequisitos

- Node.js ≥ 20
- npm ≥ 10
- Cuenta en [Anthropic](https://console.anthropic.com/) para obtener `ANTHROPIC_API_KEY`

### 2. Instalación

```bash
cd municipio-app
cp .env.example .env
# Edita .env con tus valores reales
npm install
```

### 3. Base de datos

```bash
npm run db:migrate   # Crea las tablas en SQLite local
```

### 4. Desarrollo

```bash
npm run dev
# API  → http://localhost:3001
# Web  → http://localhost:5173
```

### 5. Verificación

```bash
curl http://localhost:3001/health
# {"status":"ok","ts":"..."}
```

---

## 🔧 Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor API | `3001` |
| `FRONTEND_URL` | Origen permitido por CORS | `http://localhost:5173` |
| `DATABASE_URL` | URL de la base de datos | `file:local.db` |
| `DATABASE_TOKEN` | Token Turso (vacío en local) | — |
| `ANTHROPIC_API_KEY` | Clave de la API de Anthropic | `sk-ant-...` |
| `VITE_API_URL` | Base URL de la API desde el frontend | `/api` |

---

## 🗺️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | [Hono](https://hono.dev/) + [@hono/node-server](https://github.com/honojs/node-server) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Base de datos | SQLite local / [Turso](https://turso.tech/) en producción |
| IA | [Anthropic Claude](https://www.anthropic.com/) (`claude-sonnet-4`) |
| Frontend | [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript |
| Router | [React Router v6](https://reactrouter.com/) |
| Validación | [Zod](https://zod.dev/) + [@hono/zod-validator](https://github.com/honojs/middleware/tree/main/packages/zod-validator) |
| Monorepo | npm workspaces |

---

## 🗺️ Próximos pasos

| Área | Tarea |
|------|-------|
| Auth | Integrar `hono/jwt` + login page con roles |
| UI | Agregar Tailwind CSS o CSS Modules con tema municipal |
| AI | Streaming de respuestas con `stream: true` del SDK |
| DB | Migrar a Turso en la nube para staging |
| Deploy | Cloudflare Workers (API) + Cloudflare Pages (Web) |
| Tests | Vitest para hooks, Hono test utils para rutas |

