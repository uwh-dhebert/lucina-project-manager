# Lucina Project Manager - Development Guide

## Project Overview

This is a sophisticated project management system built with Next.js 16, following **Clean Architecture** and **Domain-Driven Design (DDD)** principles with SOLID compliance.

### Key Features

1. **Wiki-Style Documentation** - Project-specific documentation with Markdown editor
2. **Links Management** - Bookmarked links with tagging and categorization
3. **Grok AI Chatbot** - RAG-enabled conversational AI for project context
4. **Design Document Generator** - AI-powered document creation using Dan Hebert's template
5. **Story Recommendations** - Azure DevOps integration with small-story bias AI recommendations
6. **Elegant UI** - Inspired by lucina.com with Tailwind CSS

## Architecture Overview

### Layer Structure

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (React Components, API Routes)     │
├─────────────────────────────────────┤
│      Application Layer              │
│  (Use Cases, DTOs, Orchestration)   │
├─────────────────────────────────────┤
│     Infrastructure Layer            │
│  (Repositories, External Services)  │
├─────────────────────────────────────┤
│      Domain Layer                   │
│  (Entities, Value Objects, Rules)   │
└─────────────────────────────────────┘
```

### Directory Structure

```
src/
├── domain/
│   ├── shared/                   # Shared domain interfaces & types
│   ├── projects/                 # Projects bounded context
│   ├── documentation/            # Documentation/Topics
│   ├── links/                    # Links management
│   ├── chat/                     # Chat conversations
│   ├── ai-generator/             # AI document generation
│   └── azure-devops/             # Azure DevOps integration
│
├── application/
│   ├── dto/                      # Data Transfer Objects
│   ├── projects/                 # Project use cases
│   ├── documentation/            # Documentation use cases
│   ├── links/                    # Links use cases
│   ├── chat/                     # Chat use cases
│   ├── ai-generator/             # AI Generator use cases
│   └── azure-devops/             # Azure DevOps use cases
│
├── infrastructure/
│   ├── persistence/
│   │   ├── repositories/         # Prisma repository implementations
│   │   └── query/                # Complex queries
│   └── external/
│       ├── grok/                 # Grok AI service
│       ├── azure-devops/         # Azure DevOps API client
│       └── document-storage/     # Supabase storage integration
│
└── presentation/
    ├── components/               # React components organized by domain
    ├── hooks/                    # React hooks
    ├── contexts/                 # Context providers
    └── utils/                    # UI utilities
```

## Development Workflow

### 1. Adding a New Feature (Example: Link Management)

#### Step 1: Define Domain Entity

File: `src/domain/links/entities/Link.ts`
- Encapsulate business logic
- Validate invariants
- Support domain events

#### Step 2: Define Repository Interface

File: `src/domain/links/interfaces/ILinkRepository.ts`
- Contract for data access
- Query methods
- No implementation details

#### Step 3: Create DTOs

File: `src/application/dto/index.ts` (add Link DTOs)
- `CreateLinkDTO` - Input from API
- `UpdateLinkDTO` - Update payload
- `LinkResponseDTO` - API response

#### Step 4: Implement Use Cases

File: `src/application/links/CreateLinkUseCase.ts`
- Orchestrate domain and infrastructure
- Handle transactions
- Map DTOs to entities and vice versa

#### Step 5: Implement Repository

File: `src/infrastructure/persistence/repositories/PrismaLinkRepository.ts`
- Implement persistence logic
- Map Prisma models to domain entities
- Handle complex queries

#### Step 6: Create API Route

File: `app/api/links/route.ts`
```typescript
import { CreateLinkUseCase } from '@/src/application/links/CreateLinkUseCase';
import { PrismaLinkRepository } from '@/src/infrastructure/persistence/repositories/PrismaLinkRepository';

export async function POST(request: Request) {
  const body = await request.json();
  
  const repository = new PrismaLinkRepository(prisma);
  const useCase = new CreateLinkUseCase(repository);
  
  try {
    const result = await useCase.execute({
      userId: getCurrentUserId(),
      dto: body,
    });
    
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
```

#### Step 7: Create React Components

File: `components/links/LinkCard.tsx`
```typescript
export const LinkCard: React.FC<LinkCardProps> = ({ link, onEdit, onDelete }) => {
  return (
    <div className="border rounded-lg p-4">
      <a href={link.url} target="_blank" rel="noopener noreferrer">
        <h3 className="font-semibold hover:text-blue-600">{link.name}</h3>
      </a>
      <p className="text-sm text-gray-600">{link.description}</p>
      <div className="mt-2 flex gap-2">
        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{link.category}</span>
        {link.tags.map(tag => (
          <span key={tag} className="text-xs bg-blue-100 px-2 py-1 rounded">{tag}</span>
        ))}
      </div>
    </div>
  );
};
```

#### Step 8: Create Pages

File: `app/(protected)/links/page.tsx`
- List view
- Create/edit modal
- Search and filter

### 2. Important Development Rules

#### Domain Layer Rules
- ✅ **DO**: Implement business logic, validation, invariants
- ✅ **DO**: Raise domain exceptions for business rule violations
- ❌ **DON'T**: Reference infrastructure or presentation layers
- ❌ **DON'T**: Access databases directly
- ❌ **DON'T**: Have any HTTP or UI dependencies

#### Application Layer Rules
- ✅ **DO**: Orchestrate use cases using domain entities
- ✅ **DO**: Convert between DTOs and domain entities
- ✅ **DO**: Handle cross-cutting concerns (logging, tracing)
- ❌ **DON'T**: Implement business logic (belongs in domain)
- ❌ **DON'T**: Access databases directly (use repositories)

#### Infrastructure Layer Rules
- ✅ **DO**: Implement repository interfaces
- ✅ **DO**: Integrate with external services
- ✅ **DO**: Handle data persistence
- ❌ **DON'T**: Implement business logic
- ❌ **DON'T**: Know about application use cases

#### Presentation Layer Rules
- ✅ **DO**: Display data and handle user interactions
- ✅ **DO**: Call use cases through API routes
- ✅ **DO**: Validate user input on the client
- ❌ **DON'T**: Implement business logic
- ❌ **DON'T**: Access databases directly

## API Route Patterns

### Standard CRUD Pattern

```typescript
// GET /api/links - List all links for user
export async function GET(request: Request) {
  const userId = getCurrentUserId();
  const repository = new PrismaLinkRepository(prisma);
  const links = await repository.findByUserId(userId);
  return Response.json(links);
}

// POST /api/links - Create new link
export async function POST(request: Request) {
  const body = await request.json();
  const useCase = new CreateLinkUseCase(repository);
  const result = await useCase.execute({ userId, dto: body });
  return Response.json(result, { status: 201 });
}
```

### Dynamic Routes

```typescript
// PUT /api/links/[id] - Update link
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const useCase = new UpdateLinkUseCase(repository);
  const result = await useCase.execute({ linkId: id as UUID, dto: body });
  return Response.json(result);
}

// DELETE /api/links/[id] - Delete link
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const repository = new PrismaLinkRepository(prisma);
  await repository.delete(id as UUID);
  return new Response(null, { status: 204 });
}
```

## Testing Strategy

### Unit Tests (Domain Layer)
```typescript
describe('Link Entity', () => {
  it('should create a valid link', () => {
    const link = Link.create(
      createUUID('test-id'),
      createUUID('user-1'),
      'https://example.com',
      'Example'
    );
    expect(link.getName()).toBe('Example');
  });

  it('should throw error for invalid URL', () => {
    expect(() => {
      Link.create(
        createUUID('test-id'),
        createUUID('user-1'),
        'not-a-url',
        'Example'
      );
    }).toThrow(InvalidEntityException);
  });
});
```

### Integration Tests (Application + Infrastructure)
```typescript
describe('CreateLinkUseCase', () => {
  it('should create and persist a link', async () => {
    const useCase = new CreateLinkUseCase(mockRepository);
    const result = await useCase.execute({
      userId: createUUID('user-1'),
      dto: { url: 'https://example.com', name: 'Example' },
    });
    expect(result.id).toBeDefined();
  });
});
```

### E2E Tests (Full Stack)
```typescript
describe('Link Management E2E', () => {
  it('should create, read, update, delete a link', async () => {
    // Create
    const createRes = await fetch('/api/links', {
      method: 'POST',
      body: JSON.stringify({ url: '...', name: '...' }),
    });
    // Read
    // Update
    // Delete
  });
});
```

## Best Practices

### 1. Error Handling

```typescript
// Domain exceptions
throw new BusinessRuleViolation('Link URL already bookmarked');
throw new InvalidEntityException('Link name cannot be empty');

// Application exceptions
throw new ApplicationException('Failed to create link', 'LINK_CREATE_FAILED', 400);

// API error responses
return Response.json(
  { error: error.message, code: error.code },
  { status: error.statusCode || 500 }
);
```

### 2. Logging

```typescript
import { logger } from '@/src/shared/logger';

logger.info('Creating link', { userId, url });
logger.error('Failed to create link', { error, userId });
```

### 3. Validation

Use Zod for runtime validation:

```typescript
import { z } from 'zod';

const CreateLinkSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().default('general'),
  tags: z.array(z.string()).default([]),
});

type CreateLinkDTO = z.infer<typeof CreateLinkSchema>;

// In API route
const dto = CreateLinkSchema.parse(await request.json());
```

### 4. Type Safety

```typescript
// Use branded types for IDs
export type LinkId = UUID;

// Strongly typed DTOs
export interface LinkResponseDTO {
  id: string;
  url: string;
  // ...
}

// Repository methods
async findById(id: UUID): Promise<Link | null>
async save(link: Link): Promise<void>
```

## Common Tasks

### Adding a New Domain

1. Create `src/domain/[domain]/`
2. Create entity files in `entities/`
3. Create repository interface in `interfaces/`
4. Create use cases in `src/application/[domain]/`
5. Create repository implementation in `src/infrastructure/persistence/repositories/`
6. Add Prisma model in `prisma/schema.prisma`
7. Run migration: `bun prisma migrate dev`
8. Create API routes in `app/api/[domain]/`
9. Create React components in `components/[domain]/`

### Debugging

```typescript
// Add logging
console.log('Domain entity state:', entity.toJSON());

// Use TypeScript strict mode
"strict": true in tsconfig.json

// Check types
const entity: Link = Link.create(...);

// Prisma studio
bun prisma studio
```

### Performance Tips

- Use repository query methods for filtering (not in-memory)
- Index frequently queried fields in Prisma schema
- Implement pagination for large lists
- Use React.memo for expensive components
- Lazy load components with dynamic imports

## Troubleshooting

### Database Connection Issues
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
bun prisma db push

# Reset database (⚠️ deletes all data)
bun prisma migrate reset
```

### Type Errors
```bash
# Regenerate Prisma types
bun prisma generate

# Check TypeScript
bun tsc --noEmit
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
bun run build
```

## Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Contact & Support

For questions about the architecture or implementation, refer to:
- `PROJECT_ARCHITECTURE.md` - High-level design
- `IMPLEMENTATION_ROADMAP.md` - Step-by-step guide
- Domain-specific README files (to be created)

