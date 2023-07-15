import prisma from "./context";

interface Event {
  languageId: string;
  issueId: string;
  affiliationId: string;
}

export const handler = async ({ languageId, issueId, affiliationId }: Event) =>
  prisma.inputPair.findFirst({
    where: {
      languageId,
      issueId,
      affiliationId,
    },
    include: {
      arguments: true,
    },
  });

export default handler;
