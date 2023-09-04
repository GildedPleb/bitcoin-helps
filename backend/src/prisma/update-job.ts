import { JobStatus } from "@prisma/client";
import prisma from "./context";

interface Event {
  jobId: string;
  state?: JobStatus;
  paid?: boolean;
}

export const handler = async ({ jobId, state, paid }: Event) =>
  prisma.generateJob.update({
    where: { id: jobId },
    data: {
      ...(state && { status: state }),
      ...(paid && { scheduledFor: new Date().toISOString() }),
    },
    include: {
      affiliation: { include: { affiliationType: true } },
      issue: { include: { issueCategory: true } },
      language: true,
      argumentPrompt: true,
    },
  });

export default handler;
