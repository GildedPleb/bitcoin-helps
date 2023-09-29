import crypto from "node:crypto";

import { Invoice } from "@getalby/lightning-tools";
import { type AlbyInvoice, type GenerateJob } from "@prisma/client";

import {
  databaseClient,
  deleteSubscription,
  getSubscription,
} from "../aws/dynamo";
import createSendMessage from "../aws/gateway";
import awsInvoke from "../aws/invoke";

interface InvoiceBody {
  amount: number;
  boostagram: null;
  comment: string;
  created_at: string;
  creation_date: null;
  currency: string;
  custom_records: null;
  description_hash: string;
  expires_at: null;
  expiry: number;
  fiat_currency: string;
  fiat_in_cents: number;
  identifier: string;
  keysend_message: null;
  memo: null;
  metadata: Record<string, unknown>;
  payer_email: null;
  payer_name: null;
  payer_pubkey: null;
  payment_hash: string;
  payment_request: string;
  r_hash_str: string;
  settled: boolean;
  settled_at: string;
  state: string;
  type: string;
  value: number;
}

const topicPrefixInvoice = process.env.TOPIC_PREFIX_INVOICE ?? "dummy topic";

const findUniqueJob = async (jobId: string) =>
  awsInvoke<(GenerateJob & { invoice?: AlbyInvoice }) | null>(
    process.env.FIND_JOB_BY_ID_FN,
    "RequestResponse",
    { jobId }
  );

const updateJob = async (jobId: string) =>
  awsInvoke(process.env.UPDATE_JOB_FN, "RequestResponse", {
    jobId,
    paid: true,
  });

const updateInvoice = async (invoiceId: string) =>
  awsInvoke(process.env.UPDATE_INVOICE_FN, "RequestResponse", {
    invoiceId,
  });

export const handler = async (data: { body: string }) => {
  console.log("Alby invoice settled", data);

  const whSecret = process.env.WH_SECRET;
  if (whSecret === undefined || whSecret === "")
    throw new Error("WH_SECRET required to run");
  const sats = Number(process.env.SPEEDUP_AMOUNT_SATS);
  if (Number.isNaN(sats))
    throw new Error("SPEEDUP_AMOUNT_SATS required to run");
  const stage = process.env.STAGE;
  if (stage === undefined || stage === "")
    throw new Error("STAGE required to run");

  const body = JSON.parse(data.body) as InvoiceBody;
  const [service, jobId, commentHash] = body.comment.split("/");

  if (service !== stage) {
    console.error("MissMatched stage", data);
    return;
  }

  const stringToHash = `${service}/${jobId}/${whSecret}`;

  const hashBuffer = crypto.createHash("sha256").update(stringToHash).digest();
  const commentHashBuffer = Buffer.from(commentHash, "hex");

  if (hashBuffer.length !== commentHashBuffer.length) {
    console.error("Request failed verification on length", data);
    return;
  }

  // Check if the hash matches what was sent in the comment
  if (!crypto.timingSafeEqual(hashBuffer, commentHashBuffer)) {
    console.error("Request failed verification on value", data);
    return;
  }

  if (body.value < sats) {
    console.error("Request failed verification on not enough sats", data);
    return;
  }

  if (body.state !== "SETTLED") {
    console.error("State not settled", data);
    return;
  }
  console.log("Invoice passed initial validation. Verifying if paid...");

  const job = await findUniqueJob(jobId);

  if (!job || job.status === "COMPLETED") {
    console.log("Job not found or already completed");
    return;
  }

  if (!job.invoice) {
    console.log(
      "Job found but it doesnt have an associated invoice... we should never hit this"
    );
    return;
  }

  const invoice = new Invoice({
    pr: body.payment_request,
    verify: job.invoice.verify,
  });

  if (!(await invoice.isPaid())) {
    console.log(
      "Invoice verification failed: has not been paid according to Alby"
    );
    return;
  }
  console.log("Yeah! Invoice paid, releasing job...");

  await updateJob(jobId);
  console.log("Job released");

  await updateInvoice(job.invoice.id);
  console.log("Invoice Updated");

  const topic = `${topicPrefixInvoice}:${jobId}`;

  console.log(`Topic: ${topic}`);

  const subscribers = await getSubscription(topic, databaseClient);

  console.log(`Subscribers: ${JSON.stringify(subscribers)}`);

  // Send the message to all subscribers
  const promises = subscribers.map(async ({ connectionId, subscriptionId }) => {
    console.log(
      `Processing subscriber with connectionId: ${connectionId}, subscriptionId: ${subscriptionId}`
    );

    const sendMessage = createSendMessage(connectionId);
    return sendMessage({
      id: subscriptionId,
      type: "next",
      payload: {
        data: {
          subscribeToInvoice: {
            message: jobId,
            type: "paid",
          },
        },
      },
    }).then(async () => {
      console.log(
        `Message sent for subscriptionId: ${subscriptionId}, type: next`
      );

      return sendMessage({ id: subscriptionId, type: "complete" });
    });
  });
  await Promise.all(promises);
  console.log("All messages sent to subscribers.");

  // Optionally delete the subscriptions if no longer needed
  await deleteSubscription(topic, databaseClient);
  console.log("Subscriptions deleted.");
};

export default handler;
