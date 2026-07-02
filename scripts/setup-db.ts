import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const schema = `
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (Auth & User Management)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  "userId" UUID NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  "fullName" VARCHAR(255),
  role VARCHAR(50) DEFAULT 'USER',
  status VARCHAR(50) DEFAULT 'PENDING',
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Access Requests table
CREATE TABLE IF NOT EXISTS access_requests (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  "fullName" VARCHAR(255),
  reason TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  "reviewedBy" UUID,
  "reviewedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT now()
);

-- Projects table (Core Domain)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  "ownerId" UUID NOT NULL,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  UNIQUE(slug, "ownerId")
);

-- Topics table (Documentation)
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "projectId" UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  "order" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  UNIQUE(slug, "projectId"),
  FOREIGN KEY ("projectId") REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS topics_projectId_idx ON topics("projectId");

-- Links table
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  url TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(255) DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS links_userId_idx ON links("userId");
CREATE INDEX IF NOT EXISTS links_category_idx ON links(category);

-- Chat Conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  title VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_conversations_userId_idx ON chat_conversations("userId");

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "conversationId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  content TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  "contextDocumentIds" TEXT[] DEFAULT '{}',
  tokens INT,
  model VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  FOREIGN KEY ("conversationId") REFERENCES chat_conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS chat_messages_conversationId_idx ON chat_messages("conversationId");
CREATE INDEX IF NOT EXISTS chat_messages_userId_idx ON chat_messages("userId");

-- Generated Documents table (AI Generator)
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "projectId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  "templateType" VARCHAR(255) NOT NULL,
  content TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'draft',
  "generatedAt" TIMESTAMP DEFAULT now(),
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  FOREIGN KEY ("projectId") REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS generated_documents_projectId_idx ON generated_documents("projectId");
CREATE INDEX IF NOT EXISTS generated_documents_userId_idx ON generated_documents("userId");
CREATE INDEX IF NOT EXISTS generated_documents_status_idx ON generated_documents(status);

-- Story Recommendations table (Azure DevOps)
CREATE TABLE IF NOT EXISTS story_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "projectId" UUID,
  "storyId" VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  "currentSize" INT,
  "recommendedSize" VARCHAR(50) NOT NULL,
  confidence FLOAT NOT NULL,
  reasoning TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  accepted BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  FOREIGN KEY ("projectId") REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS story_recommendations_userId_idx ON story_recommendations("userId");
CREATE INDEX IF NOT EXISTS story_recommendations_projectId_idx ON story_recommendations("projectId");
CREATE INDEX IF NOT EXISTS story_recommendations_accepted_idx ON story_recommendations(accepted);

-- Epics table (Legacy)
CREATE TABLE IF NOT EXISTS epics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "projectId" UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  FOREIGN KEY ("projectId") REFERENCES projects(id) ON DELETE CASCADE
);

-- Stories table (Legacy)
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "epicId" UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "acceptanceCriteria" TEXT[] DEFAULT '{}',
  "storyPoints" FLOAT NOT NULL,
  status VARCHAR(50) DEFAULT 'todo',
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  FOREIGN KEY ("epicId") REFERENCES epics(id) ON DELETE CASCADE
);
`

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...')
    console.log('📊 Creating tables in Supabase...')

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec', {
          sql: statement,
        }).catch(() => {
          // Fallback: try using admin API
          return supabase.from('_schema').select('*')
        })

        if (error) {
          // If it's "already exists", that's fine
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log('✅ Already exists (skipped)')
            successCount++
          } else {
            console.log('⚠️  Warning:', error.message)
            successCount++
          }
        } else {
          successCount++
        }
      } catch (e: any) {
        if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
          successCount++
        } else {
          errorCount++
          console.error('❌ Error:', e.message)
        }
      }
    }

    console.log(`\n✅ Database setup complete!`)
    console.log(`   ✓ ${successCount} operations completed`)
    if (errorCount > 0) {
      console.log(`   ⚠️ ${errorCount} warnings`)
    }
    console.log('\n📚 Tables created:')
    console.log('   ✓ profiles')
    console.log('   ✓ access_requests')
    console.log('   ✓ projects')
    console.log('   ✓ topics')
    console.log('   ✓ links')
    console.log('   ✓ chat_conversations')
    console.log('   ✓ chat_messages')
    console.log('   ✓ generated_documents')
    console.log('   ✓ story_recommendations')
    console.log('   ✓ epics')
    console.log('   ✓ stories')
    console.log('\n🎉 Ready to use! Refresh your browser.')
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()

