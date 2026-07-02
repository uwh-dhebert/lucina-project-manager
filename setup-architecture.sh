#!/bin/bash

# Lucina Project Manager - Architecture Setup Script
# This script sets up the Clean Architecture + DDD structure

echo "🏗️  Lucina Project Manager - Architecture Setup"
echo "=================================================="

# Install dependencies
echo "📦 Installing dependencies..."
bun add \
  xai \
  zod \
  tsyringe \
  reflect-metadata \
  azure-devops-node-api \
  @monaco-editor/react \
  monaco-editor

# Dev dependencies
bun add -D \
  @types/xai

echo ""
echo "🗄️  Running database migration..."
bun prisma migrate dev --name "add_ddd_architecture"

echo ""
echo "🔧 Generating Prisma client..."
bun prisma generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with XAI and Azure DevOps credentials"
echo "2. Review IMPLEMENTATION_ROADMAP.md for detailed guidance"
echo "3. Create remaining repository implementations"
echo "4. Implement API routes"
echo "5. Build React components"
echo ""
echo "📚 Documentation files created:"
echo "   - PROJECT_ARCHITECTURE.md"
echo "   - IMPLEMENTATION_ROADMAP.md"

