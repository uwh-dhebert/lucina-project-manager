// This file is for reference only - actual Prisma configuration is in prisma/schema.prisma
// Database URL should be provided via DATABASE_URL environment variable

export const config = {
  schema: './prisma/schema.prisma',
  provider: 'postgresql',
  url: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
}

