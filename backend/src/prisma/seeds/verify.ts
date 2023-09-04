import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const language = await prisma.language.findFirst();
  const languagePrompt = await prisma.languagePrompt.findFirst({
    orderBy: { version: "desc" },
  });
  const argumentPrompt = await prisma.argumentPrompt.findFirst();

  if (!argumentPrompt) throw new Error("Missing argument prompt in database.");
  if (!languagePrompt) throw new Error("Missing language prompt in database.");
  if (!language) throw new Error("Missing language in database.");

  const LTK = Object.keys(language.translations || {});
  const LPEK = Object.keys(
    (languagePrompt.translationExample as { example: { [x: string]: string } })
      .example || {}
  );

  if (
    !LTK.every((key) => LPEK.includes(key)) ||
    !LPEK.every((key) => LTK.includes(key))
  ) {
    console.log({ LTK, LPEK });
    throw new Error(
      "Translation keys do not match between language and languagePrompt. Ensure that you have run BOTH 'update-translations-{stage}' and 'update-prompt-{stage}' before deploying"
    );
  }

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
