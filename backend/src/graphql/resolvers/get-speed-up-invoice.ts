import { type AlbyInvoice, type GenerateJob } from "@prisma/client";

import { createAlbyInvoiceV2 } from "../../alby";
import awsInvoke from "../../aws/invoke";
import { type Invoice } from "../../generated/graphql";

const findUniqueJob = async (jobId: string) =>
  awsInvoke<(GenerateJob & { invoice?: AlbyInvoice }) | null>(
    process.env.FIND_JOB_BY_ID_FUNCTION_NAME,
    "RequestResponse",
    { jobId }
  );

export type OmittedInvoice = Omit<
  AlbyInvoice,
  "updatedAt" | "id" | "generateJobId"
>;

const createInvoice = async (invoice: OmittedInvoice, jobId: string) =>
  awsInvoke(process.env.CREATE_INVOICE_FUNCTION_NAME, "Event", {
    invoice,
    jobId,
  });

export const getSpeedUpInvoice = async (
  _parent: unknown,
  { jobId }: { jobId: string }
): Promise<Invoice | undefined> => {
  const sats = Number(process.env.SPEEDUP_AMOUNT_SATS);
  if (Number.isNaN(sats))
    throw new Error("SPEEDUP_AMOUNT_SATS required to run");

  const job = await findUniqueJob(jobId);

  if (!job || job.status === "COMPLETED") {
    console.log("Job not found or already completed");
    return undefined;
  }

  console.log("job:", job);
  if (job.invoice !== undefined && new Date() < new Date(job.invoice.expiresAt))
    return {
      expiresAt: new Date(job.invoice.expiresAt).toISOString(),
      paymentRequest: job.invoice.paymentRequest,
      settled: job.invoice.settled,
    };

  if (job.invoice?.settled === true) {
    console.log(
      "Invoice already settled, and expired. This should never be hit, as it means the job should or can be completed, precluding this API call in the first place. But just in case..."
    );
    return undefined;
  }

  const invoice = await createAlbyInvoiceV2({
    satoshiAmount: sats,
    description: job.id,
  });

  if (!invoice) {
    console.error("Failed to create invoice");
    return undefined;
  }

  console.log("new invoice:", invoice);
  await createInvoice(invoice, job.id);

  return {
    expiresAt: new Date(invoice.expiresAt).toISOString(),
    paymentRequest: invoice.paymentRequest,
    settled: invoice.settled,
  };
};

export default getSpeedUpInvoice;
