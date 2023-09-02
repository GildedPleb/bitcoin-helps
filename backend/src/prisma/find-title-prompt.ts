import prisma from "./context";

export const handler = async () =>
  prisma.titlePrompt.findFirst({
    where: { name: "Basic" },
    orderBy: { version: "desc" },
  });

export default handler;
