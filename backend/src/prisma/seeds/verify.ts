import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const argumentPrompt = await prisma.argumentPrompt.findFirst();
  const languagePrompt = await prisma.languagePrompt.findFirst();
  if (!argumentPrompt) throw new Error("Missing argument prompt in database.");
  if (!languagePrompt) throw new Error("Missing language prompt in database.");
  console.log("All prompts verified successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
