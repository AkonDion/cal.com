import { hashPassword } from "@calcom/features/auth/lib/hashPassword";
import { prisma } from "@calcom/prisma";

async function main() {
  const email = "admin@example.com"; // Replace with your email
  const password = "your-secure-password"; // Replace with your password

  const hashedPassword = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        username: "admin",
        password: hashedPassword,
        emailVerified: new Date(),
        completedOnboarding: true,
        locale: "en",
        role: "ADMIN",
        name: "Admin User",
      },
    });

    console.log("Created admin user:", user);
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
