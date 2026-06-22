const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 شروع seed کردن دیتابیس...")

  // هش کردن رمز عبور پیش‌فرض
  const hashedPassword = await bcrypt.hash("12345678", 10)

  // ایجاد کاربران با نقش‌های مختلف
  const admin = await prisma.user.upsert({
    where: { email: "admin@content.ir" },
    update: {},
    create: {
      name: "مدیر ارشد",
      email: "admin@content.ir",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: "manager@content.ir" },
    update: {},
    create: {
      name: "مدیر محتوا",
      email: "manager@content.ir",
      password: hashedPassword,
      role: "CONTENT_MANAGER",
    },
  })

  const writer = await prisma.user.upsert({
    where: { email: "writer@content.ir" },
    update: {},
    create: {
      name: "نویسنده محتوا",
      email: "writer@content.ir",
      password: hashedPassword,
      role: "WRITER",
    },
  })

  const publisher = await prisma.user.upsert({
    where: { email: "publisher@content.ir" },
    update: {},
    create: {
      name: "منتشرکننده محتوا",
      email: "publisher@content.ir",
      password: hashedPassword,
      role: "PUBLISHER",
    },
  })

  console.log("✅ کاربران ایجاد شدند:")
  console.log("   مدیر ارشد: admin@content.ir / 12345678")
  console.log("   مدیر محتوا: manager@content.ir / 12345678")
  console.log("   نویسنده: writer@content.ir / 12345678")
  console.log("   منتشرکننده: publisher@content.ir / 12345678")

  // ایجاد کلاسترهای معنایی نمونه
  const cluster1 = await prisma.semanticCluster.create({
    data: {
      name: "دیجیتال مارکتینگ",
      description: "مجموعه مقالات مربوط به بازاریابی دیجیتال",
      color: "#6366f1",
    },
  })

  const cluster2 = await prisma.semanticCluster.create({
    data: {
      name: "سئو و تولید محتوا",
      description: "مقالات مرتبط با بهینه‌سازی موتورهای جستجو",
      color: "#ec4899",
    },
  })

  // کلمات کلیدی نمونه
  await prisma.keyword.createMany({
    data: [
      { term: "بازاریابی دیجیتال", clusterId: cluster1.id, searchVolume: 12000, difficulty: "HIGH" },
      { term: "تبلیغات آنلاین", clusterId: cluster1.id, searchVolume: 8000, difficulty: "MEDIUM" },
      { term: "سئو سایت", clusterId: cluster2.id, searchVolume: 22000, difficulty: "HIGH" },
      { term: "تولید محتوا", clusterId: cluster2.id, searchVolume: 15000, difficulty: "MEDIUM" },
    ],
  })

  // تنظیمات سیستم
  await prisma.systemSetting.create({
    data: { key: "app_name", value: "پلتفرم مدیریت محتوا" },
  })

  console.log("✅ کلاسترها و کلمات کلیدی نمونه ایجاد شدند")
  console.log("🎉 seed کامل شد!")
}

main()
  .catch((e) => {
    console.error("❌ خطا در seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
