# Lucina Project Manager - Quick Reference Card

## 📋 File Locations Quick Map

### Domain Layer
```
src/domain/
├── shared/types.ts                    # Base types, Entity, Repository interfaces
├── projects/
│   ├── entities/Project.ts
│   └── interfaces/IProjectRepository.ts
├── documentation/
│   ├── entities/Topic.ts
│   └── interfaces/ITopicRepository.ts
├── links/
│   ├── entities/Link.ts
│   └── interfaces/ILinkRepository.ts
├── chat/
│   ├── entities/ChatMessage.ts
│   └── interfaces/IChatMessageRepository.ts
├── ai-generator/
│   ├── entities/GeneratedDocument.ts
│   └── interfaces/IGeneratedDocumentRepository.ts
└── azure-devops/
    ├── entities/StoryRecommendation.ts
    └── interfaces/IStoryRecommendationRepository.ts
```

### Application Layer
```
src/application/
├── dto/index.ts                       # All DTOs for all domains
├── projects/CreateProjectUseCase.ts
├── documentation/CreateTopicUseCase.ts
└── links/CreateLinkUseCase.ts
```

### Infrastructure Layer
```
src/infrastructure/
├── persistence/repositories/
│   ├── PrismaProjectRepository.ts      # ✅ Done
│   ├── PrismaTopicRepository.ts        # TODO
│   ├── PrismaLinkRepository.ts         # TODO
│   ├── PrismaChatMessageRepository.ts  # TODO
│   ├── PrismaGeneratedDocumentRepository.ts  # TODO
│   └── PrismaStoryRecommendationRepository.ts # TODO
└── external/index.ts                  # Service interfaces
```

## 🔄 Development Workflow

### 1. Create Domain Entity
```typescript
// src/domain/[domain]/entities/[Entity].ts
export class MyEntity implements AggregateRoot<MyId> {
  // Validation, business logic, getters
}
```

### 2. Create Repository Interface
```typescript
// src/domain/[domain]/interfaces/IMyRepository.ts
export interface IMyRepository extends Repository<MyEntity> {
  // Query methods
}
```

### 3. Add DTOs
```typescript
// src/application/dto/index.ts
export interface CreateMyEntityDTO { }
export interface MyEntityResponseDTO { }
```

### 4. Create Use Case
```typescript
// src/application/[domain]/CreateMyEntityUseCase.ts
export class CreateMyEntityUseCase implements UseCase<Input, Output> {
  async execute(input: Input): Promise<Output> { }
}
```

### 5. Implement Repository
```typescript
// src/infrastructure/persistence/repositories/PrismaMyRepository.ts
export class PrismaMyRepository implements IMyRepository { }
```

### 6. Create API Route
```typescript
// app/api/[domain]/route.ts
export async function POST(request: Request) {
  const useCase = new CreateMyEntityUseCase(repository);
  return Response.json(await useCase.execute(input));
}
```

### 7. Create React Components
```typescript
// components/[domain]/MyEntityCard.tsx
export const MyEntityCard: React.FC<Props> = (props) => { }
```

## 💾 Database Models

### Quick Reference
| Model | Purpose | Status |
|-------|---------|--------|
| Profile | User auth | Existing |
| Project | Project container | ✅ Schema done |
| Topic | Wiki page | ✅ Schema done |
| Link | Bookmarked URL | ✅ Schema done |
| ChatConversation | Chat thread | ✅ Schema done |
| ChatMessage | Chat message | ✅ Schema done |
| GeneratedDocument | AI doc output | ✅ Schema done |
| StoryRecommendation | DevOps recommend | ✅ Schema done |

## 🚀 Common Commands

```bash
# Database
bun prisma migrate dev --name "description"
bun prisma generate
bun prisma studio

# Development
bun run dev          # Start dev server
bun tsc --noEmit     # Type check
bun lint             # ESLint

# Testing (when added)
bun test             # Run tests
bun test:watch       # Watch mode
```

## 📊 Entity Hierarchy

```
AggregateRoot<T extends UUID>
├── Project
├── Topic  
├── Link
├── ChatMessage
├── GeneratedDocument
└── StoryRecommendation
```

## 🔗 Dependency Flow

```
API Route
    ↓
Use Case
    ↓
Repository (Interface)
    ↓
Domain Entity
    ↓
Repository (Implementation)
    ↓
Prisma (Database)
```

## ✅ Implementation Checklist

### Per Domain (Create all 3)
- [ ] Use Case
- [ ] Prisma Repository
- [ ] API Routes

### Per Domain (Create 3-5)
- [ ] List Components
- [ ] Create/Edit Components
- [ ] Detail/View Components

### Full Feature (Do once)
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] E2E Tests

## 🎯 Status by Feature

| Feature | Status | Effort |
|---------|--------|--------|
| Projects | 30% | 2h |
| Documentation | 30% | 2h |
| Links | 30% | 2h |
| Chat | 20% | 4h |
| AI Generator | 10% | 4h |
| Azure DevOps | 10% | 3h |
| Testing | 0% | 8h |
| **Total** | **17%** | **25h** |

## 🎨 UI Components Needed

### Projects
- ProjectCard, ProjectForm, ProjectList
- ProjectDetailPage

### Documentation
- TopicEditor (Markdown), TopicList, TopicView
- DocumentationLayout

### Links
- LinkCard, LinkForm, LinkList
- LinkSearch, LinkFilter

### Chat
- ChatWindow, ChatMessage, ChatInput
- ConversationList

### AI Tools
- DocumentGenerator, StoryRecommender
- DocumentViewer

## 🔐 Security Checklist

- [ ] User authentication verified
- [ ] Ownership validation on all operations
- [ ] Input validation with Zod
- [ ] Rate limiting on API routes
- [ ] CORS configuration
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS prevention (React handles)
- [ ] CSRF tokens (Next.js handles)

## 📝 Important Files

- **tsconfig.json** - `@/*` alias configured
- **prisma/schema.prisma** - All models defined
- **.env.local** - Supabase config (add XAI, Azure DevOps)
- **next.config.ts** - Next.js configuration

## 🐛 Debugging Tips

```typescript
// Log entity state
console.log(entity.toJSON());

// Check repository result
const result = await repository.findById(id);
console.log('Found:', result?.toJSON());

// Type checking
const x: Project = entity as Project;

// Use Prisma Studio
bun prisma studio  // Opens UI on localhost:5555
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| PROJECT_ARCHITECTURE.md | High-level design |
| IMPLEMENTATION_ROADMAP.md | Step-by-step guide |
| DEVELOPMENT_GUIDE.md | How-to reference |
| SETUP_SUMMARY.md | This setup status |
| **THIS FILE** | Quick lookup |

## 🎓 Key Concepts

**Entity**: Business object with identity and lifecycle
**Aggregate**: Group of entities treated as unit
**Repository**: Contract for data access
**Use Case**: Business operation orchestrator
**DTO**: Data transfer between layers
**Domain Event**: Something happened in domain

## 🔗 Cross-Domain Reference

Some operations span multiple domains:

**Chat + Documentation**: RAG uses docs as context
**AI Generator + Projects**: Documents belong to projects
**Azure DevOps**: Standalone recommendations
**Links**: User-scoped, no project dependency

## 🚦 Git Workflow

```bash
# For each feature
git checkout -b feat/[domain]-[feature]
# ... implement
git commit -m "feat: add [domain] [feature]"
git push origin feat/[domain]-[feature]
# Create PR
```

## 📞 Quick Questions

**Q: Where do I add validation?**
A: In the domain entity constructor/methods

**Q: Where do I handle external API calls?**
A: In infrastructure/external services

**Q: Where do I write complex queries?**
A: In repository methods (infrastructure layer)

**Q: Where do I orchestrate across domains?**
A: In use cases (application layer)

**Q: Where do I handle HTTP concerns?**
A: In API routes (presentation layer)

---

**Last Updated**: July 1, 2026
**Project Status**: Architecture Complete, Implementation Phase 1 Ready ✨

