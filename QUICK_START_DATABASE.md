# 🚀 Quick Start - Database Setup Instructions

## Problem

Error: `Could not find the table 'public.projects' in the schema cache`

This means the database tables haven't been created yet in your Supabase project.

---

## Solution - 2 Options

### Option 1: Using Supabase UI (Easiest) ✨

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `lucina-project-manager`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Copy & Paste SQL**
   - Open file: `DATABASE_SETUP.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor

4. **Run Query**
   - Click "Run" button (or Ctrl+Enter)
   - Wait for completion (should see "Success" message)
   - Check at bottom: "11 tables created"

5. **Verify Tables**
   - Go to "Table Editor" in sidebar
   - You should see: projects, topics, links, chat_conversations, chat_messages, generated_documents, story_recommendations, epics, stories, profiles, access_requests

---

### Option 2: Using Terminal (If you can connect)

```bash
# Navigate to project
cd C:\Dev\lucina-project-manager

# Set environment variables (PowerShell)
$env:DATABASE_URL='postgresql://postgres:XVkdk2qP6vUQ5TfH@db.vmctpgyzwqgsatgrsuqk.supabase.co:5432/postgres'
$env:DIRECT_URL='postgresql://postgres:XVkdk2qP6vUQ5TfH@db.vmctpgyzwqgsatgrsuqk.supabase.co:5432/postgres'

# Run migration
bun prisma migrate dev --name "init"

# This will create all tables automatically
```

---

## Recommended: Use Option 1 (Supabase UI)

### Step-by-Step with Screenshots

#### Step 1: Log into Supabase
```
https://supabase.com/dashboard
```

#### Step 2: Select Your Project
- Click on project name in list
- Or search for "lucina-project-manager"

#### Step 3: Open SQL Editor
```
Left Sidebar → SQL Editor → + New Query
```

#### Step 4: Copy SQL Setup Script
```
File: DATABASE_SETUP.sql (in project root)
```

#### Step 5: Paste into Editor
```
Control + V (paste all SQL)
```

#### Step 6: Execute Query
```
Press: Ctrl + Enter
Or click: Run button
```

#### Step 7: Verify Success
```
Look for: "Query executed successfully"
Tables created: 11
```

---

## What Gets Created

```
Tables (11 total):
✅ projects              - Main projects
✅ topics               - Documentation/wiki pages
✅ links                - Bookmarked URLs
✅ chat_conversations   - Chat threads
✅ chat_messages        - Individual messages
✅ generated_documents  - AI-generated docs
✅ story_recommendations - Azure DevOps recommendations
✅ epics                - Project epics
✅ stories              - User stories
✅ profiles             - User profiles
✅ access_requests      - Access requests

Indexes (12 total):
✅ Foreign key relationships
✅ Query optimization indexes
✅ Unique constraints

Triggers (7 total):
✅ Auto-update timestamps
```

---

## After Setup

### The App Will Now Work! 🎉

1. **Refresh your browser**
   ```
   http://localhost:3000
   ```

2. **Log in with your credentials**

3. **Create a project**
   - Go to Projects
   - Click "+ New Project"
   - Fill in details
   - Click "Create Project"
   - ✅ Project saved to database!

4. **All features now work**
   - Projects CRUD ✅
   - Documentation ✅
   - Links ✅
   - Chat (stub) ✅
   - AI Tools (stub) ✅

---

## Troubleshooting

### Error: "Invalid SQL Syntax"
- Check if entire SQL was pasted correctly
- Make sure no lines are missing
- Try copying the file again

### Error: "Column does not exist"
- Supabase might have an older version
- Clear browser cache and refresh
- Try running SQL again

### Error: "Permission denied"
- Make sure you have proper Supabase credentials
- Check that you own the project
- Try logging out and back in

### Error: "Connection timeout"
- Network might be having issues
- Try again in a few moments
- Check Supabase status page

---

## Next Steps After Database Setup

1. ✅ **Database created** - Tables exist
2. ✅ **Prisma client** - Already generated
3. ✅ **API routes** - Ready to work
4. ✅ **App** - Ready to use

---

## Files Reference

```
DATABASE_SETUP.sql          ← SQL script to run in Supabase
DATABASE_SETUP.md           ← Detailed setup guide
prisma/schema.prisma        ← Schema definition
prisma.config.ts            ← Prisma configuration
.env.local                  ← Database credentials
```

---

## Verify It Worked

After running the SQL:

1. Go to Supabase → Table Editor
2. Click on "projects" table
3. You should see empty table (0 rows)
4. Try creating a project in the app
5. Refresh Supabase Table Editor
6. You should see your new project!

---

## Current Status

| Component | Status |
|-----------|--------|
| Prisma Schema | ✅ Defined |
| Prisma Client | ✅ Generated |
| Configuration | ✅ Set up |
| Database Tables | ⏳ **Need to create** |
| API Routes | ✅ Ready |
| Frontend | ✅ Ready |

**Action Required**: Run the SQL script in Supabase UI

---

## Getting Help

If you have issues:

1. **Read**: DATABASE_SETUP.md
2. **Try**: Run SQL again
3. **Check**: Supabase Dashboard
4. **Verify**: .env.local credentials

---

**Time to Complete**: 2-5 minutes ⏱️

**Difficulty**: Easy 🟢

**Status**: Ready to execute

---

## Quick Command Reference

```powershell
# If you can connect directly:
$env:DATABASE_URL='postgresql://postgres:XVkdk2qP6vUQ5TfH@db.vmctpgyzwqgsatgrsuqk.supabase.co:5432/postgres'
$env:DIRECT_URL='postgresql://postgres:XVkdk2qP6vUQ5TfH@db.vmctpgyzwqgsatgrsuqk.supabase.co:5432/postgres'
bun prisma migrate dev --name "init"

# Or just generate the client (already done):
bun prisma generate

# Or check connection:
bun prisma db validate
```

---

## 🎯 Recommended Path

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Copy DATABASE_SETUP.sql content
4. Paste into SQL Editor
5. Click Run
6. Wait for success message
7. Refresh app
8. Create a project
9. Done! 🎉

---

**Next time you see the error**: Just run the SQL script and it goes away!

Your database will be ready to go. Happy building! 🚀

