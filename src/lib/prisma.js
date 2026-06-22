import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
  })

// همیشه کش کن — روی Vercel (serverless) بدون این کار هر درخواست یک کانکشن جدید می‌سازد
globalForPrisma.prisma = prisma
