# Lucina Project Manager - Implementation Roadmap

## Phase 1: Core Setup (Immediate)

### 1.1 Database Migration
```bash
# Generate and apply Prisma migration
bun prisma migrate dev --name "add_ddd_architecture"
bun prisma generate
```

### 1.2 Install Additional Dependencies
```bash
# Grok API Client
bun add xai @types/node

# Monaco Editor for Markdown
bun add monaco-editor @monaco-editor/react

# RAG / Vector Search (optional)
bun add openai dotenv

# Azure DevOps SDK
bun add azure-devops-node-api

# Validation
bun add zod

# Dependency Injection
bun add tsyringe reflect-metadata
```

### 1.3 Update TypeScript Config for Path Aliases
The `tsconfig.json` already has `@/*` path configured. Use it consistently:
- `@/src/domain/...` for domain layer
- `@/src/application/...` for application layer
- `@/src/infrastructure/...` for infrastructure layer
- `@/src/presentation/...` for presentation layer

## Phase 2: Application Layer (Week 1)

### 2.1 Complete All Use Cases

#### Projects Domain
- [ ] GetProjectUseCase
- [ ] UpdateProjectUseCase
- [ ] DeleteProjectUseCase
- [ ] ListProjectsUseCase

#### Documentation Domain
- [ ] CreateTopicUseCase (✅ Done)
- [ ] UpdateTopicUseCase
- [ ] DeleteTopicUseCase
- [ ] GetTopicUseCase
- [ ] ListTopicsUseCase
- [ ] ReorderTopicsUseCase

#### Links Domain
- [ ] CreateLinkUseCase (✅ Done)
- [ ] UpdateLinkUseCase
- [ ] DeleteLinkUseCase
- [ ] GetLinkUseCase
- [ ] ListLinksUseCase
- [ ] SearchLinksUseCase

#### Chat Domain
- [ ] CreateChatMessageUseCase
- [ ] GetChatHistoryUseCase
- [ ] DeleteConversationUseCase
- [ ] RAGChatWithDocumentsUseCase

#### AI Generator Domain
- [ ] GenerateDesignDocumentUseCase
- [ ] UpdateGeneratedDocumentUseCase
- [ ] PublishDocumentUseCase
- [ ] ListGeneratedDocumentsUseCase

#### Azure DevOps Domain
- [ ] RecommendStorySizeUseCase
- [ ] AcceptRecommendationUseCase
- [ ] GetRecommendationHistoryUseCase

### 2.2 Error Handling
Create `src/shared/errors/ApplicationException.ts`:
```typescript
export class ApplicationException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'ApplicationException';
  }
}
```

## Phase 3: Infrastructure Layer (Week 1-2)

### 3.1 Repository Implementations
- [ ] PrismaProjectRepository (✅ Done)
- [ ] PrismaTopicRepository
- [ ] PrismaLinkRepository
- [ ] PrismaChatMessageRepository
- [ ] PrismaGeneratedDocumentRepository
- [ ] PrismaStoryRecommendationRepository

### 3.2 External Service Implementations

#### 3.2.1 Grok Service
Create `src/infrastructure/external/GrokService.ts`:
```typescript
export class GrokService implements IGrokService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.XAI_API_KEY!;
  }

  async chat(request: GrokChatRequest): Promise<GrokChatResponse> {
    // Implementation calling xAI API
  }

  async ragChat(
    request: GrokChatRequest,
    documentContexts: string[]
  ): Promise<GrokChatResponse> {
    // Enhance system prompt with document context
    const enhancedRequest = {
      ...request,
      systemPrompt: this.buildRAGPrompt(request.systemPrompt, documentContexts),
    };
    return this.chat(enhancedRequest);
  }

  private buildRAGPrompt(basePrompt: string, contexts: string[]): string {
    return `${basePrompt}\n\nContext:\n${contexts.join('\n')}`;
  }
}
```

#### 3.2.2 Azure DevOps Service
Create `src/infrastructure/external/AzureDevOpsService.ts`:
- Fetch stories from Azure DevOps
- Apply small story bias (xs/small bias: 70%)
- Return recommendations with confidence scores

#### 3.2.3 Document Storage Service
Create `src/infrastructure/external/DocumentStorageService.ts`:
- Integrate with Supabase Storage for document versioning
- Support vector embeddings for RAG

### 3.3 Dependency Injection Container
Create `src/infrastructure/di/Container.ts`:
```typescript
import { Container } from 'tsyringe';

export function setupContainer(): Container {
  const container = new Container();

  // Repositories
  container.registerSingleton('IProjectRepository', PrismaProjectRepository);
  container.registerSingleton('ITopicRepository', PrismaTopicRepository);
  container.registerSingleton('ILinkRepository', PrismaLinkRepository);
  
  // External Services
  container.registerSingleton('IGrokService', GrokService);
  container.registerSingleton('IAzureDevOpsService', AzureDevOpsService);
  
  // Use Cases
  container.registerSingleton('CreateProjectUseCase', CreateProjectUseCase);
  
  return container;
}
```

## Phase 4: Presentation Layer (Week 2-3)

### 4.1 API Routes Structure
```
app/api/
├── auth/
│   ├── callback/
│   └── logout/
├── projects/
│   ├── route.ts (GET - list, POST - create)
│   └── [id]/
│       └── route.ts (GET, PUT, DELETE)
├── documentation/
│   ├── [projectId]/
│   │   ├── topics/
│   │   │   ├── route.ts (GET - list, POST - create)
│   │   │   └── [topicId]/route.ts
├── links/
│   ├── route.ts (CRUD)
│   └── search/route.ts
├── chat/
│   ├── conversations/route.ts
│   └── messages/route.ts
├── ai-generator/
│   ├── generate/route.ts (POST)
│   └── documents/[id]/route.ts
└── azure-devops/
    └── recommendations/route.ts
```

### 4.2 React Components
```
components/
├── projects/
│   ├── ProjectCard.tsx
│   ├── ProjectForm.tsx
│   └── ProjectList.tsx
├── documentation/
│   ├── TopicEditor.tsx (Markdown editor)
│   ├── TopicNavigation.tsx
│   └── TopicView.tsx
├── links/
│   ├── LinkCard.tsx
│   ├── LinkForm.tsx
│   └── LinkList.tsx
├── chat/
│   ├── ChatWindow.tsx
│   ├── ChatMessage.tsx
│   └── ChatInput.tsx
├── ai-tools/
│   ├── DesignDocumentGenerator.tsx
│   ├── StoryRecommender.tsx
│   └── DocumentViewer.tsx
└── ui/
    ├── Markdown Editor components
    └── Custom lucina.com UI components
```

### 4.3 Page Routes
```
app/(protected)/
├── dashboard/page.tsx
├── projects/
│   ├── page.tsx (list)
│   ├── [slug]/
│   │   └── page.tsx (detail)
│   └── new/page.tsx
├── documentation/
│   ├── [projectId]/page.tsx
│   └── [projectId]/topics/[topicSlug]/page.tsx
├── links/page.tsx
├── chat/
│   ├── page.tsx (chat list)
│   └── [conversationId]/page.tsx
└── ai-tools/
    ├── design-generator/page.tsx
    └── story-recommender/page.tsx
```

## Phase 5: Testing (Week 3)

### 5.1 Unit Tests
- Domain entity validation tests
- Use case logic tests
- Repository mock tests

### 5.2 Integration Tests
- API route tests
- Database integration tests

### 5.3 E2E Tests
- User workflows
- Complex multi-domain operations

## Environment Variables Required

```env
# xAI Grok
XAI_API_KEY=your_grok_api_key
XAI_API_URL=https://api.x.ai

# Azure DevOps
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/{org}
AZURE_DEVOPS_PAT=your_personal_access_token

# OpenAI (for vector embeddings if using)
OPENAI_API_KEY=sk_...

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_...
```

## Key Files Created So Far

✅ Domain Layer:
- `src/domain/shared/types.ts` - Base types & interfaces
- `src/domain/projects/entities/Project.ts`
- `src/domain/documentation/entities/Topic.ts`
- `src/domain/links/entities/Link.ts`
- `src/domain/chat/entities/ChatMessage.ts`
- `src/domain/ai-generator/entities/GeneratedDocument.ts`
- `src/domain/azure-devops/entities/StoryRecommendation.ts`
- Repository interfaces for all domains

✅ Application Layer:
- `src/application/dto/index.ts` - All DTOs
- `src/application/projects/CreateProjectUseCase.ts`
- `src/application/documentation/CreateTopicUseCase.ts`
- `src/application/links/CreateLinkUseCase.ts`

✅ Infrastructure Layer:
- `src/infrastructure/external/index.ts` - Service interfaces
- `src/infrastructure/persistence/repositories/PrismaProjectRepository.ts`

✅ Database:
- Updated `prisma/schema.prisma` with all models

## Next Steps

1. **Run database migration**: `bun prisma migrate dev`
2. **Create remaining repository implementations** (4-5 hours)
3. **Create remaining use cases** (6-8 hours)
4. **Build API routes** (8-10 hours)
5. **Create React components** (10-12 hours)
6. **Integrate Grok API** (4-5 hours)
7. **Integrate Azure DevOps** (4-5 hours)
8. **Testing** (5-8 hours)

**Total estimated time**: 45-60 hours of focused development

## Architecture Principles

### Clean Architecture
- Concentric circles: Domain → Application → Infrastructure → Presentation
- Dependencies point inward
- Domain layer is isolated from external concerns

### DDD
- Bounded contexts for each domain
- Aggregates (Project, Topic, Link, ChatMessage, etc.)
- Repository pattern for data access
- Value objects for domain logic

### SOLID Principles
- **S**ingle Responsibility: Each class has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Implementations are substitutable
- **I**nterface Segregation: Specific interfaces over general ones
- **D**ependency Inversion: Depend on abstractions, not concretions

## Documentation
- Keep API documentation in `README.md`
- Create `DEVELOPMENT.md` for developer onboarding
- Document each domain's business rules
- Maintain architectural decision records (ADR)

