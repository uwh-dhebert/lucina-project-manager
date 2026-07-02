# Wiki Structure - Topics → Subjects → Content Items

## 📊 Hierarchy

```
Topic (Top Level)
├── Subject 1
│   ├── Content Item (optional title/header)
│   └── Content Item (optional title/header)
└── Subject 2
    ├── Content Item (optional title/header)
    └── Content Item (optional title/header)
```

---

## 🗄️ Database Schema

### Topics Table
- `id` - UUID (primary key)
- `title` - Topic name (e.g., "API Documentation")
- `slug` - URL-friendly name (auto-generated)
- `order` - Display order
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Subjects Table
- `id` - UUID (primary key)
- `topicId` - Foreign key to Topics
- `title` - Subject name (e.g., "Authentication")
- `slug` - Unique per topic
- `order` - Display order within topic
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Content Items Table
- `id` - UUID (primary key)
- `subjectId` - Foreign key to Subjects
- `title` - Optional header/title
- `content` - The actual content (text)
- `order` - Display order within subject
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

---

## 🚀 Setup Instructions

### Use WIKI_RESTRUCTURE_NO_RLS.sql

1. Go to: https://supabase.com/dashboard
2. SQL Editor → New Query
3. Copy entire `WIKI_RESTRUCTURE_NO_RLS.sql` file
4. Paste into editor
5. Click Run
6. Refresh browser

---

## 💡 Example Structure

```
Topic: "Getting Started"
├── Subject: "Installation"
│   ├── Content: "Prerequisites"
│   └── Content: "Installation Steps"
├── Subject: "Configuration"
│   └── Content: "Environment Variables"
└── Subject: "First Project"
    ├── Content: "Creating a Project"
    └── Content: "Running Your First Build"
```

---

## 🎯 Usage Flow

### Create a Topic
1. Go to `/wiki`
2. Click "+ New Topic"
3. Fill in title and description
4. Submit

### Add Subjects to Topic
1. Click on a topic to view it
2. Click "+ Add Subject"
3. Enter subject title
4. Submit

### Add Content Items to Subject
1. Open a subject
2. Click "+ Add Content"
3. Enter content (with optional title/header)
4. Submit

---

## 📝 Features

✅ **Three-level hierarchy** - Topics > Subjects > Content  
✅ **Optional headers** - Content items can have optional titles  
✅ **Auto-slugs** - URLs generated automatically  
✅ **Ordering** - Control display order at each level  
✅ **Cascading delete** - Deleting topic removes all subjects and content  
✅ **No RLS** - Simpler permissions, full access for authenticated users  
✅ **Timestamps** - Auto-tracked creation and update times  

---

## 🔗 API Endpoints

```
GET    /api/wiki              - Get all topics with hierarchy
POST   /api/wiki              - Create new topic

GET    /api/wiki/subject      - Get all subjects
POST   /api/wiki/subject      - Create new subject

GET    /api/wiki/content      - Get all content items
POST   /api/wiki/content      - Create new content item

PATCH  /api/wiki/{id}         - Update topic/subject
DELETE /api/wiki/{id}         - Delete topic/subject/content
```

---

## 📱 User Interface

### Wiki Page (`/wiki`)
- Lists all topics
- Shows subject count
- Shows subject preview with content count
- "+ New Topic" button

### Topic Detail Page (`/wiki/{slug}`)
- Shows all subjects
- Shows content items within each subject
- "+ Add Subject" button
- Edit/Delete topic buttons

### Subject Detail Page (`/wiki/{topicSlug}/{subjectSlug}`)
- Shows all content items
- Displays optional titles/headers
- "+ Add Content" button
- Edit/Delete subject buttons

### Content Item Display
- Shows optional title/header
- Shows full content text
- Edit/Delete item buttons

---

## ✨ Next Steps

1. **Run SQL migration** - WIKI_RESTRUCTURE_NO_RLS.sql
2. **Restart dev server** - `bun dev`
3. **Go to /wiki** - Start creating topics!
4. **Create a topic** - Test the flow
5. **Add subjects** - Build your structure
6. **Add content** - Fill in your documentation

---

**Status**: Ready to implement  
**Structure**: Topics → Subjects → Content Items  
**Database**: Supabase PostgreSQL  
**Relationships**: Full hierarchy with cascading  
**Security**: No RLS (full access)

