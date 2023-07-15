import prisma from "./context";

interface Event {
  language: string;
}

export const handler = async ({ language }: Event) =>
  prisma.language.findUnique({
    where: { name: language },
    include: {
      issueCategories: {
        select: {
          name: true,
          issues: true,
        },
      },
      affiliationTypes: {
        select: {
          name: true,
          affiliations: true,
        },
      },
    },
  });

export default handler;
