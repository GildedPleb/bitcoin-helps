import { GenerateJob } from "@prisma/client";
import prisma from "./context";

interface Event {
  job: GenerateJob;
  finalResult: string;
  cost: string;
}

export const handler = async ({ job, finalResult, cost }: Event) => {
  const updatedArgument = await prisma.argument.update({
    where: { id: job.argumentId },
    data: { content: finalResult },
  });
  await prisma.inputPair.upsert({
    where: {
      issueId_affiliationId_languageId: {
        languageId: job.languageId,
        issueId: job.issueId,
        affiliationId: job.affiliationId,
      },
    },
    create: {
      languageId: job.languageId,
      issueId: job.issueId,
      affiliationId: job.affiliationId,
      arguments: { connect: { id: updatedArgument.id } },
    },
    update: { arguments: { connect: { id: updatedArgument.id } } },
    include: { arguments: true },
  });
  await prisma.generateJob.update({
    where: { id: job.id },
    data: {
      status: "COMPLETED",
      openAICall: {
        connect: { id: cost },
      },
    },
  });
};

export default handler;
