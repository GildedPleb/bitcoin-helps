import prisma from "./context";

interface Event {
  invoiceId: string;
}

export const handler = async ({ invoiceId }: Event) =>
  prisma.albyInvoice.update({
    where: { id: invoiceId },
    data: { settled: true },
  });

export default handler;
