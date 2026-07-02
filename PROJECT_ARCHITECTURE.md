# Lucina Project Manager - Architecture

## Clean Architecture + DDD Structure

```
lucina-project-manager/
├── app/                           # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx (dashboard)
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── callback/
│   ├── (protected)/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── documentation/
│   │   ├── links/
│   │   ├── chat/
│   │   └── ai-tools/
│   └── api/                       # API Routes (Infrastructure Layer)
│       ├── auth/
│       ├── projects/
│       ├── documentation/
│       ├── links/
│       ├── chat/
│       ├── grok/
│       └── azure-devops/
│
├── src/                           # Source Code - Organized by Domain
│   ├── domain/                    # Domain Layer (Business Logic)
│   │   ├── projects/
│   │   │   ├── entities/
│   │   │   ├── interfaces/
│   │   │   └── value-objects/
│   │   ├── documentation/
│   │   ├── links/
│   │   ├── chat/
│   │   ├── ai-generator/
│   │   ├── azure-devops/
│   │   └── shared/
│   │
│   ├── application/               # Application Layer (Use Cases & DTOs)
│   │   ├── projects/
│   │   ├── documentation/
│   │   ├── links/
│   │   ├── chat/
│   │   ├── ai-generator/
│   │   ├── azure-devops/
│   │   └── dto/
│   │
│   ├── infrastructure/            # Infrastructure Layer (Persistence & External Services)
│   │   ├── persistence/
│   │   │   ├── repositories/
│   │   │   ├── prisma/
│   │   │   └── query/
│   │   ├── external/
│   │   │   ├── grok/
│   │   │   ├── azure-devops/
│   │   │   └── supabase/
│   │   └── config/
│   │
│   ├── presentation/              # Presentation Layer (UI Components)
│   │   ├── components/
│   │   │   ├── projects/
│   │   │   ├── documentation/
│   │   │   ├── links/
│   │   │   ├── chat/
│   │   │   ├── ui/
│   │   │   └── layout/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   └── utils/
│   │
│   └── shared/                    # Shared Utilities
│       ├── types/
│       ├── constants/
│       ├── errors/
│       ├── logger/
│       └── validators/
│
├── prisma/
│   └── schema.prisma
├── utils/
│   └── supabase/
├── public/
├── .env.local
└── package.json
```

## Domain Layer

### Projects Domain
- **Entity**: Project
  - id: UUID
  - name: string
  - slug: string
  - description: string
  - ownerId: UUID
  - createdAt: Date
  - updatedAt: Date
  - topics: Topic[] (one-to-many)

### Documentation Domain
- **Entity**: Topic
  - id: UUID
  - projectId: UUID
  - title: string
  - slug: string
  - content: string (Markdown)
  - order: number
  - createdAt: Date
  - updatedAt: Date

### Links Domain
- **Entity**: Link
  - id: UUID
  - url: string
  - name: string
  - description: string
  - category: string
  - tags: string[]
  - createdAt: Date

### Chat Domain
- **Entity**: ChatMessage
  - id: UUID
  - userId: UUID
  - content: string
  - role: 'user' | 'assistant'
  - context: string[] (document IDs for RAG)
  - createdAt: Date

### AI Generator Domain
- **Entity**: GeneratedDocument
  - id: UUID
  - projectId: UUID
  - templateType: 'dan-hebert' | 'custom'
  - content: string
  - generatedAt: Date

### Azure DevOps Domain
- **Entity**: StoryRecommendation
  - id: UUID
  - storyId: string
  - title: string
  - size: number
  - recommendation: string
  - reasoning: string
  - createdAt: Date

## Key Patterns

1. **Repository Pattern**: Isolate data access logic
2. **Use Case Pattern**: Encapsulate business logic
3. **DTO Pattern**: Transfer objects between layers
4. **Dependency Injection**: Loose coupling
5. **Error Handling**: Custom domain exceptions
6. **Validation**: Business rule validation in domain layer

## Technology Stack

- **Framework**: Next.js 16.2.9
- **Runtime**: Bun
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui
- **Editor**: Monaco Editor (Markdown)
- **AI**: xAI Grok API
- **External**: Azure DevOps API

## API Integration Points

- `/api/chat` - Grok ChatBot with RAG
- `/api/ai-generator` - Design Document Generator
- `/api/azure-devops` - Story Recommendations
- `/api/projects` - Project CRUD
- `/api/documentation` - Topic CRUD
- `/api/links` - Link Management

