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
          id: true,
          name: true,
          issues: true,
        },
      },
      affiliationTypes: {
        select: {
          id: true,
          name: true,
          affiliations: true,
        },
      },
    },
  });

export default handler;
