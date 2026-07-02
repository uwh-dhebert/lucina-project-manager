# Lucina Project Manager - Architecture Setup Script (Windows PowerShell)
# This script sets up the Clean Architecture + DDD structure

Write-Host "🏗️  Lucina Project Manager - Architecture Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
$dependencies = @(
    "xai",
    "zod",
    "tsyringe",
    "reflect-metadata",
    "azure-devops-node-api",
    "@monaco-editor/react",
    "monaco-editor"
)

foreach ($dep in $dependencies) {
    Write-Host "  Installing $dep..." -ForegroundColor Gray
    & bun add $dep
}

# Dev dependencies
Write-Host "`n📦 Installing dev dependencies..." -ForegroundColor Yellow
$devDeps = @(
    "@types/xai"
)

foreach ($dep in $devDeps) {
    Write-Host "  Installing $dep..." -ForegroundColor Gray
    & bun add -D $dep
}

# Database migration
Write-Host "`n🗄️  Running database migration..." -ForegroundColor Yellow
& bun prisma migrate dev --name "add_ddd_architecture"

# Generate Prisma client
Write-Host "`n🔧 Generating Prisma client..." -ForegroundColor Yellow
& bun prisma generate

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with XAI and Azure DevOps credentials"
Write-Host "2. Review IMPLEMENTATION_ROADMAP.md for detailed guidance"
Write-Host "3. Create remaining repository implementations"
Write-Host "4. Implement API routes"
Write-Host "5. Build React components"
Write-Host ""
Write-Host "📚 Documentation files created:" -ForegroundColor Cyan
Write-Host "   - PROJECT_ARCHITECTURE.md"
Write-Host "   - IMPLEMENTATION_ROADMAP.md"

