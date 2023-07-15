import prisma from "./context";

interface Event {
  languageId: string;
  issueId: string;
  affiliationId: string;
}

export const handler = async ({ languageId, issueId, affiliationId }: Event) =>
  prisma.generateJob.findUnique({
    where: {
      issueId_affiliationId_languageId: {
        languageId,
        issueId,
        affiliationId,
      },
    },
  });

export default handler;
