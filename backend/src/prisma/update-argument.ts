import prisma from "./context";

interface Event {
  argumentId: number;
  title: string;
  subtitle: string;
  titlePromptId: string;
}

export const handler = async ({
  argumentId,
  title,
  subtitle,
  titlePromptId,
}: Event) =>
  prisma.argument.update({
    where: { id: argumentId },
    data: {
      title,
      subtitle,
      titlePrompt: {
        connect: { id: titlePromptId },
      },
    },
  });

export default handler;
