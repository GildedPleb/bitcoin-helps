import prisma from "./context";

interface Event {
  id: number;
  like: boolean;
}

export const handler = async ({ id, like }: Event) => {
  const argument = await prisma.argument.findUnique({
    where: {
      id,
    },
  });
  if (!argument) return;
  return await prisma.argument.update({
    where: {
      id,
    },
    data: {
      ...(like
        ? { like: argument.like + 1 }
        : { dislike: argument.dislike + 1 }),
    },
  });
};

export default handler;
