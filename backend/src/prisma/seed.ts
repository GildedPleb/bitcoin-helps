import { PrismaClient, Prisma } from "@prisma/client";
import { argumentPrompts, languagePrompts } from "../../prompts";

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  )
    return false;

  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1)
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;

  return true;
}

// TODO: Add validation

const prisma = new PrismaClient();

async function main() {
  for (const prompt of argumentPrompts) {
    const existingPrompt = await prisma.argumentPrompt.findFirst({
      where: { name: prompt.name },
      orderBy: { version: "desc" },
    });

    if (!existingPrompt) {
      await prisma.argumentPrompt.create({
        data: { ...prompt, version: 1 },
      });
      console.log("Seeded first argument prompt...", prompt.name);
    } else if (existingPrompt.content !== prompt.content) {
      await prisma.argumentPrompt.create({
        data: { ...prompt, version: existingPrompt.version + 1 },
      });
      console.log("Updated argument prompt...", prompt.name);
    }
  }

  for (const prompt of languagePrompts) {
    const existingPrompt = await prisma.languagePrompt.findFirst({
      where: { name: prompt.name },
      orderBy: { version: "desc" },
    });
    if (!existingPrompt) {
      await prisma.languagePrompt.create({
        data: { ...prompt, version: 1 },
      });
      console.log("Seeded first language prompt...", prompt.name);
      return;
    }
    const { id, version, createdAt, updatedAt, ...existingPromptParsed } =
      existingPrompt;
    if (!deepEqual(existingPromptParsed, prompt)) {
      await prisma.languagePrompt.create({
        data: { ...prompt, version: version + 1 },
      });
      console.log("Updated language prompt...", prompt.name);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Prompts processed successfully!");
    await prisma.$disconnect();
  });
