import prisma from "./context";

interface Event {
  id: number;
}

export const handler = async ({ id }: Event) =>
  prisma.argument.findFirst({
    where: {
      id,
    },
    include: {
      inputPair: {
        include: {
          arguments: true,
          language: true,
        },
      },
      generateJob: {
        include: {
          language: true,
        },
      },
    },
  });

export default handler;
