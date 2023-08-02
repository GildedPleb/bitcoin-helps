import {
  type Affiliation,
  type AffiliationType,
  type ArgumentPrompt,
  type GenerateJob,
  type Issue,
  type IssueCategory,
  type JobStatus,
  type Language,
} from "@prisma/client";
import { GraphQLError } from "graphql";
import Handlebars from "handlebars";

import {
  databaseClient,
  getConnection,
  getStreamContent,
  type StreamContent,
} from "../../aws/dynamo";
import createSendMessage from "../../aws/gateway";
import awsInvoke from "../../aws/invoke";
import createPubSub, { type Gossip, type PubSub } from "../../aws/pubsub";
import { fetchGptResponseFull } from "../../open-ai/openai-api";
import { type Message } from "../types";

const topicPrefix = process.env.TOPIC_PREFIX ?? "dummy topic";

const INITIAL_BACKOFF_MS = 10;

const findUniqueJob = async (jobId: string) =>
  awsInvoke<GenerateJob | null>(
    process.env.FIND_JOB_BY_ID_FUNCTION_NAME,
    "RequestResponse",
    { jobId }
  );

const updateJob = async (jobId: string, state: JobStatus) =>
  awsInvoke<
    GenerateJob & {
      language: Language;
      issue: Issue & { issueCategory: IssueCategory };
      affiliation: Affiliation & { affiliationType: AffiliationType };
      argumentPrompt: ArgumentPrompt;
    }
  >(process.env.UPDATE_JOB_FUNCTION_NAME, "RequestResponse", { jobId, state });

const finalizeJob = async (
  job: GenerateJob,
  finalResult: string,
  cost: string
) =>
  awsInvoke(process.env.FINALIZE_JOB_FUNCTION_NAME, "RequestResponse", {
    job,
    finalResult,
    cost,
  });

interface Event {
  connectionId: string;
  jobId: string;
  awsRequestId: string;
  graphQLId: string;
}

const createUpdater = (
  sendMessage: (message: Message) => Promise<void>,
  id: string
) => {
  let count = -1;
  return async (message: string, type = "Update") => {
    count += 1;
    return sendMessage({
      type: "next",
      id,
      payload: {
        data: {
          subscribeToArgument: {
            type,
            message,
            sequence: count,
          },
        },
      },
    });
  };
};

const finishHandler = async (
  sendMessage: (message: Message) => Promise<void>,
  sendUpdate: (message: string, type?: string) => Promise<void>,
  pubSub: PubSub,
  graphQLId: string
) => {
  await sendUpdate("", "Finish");
  await sendMessage({ id: graphQLId, type: "complete" });
  await pubSub.unsubscribe();
};

const delay = async (ms: number) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise((resolve) => setTimeout(resolve, ms));

// Recursive function to retrieve content with exponential backoff
const retrieveMissedContent = async (
  streamId: string,
  sequence: number,
  retries = 0
): Promise<StreamContent[]> => {
  const missedContent = await getStreamContent(
    streamId,
    sequence,
    databaseClient
  );
  if (missedContent.length > 0) return missedContent;
  await delay(INITIAL_BACKOFF_MS * 2 ** retries);
  return retrieveMissedContent(streamId, sequence, retries + 1);
};

export const handler = async ({
  connectionId,
  jobId,
  awsRequestId,
  graphQLId,
}: Event) => {
  const job = await findUniqueJob(jobId);
  console.log("job:", job);

  const sendMessage = createSendMessage(connectionId);
  if (!job || job.status === "COMPLETED") {
    await sendMessage({
      type: "error",
      id: graphQLId,
      payload: [
        new GraphQLError(
          `Job ${jobId} does not exist, or has already completed.`
        ),
      ],
    });
    return;
  }
  if (job.status === "PENDING" && new Date(job.scheduledFor) > new Date()) {
    await sendMessage({
      type: "error",
      id: graphQLId,
      payload: [
        new GraphQLError(
          `Job ${jobId} is shceduled for ${new Date(
            job.scheduledFor
          ).toISOString()}, which has not occured yet.`
        ),
      ],
    });
    return;
  }

  console.log("Job looks good");
  const streamId = `${topicPrefix}:${jobId}`;
  const pubSub = createPubSub(streamId, awsRequestId);
  console.log("pubSub created");
  const sub = await pubSub.subscribe();
  console.log("Topic has been subscribed");

  const sendUpdate = createUpdater(sendMessage, graphQLId);
  if (job.status === "PROCESSING") {
    await sendUpdate("", "MissedContent");
    console.log("Awaiting prev stream...");

    // Get the first item in the subscription
    const a = (await sub[Symbol.asyncIterator]().next()) as { value: Gossip };
    const { sequence } = a.value;

    const missedContent = await retrieveMissedContent(streamId, sequence, 10);
    let fullMessage = "";
    for await (const item of missedContent) fullMessage += item.content;
    await sendUpdate(fullMessage);

    console.log("Prev items processed, sending new items.");

    for await (const payload of sub) {
      if (!(await getConnection(connectionId, databaseClient))) {
        console.log("No connection, skipping send.");
        break;
      }
      await sendUpdate(payload.message);
    }

    console.log("Prev stream finished");
    await finishHandler(sendMessage, sendUpdate, pubSub, graphQLId);
    return;
  }

  try {
    console.log("Creating new stream...");
    const fullJob = await updateJob(jobId, "PROCESSING");
    if (fullJob === undefined) throw new Error("Couldn't update the job.");
    const { affiliation, issue, language, argumentPrompt } = fullJob;

    const PopulatedPrompt = Handlebars.compile(argumentPrompt.content)({
      affiliationType: affiliation.affiliationType.name,
      affiliation: affiliation.name,
      issueCategory: issue.issueCategory.name,
      issue: issue.name,
      language: language.name,
      isNotEnglish: language.name !== "English" && language.name !== "en",
    });

    console.log("calling the AI");
    const finalResultPromise = fetchGptResponseFull(PopulatedPrompt, pubSub);
    console.log("Awaiting new streem...");
    for await (const payload of sub) {
      if (!(await getConnection(connectionId, databaseClient))) {
        console.log("No connection, skipping send.");
        break;
      }
      await sendUpdate(payload.message);
    }
    console.log("Streaming to client ended");
    await finishHandler(sendMessage, sendUpdate, pubSub, graphQLId);
    const finalResult = await finalResultPromise;
    console.log("New AI response finished");
    if (finalResult === undefined) throw new Error("AI generated nothing");
    else await finalizeJob(fullJob, finalResult.words, finalResult.id);
  } catch (error) {
    console.error(error);
    await updateJob(jobId, "PENDING");
  }
};

export default handler;
