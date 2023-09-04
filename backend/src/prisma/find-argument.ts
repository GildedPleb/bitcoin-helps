import prisma from "./context";

interface Event {
  id: number;
}

export const handler = async ({ id }: Event) =>
  prisma.argument.findFirst({
    where: { id },
    include: {
      titlePrompt: true,
      inputPair: {
        include: {
          arguments: true,
          language: true,
          issue: {
            include: {
              issueCategory: true,
            },
          },
          affiliation: {
            include: {
              affiliationType: true,
            },
          },
        },
      },
      generateJob: {
        include: {
          language: true,
          issue: {
            include: {
              issueCategory: true,
            },
          },
          affiliation: {
            include: {
              affiliationType: true,
            },
          },
        },
      },
    },
  });

export default handler;
