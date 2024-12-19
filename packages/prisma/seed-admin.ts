import { hashPassword } from "@calcom/features/auth/lib/hashPassword";
import { prisma } from "@calcom/prisma";

async function main() {
  const email = "admin@yourdomain.com"; // Replace with your email
  const hashedPassword = await hashPassword("your-secure-password"); // Replace with your password

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      username: "admin",
      email,
      password: hashedPassword,
      emailVerified: new Date(),
      completedOnboarding: true,
      locale: "en",
      role: "ADMIN",
    },
  });

  console.log(`Created admin user with email: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
