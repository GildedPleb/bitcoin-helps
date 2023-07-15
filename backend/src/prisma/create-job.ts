import prisma from "./context";

interface Event {
  languageId: string;
  issueId: string;
  affiliationId: string;
  promptId: string;
}

export const handler = async ({
  languageId,
  issueId,
  affiliationId,
  promptId,
}: Event) =>
  prisma.generateJob.create({
    data: {
      language: {
        connect: {
          id: languageId,
        },
      },
      issue: {
        connect: {
          id: issueId,
        },
      },
      affiliation: {
        connect: {
          id: affiliationId,
        },
      },
      argument: {
        create: {
          content: "",
        },
      },
      argumentPrompt: {
        connect: {
          id: promptId,
        },
      },
    },
  });

export default handler;
