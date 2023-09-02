import prisma from "./context";
import { OmittedInvoice } from "../graphql/resolvers/get-speed-up-invoice";

interface Event {
  invoice: OmittedInvoice;
  jobId: string;
}

export const handler = async ({ invoice, jobId }: Event) => {
  // Find the existing invoice connected to the job
  const existingInvoice = await prisma.generateJob.findUnique({
    where: { id: jobId },
    select: { invoice: true },
  });

  // Disconnect the existing relationship if there's one
  if (existingInvoice?.invoice) {
    await prisma.generateJob.update({
      where: { id: jobId },
      data: {
        invoice: {
          disconnect: true,
        },
      },
    });
  }

  // Create and connect the new invoice
  return prisma.albyInvoice.create({
    data: {
      ...invoice,
      generateJob: {
        connect: {
          id: jobId,
        },
      },
    },
  });
};

export default handler;
