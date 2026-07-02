#!/usr/bin/env bun

import { execSync } from 'child_process'

console.log('🚀 Lucina Database Setup\n')

try {
  console.log('📊 Attempting to initialize database...\n')

  // Try to run prisma db push
  execSync('prisma db push', {
    stdio: 'inherit',
  })

  console.log('\n✅ Database setup complete!\n')
  console.log('🎉 Your database is ready to use!')
  console.log('   Start your app with: bun dev\n')

} catch (error: any) {
  // Check if it's a connection error
  if (error.message?.includes("Can't reach database server") ||
      error.stdout?.includes("Can't reach database server")) {

    console.log('\n⚠️  Database Connection Failed\n')
    console.log('This is likely due to network/firewall restrictions.\n')
    console.log('🔧 No problem! Here are your alternatives:\n')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('OPTION 1: Use Supabase Dashboard (Recommended)')
    console.log('─────────────────────────────────────────────')
    console.log('1. Go to: https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. SQL Editor → New Query')
    console.log('4. Copy all content from DATABASE_SETUP.sql')
    console.log('5. Paste and Run\n')

    console.log('OPTION 2: Continue Development')
    console.log('─────────────────────────────')
    console.log('1. Run: bun dev')
    console.log('2. The app will show a setup page')
    console.log('3. You\'ll have options to initialize there')
    console.log('4. (Same as Option 1, from within the app)\n')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('📝 What you need:')
    console.log('   • DATABASE_SETUP.sql (in your project root)\n')

    console.log('💡 After setting up the database:')
    console.log('   Run: bun dev')
    console.log('   The app will detect the database and work normally\n')

    console.log('🚀 You can still start development right now:')
    console.log('   bun dev')
    console.log('   (The setup page will guide you through initialization)\n')

  } else {
    // Some other error
    console.error('\n❌ Setup failed\n')
    console.error('Error:', error.message, '\n')
    console.error('Troubleshooting:')
    console.error('1. Check DATABASE_URL in .env.local')
    console.error('2. Verify Supabase credentials')
    console.error('3. Try using Supabase Dashboard SQL Editor instead\n')
  }

  process.exit(0)  // Exit gracefully even if db connection fails
}


