import prisma from "./context";

interface Event {
  jobId: string;
}

export const handler = async ({ jobId }: Event) =>
  prisma.generateJob.findUnique({
    where: { id: jobId },
    include: {
      invoice: true,
    },
  });

export default handler;
