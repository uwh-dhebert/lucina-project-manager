# 🗄️ Database Setup Guide - Prisma & Supabase

## Current Status

✅ **Prisma Client Generated** - Ready to use
❌ **Database Connection** - Unable to reach Supabase

### Error: "Could not find table 'public.projects'"

This error occurs because:
1. The database tables haven't been created yet
2. Supabase database is not accessible from your network

---

## Solution

### Step 1: Verify Supabase Connection

Check if you can connect to Supabase from your network:

```bash
# Test connection to Supabase database
psql -h db.vmctpgyzwqgsatgrsuqk.supabase.co -U postgres -d postgres
```

If this fails, the database might be:
- Behind a firewall
- Not running
- Credentials are wrong
- Network restriction

### Step 2: Verify Credentials in .env.local

Open `.env.local` and check:

```env
DATABASE_URL="postgresql://postgres:XVkdk2qP6vUQ5TfH@db.vmctpgyzwqgsatgrsuqk.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:XVkdk2qP6vUQ5TfH@db.vmctpgyzwqgsatgrsuqk.supabase.co:5432/postgres"
```

**These are already configured. ✅**

### Step 3: Run Database Migration

Once Supabase is accessible, run this command:

```bash
# Set environment variables (PowerShell)
$env:DATABASE_URL='postgresql://postgres:XVkdk2qP6vUQ5TfH@db.vmctpgyzwqgsatgrsuqk.supabase.co:5432/postgres'
$env:DIRECT_URL='postgresql://postgres:XVkdk2qP6vUQ5TfH@db.vmctpgyzwqgsatgrsuqk.supabase.co:5432/postgres'

# Create and run migration
bun prisma migrate dev --name "init"
```

Or use a simpler approach:

```bash
# Push schema to database (no migration files)
bun prisma db push
```

### Step 4: Generate Prisma Client

This is already done! ✅

```bash
bun prisma generate
```

---

## Alternative: Use Supabase UI

Instead of CLI, you can use Supabase's SQL Editor:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to SQL Editor
4. Create a new query
5. Paste the SQL from `prisma/migrations/` or use the schema

---

## Prisma Schema

Your Prisma schema includes these models:

### Core Models
- ✅ **Project** - Project management
- ✅ **Topic** - Documentation/Wiki
- ✅ **Link** - URL bookmarking
- ✅ **ChatConversation & ChatMessage** - Chat interface
- ✅ **GeneratedDocument** - AI-generated docs
- ✅ **StoryRecommendation** - Azure DevOps recommendations
- ✅ **Profile** - User profiles
- ✅ **AccessRequest** - Access management
- ✅ **Epic & Story** - Legacy models

Total: **11 models** ready to be created

---

## Current Setup

### ✅ What's Working
1. Prisma Client is generated
2. Schema is defined and validated
3. Configuration is in place
4. API routes can use Prisma
5. Type definitions are generated

### ⏳ What Needs Database Connection
1. Creating tables in Supabase
2. Running migrations
3. Actual data operations

---

## Troubleshooting

### Error: "Can't reach database server"

**Cause**: Network connectivity issue

**Solutions**:
1. Check if Supabase project exists
2. Verify credentials are correct
3. Check firewall/VPN settings
4. Try from a different network
5. Contact Supabase support

### Error: "database does not exist"

**Cause**: Database specified doesn't exist

**Solution**: Create the database in Supabase UI or use:
```sql
CREATE DATABASE postgres;
```

### Error: "permission denied"

**Cause**: Wrong credentials or permissions

**Solution**: 
1. Verify username/password in `.env.local`
2. Check Supabase dashboard for correct credentials
3. Ensure user has create/modify permissions

---

## Files for Reference

```
prisma/
├── schema.prisma           # Database schema definition
└── migrations/             # Migration files (created after first migration)

prisma.config.ts            # Prisma configuration
.env.local                  # Database credentials
```

---

## Commands Reference

```bash
# Generate Prisma Client
bun prisma generate

# Create migration and apply it
bun prisma migrate dev --name "description"

# Push schema to database (no migration files)
bun prisma db push

# Check database connection
bun prisma db validate

# Open Prisma Studio (GUI for database)
bun prisma studio

# Reset database (⚠️ deletes all data)
bun prisma migrate reset

# Seed database (if seed.ts exists)
bun prisma db seed
```

---

## Next Steps

### Immediate (Ready Now)
1. ✅ Prisma Client is generated
2. ✅ Schema is defined
3. ✅ API code can be written
4. ✅ Type definitions are available

### When Database is Accessible
1. Run migration: `bun prisma migrate dev --name "init"`
2. Tables will be created in Supabase
3. API will work and save data to database
4. Applications will function fully

---

## Database Schema Overview

### Projects Table
```
id (UUID) - Primary key
name (String) - Project name
slug (String) - URL-friendly name
description (String) - Project description
ownerId (UUID) - Owner reference
createdAt (DateTime) - Creation date
updatedAt (DateTime) - Last update date
```

### Topics Table (Documentation)
```
id (UUID) - Primary key
projectId (UUID) - Project reference
title (String) - Topic title
slug (String) - URL-friendly name
content (Text) - Markdown content
order (Int) - Sorting order
createdAt (DateTime)
updatedAt (DateTime)
```

### And 9 more models...

---

## Working with Prisma in Code

Once database is set up, you can use Prisma like this:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create
const project = await prisma.project.create({
  data: {
    name: 'My Project',
    slug: 'my-project',
    ownerId: 'user-id',
  },
})

// Read
const projects = await prisma.project.findMany()

// Update
await prisma.project.update({
  where: { id: 'project-id' },
  data: { name: 'Updated Name' },
})

// Delete
await prisma.project.delete({
  where: { id: 'project-id' },
})
```

---

## Summary

| Task | Status |
|------|--------|
| Schema defined | ✅ |
| Prisma client generated | ✅ |
| Configuration set up | ✅ |
| Database credentials provided | ✅ |
| Database connection | ⏳ (waiting for network access) |
| Tables created | ⏳ (depends on migration) |

**Once network connectivity to Supabase is available**, run the migration command and all tables will be created automatically!

---

## Getting Help

If you still have connection issues:

1. Check Supabase Dashboard - confirm project exists
2. Verify credentials in `.env.local`
3. Test network connectivity to Supabase host
4. Check for VPN/Firewall restrictions
5. Contact Supabase support if issues persist

---

**Current Date**: July 1, 2026

**Status**: Ready for database setup

**Next Action**: Connect to Supabase and run migration

