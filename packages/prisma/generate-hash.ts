import { hashPassword } from "@calcom/features/auth/lib/hashPassword";

async function generateHash() {
  const password = "your-password-here";
  const hash = await hashPassword(password);
  console.log("Hashed password:", hash);
}

generateHash();
