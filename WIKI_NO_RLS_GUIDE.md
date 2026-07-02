# Wiki Setup - NO RLS Version

You got an RLS error because Row Level Security was enabled on the subjects table.

## Solution: Use WIKI_RESTRUCTURE_NO_RLS.sql

### If Starting Fresh:

1. **File**: `WIKI_RESTRUCTURE_NO_RLS.sql` (in project root)
2. **Go to**: https://supabase.com/dashboard
3. **SQL Editor** → New Query
4. **Copy** entire file content
5. **Paste** into SQL editor
6. **Click Run**
7. **Refresh** your browser

---

## If You Already Have Tables with RLS Enabled:

Run this in Supabase SQL Editor:

```sql
-- Disable RLS on existing tables
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_items DISABLE ROW LEVEL SECURITY;
```

Then refresh your browser and try again.

---

## What's Included:

✅ Creates `subjects` table  
✅ Creates `content_items` table  
✅ Creates indexes for performance  
✅ **NO ROW LEVEL SECURITY** (RLS disabled)  
✅ Auto-update timestamps  
✅ Cascade delete relationships  

---

## After Setup:

1. Go to `/wiki`
2. Click "+ New Subject"
3. Create your first subject ✅
4. Add content items to subjects
5. Wiki is ready to use!

---

**Status**: Ready for setup  
**File**: WIKI_RESTRUCTURE_NO_RLS.sql  
**RLS**: Disabled  
**Time**: 5 minutes

