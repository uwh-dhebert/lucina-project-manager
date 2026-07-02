#!/usr/bin/env bun

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

console.log('🚀 Lucina Database Setup\n')

// Read .env.local
const envPath = path.join(import.meta.dir, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}

envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...rest] = trimmed.split('=')
    const value = rest.join('=').replace(/^"|"$/g, '')
    env[key.trim()] = value
  }
})

const DATABASE_URL = env.DATABASE_URL
const DIRECT_URL = env.DIRECT_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local')
  process.exit(1)
}

console.log('📊 Connecting to Supabase database...')
console.log(`   Database: ${DATABASE_URL.split('@')[1]?.split(':')[0]}\n`)

// Read SQL file
const sqlPath = path.join(import.meta.dir, '..', 'DATABASE_SETUP.sql')

if (!fs.existsSync(sqlPath)) {
  console.error('❌ DATABASE_SETUP.sql not found')
  process.exit(1)
}

const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

try {
  console.log('⏳ Creating database tables...\n')

  // Use psql to execute SQL
  const psqlCommand = `psql "${DIRECT_URL || DATABASE_URL}" -f "${sqlPath}"`

  const result = execSync(psqlCommand, {
    encoding: 'utf-8',
    stdio: 'pipe',
  })

  console.log('✅ Database setup complete!\n')
  console.log('📚 Tables created:')
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
  console.log('\n🎉 Ready to use!')
  console.log('   Refresh your browser and start creating projects!\n')
} catch (error: any) {
  if (error.message.includes('already exists')) {
    console.log('✅ Tables already exist!\n')
    console.log('🎉 Database is ready to use.')
    console.log('   Refresh your browser and start creating projects!\n')
  } else if (error.message.includes('permission denied')) {
    console.error(
      '❌ Permission denied. Possible issues:\n' +
      '   1. Database credentials are wrong\n' +
      '   2. User doesn\'t have CREATE permission\n' +
      '   3. Try using Supabase UI instead\n\n' +
      '💡 Alternative: Use Supabase Dashboard SQL Editor\n' +
      '   1. Go to https://supabase.com/dashboard\n' +
      '   2. Open SQL Editor → New Query\n' +
      '   3. Copy all content from DATABASE_SETUP.sql\n' +
      '   4. Paste and run\n'
    )
  } else if (error.message.includes('connect ECONNREFUSED')) {
    console.error(
      '❌ Connection refused. Possible issues:\n' +
      '   1. Supabase database is not accessible from your network\n' +
      '   2. Firewall/VPN is blocking the connection\n' +
      '   3. Database credentials are wrong\n\n' +
      '💡 Alternative: Use Supabase Dashboard SQL Editor\n' +
      '   1. Go to https://supabase.com/dashboard\n' +
      '   2. Open SQL Editor → New Query\n' +
      '   3. Copy all content from DATABASE_SETUP.sql\n' +
      '   4. Paste and run\n'
    )
  } else {
    console.error('❌ Setup failed:', error.message)
    console.error('\n💡 Try using Supabase Dashboard SQL Editor instead:\n' +
      '   1. Go to https://supabase.com/dashboard\n' +
      '   2. Open SQL Editor → New Query\n' +
      '   3. Copy DATABASE_SETUP.sql content\n' +
      '   4. Paste and run\n'
    )
  }
  process.exit(1)
}

