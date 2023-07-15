import { JobStatus } from "@prisma/client";
import prisma from "./context";

interface Event {
  jobId: string;
  state: JobStatus;
}

export const handler = async ({ jobId, state }: Event) =>
  prisma.generateJob.update({
    where: { id: jobId },
    data: { status: state },
    include: {
      affiliation: { include: { affiliationType: true } },
      issue: { include: { issueCategory: true } },
      language: true,
      argumentPrompt: true,
    },
  });

export default handler;
