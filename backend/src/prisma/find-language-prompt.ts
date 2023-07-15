import prisma from "./context";

export const handler = async () =>
  prisma.languagePrompt.findFirst({
    where: { name: "Language Prompt 1" },
    orderBy: { version: "desc" },
  });

export default handler;
