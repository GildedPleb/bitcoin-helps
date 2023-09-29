import {
  type Argument,
  type GenerateJob,
  type InputPair,
  type Language,
} from "@prisma/client";

import { cacheTitle, databaseClient, getTitle } from "../../aws/dynamo";
import awsInvoke from "../../aws/invoke";
import { type ArugmentRoute } from "../../generated/graphql";
import { backoffGenerator } from "../../helpers";

interface IdParameter {
  id: number;
}

// In reality this is an 'Argument' type. But the '&' syntax prevents title and subtitle from being undefined
interface AugmentedArgument {
  id: number;
  generateJob?: {
    language: Language;
  } & GenerateJob;
  inputPair?: {
    arguments: Argument[];
    language: Language;
  } & InputPair;
  title?: string | null;
  subtitle?: string | null;
}

const findArgument = async (argument: IdParameter) =>
  awsInvoke<AugmentedArgument | undefined>(
    process.env.FIND_ARGUMENT_FN,
    "RequestResponse",
    argument
  );

const updateInputPairHitArguments = async (argument: AugmentedArgument) =>
  awsInvoke<InputPair & { arguments: Argument[]; language: Language }>(
    process.env.UPDATE_INPUT_PAIR_HIT_FN,
    "RequestResponse",
    argument
  );

const createTitle = async (argumentId: number) =>
  awsInvoke(process.env.CREATE_TITLE_FN, "Event", {
    argumentId,
  });

const awaitTitle = async (id: number) => {
  const initialBackoff = 50;
  const maxBackoff = 38_000; // 38 seconds

  for await (const delay of backoffGenerator(initialBackoff, maxBackoff)) {
    const dynamoPollResult = await getTitle(id, databaseClient);
    if (dynamoPollResult?.status === "completed") return dynamoPollResult;
    // Sleep for the current backoff duration:
    await new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  throw new Error("Timeout while waiting for title to be generated.");
};

export const getArgumentRoute = async (
  _parent: unknown,
  { id }: { id: number }
): Promise<ArugmentRoute | undefined> => {
  console.log("Looking for argument route by id:", id);
  const argument = await findArgument({ id });
  console.log(
    "Result:",
    argument === undefined ? "Didn't find it" : "Found: ",
    argument
  );

  if (argument === undefined) return undefined;
  const { title, subtitle, inputPair, generateJob } = argument;
  let effectiveTitles: { title: string; subtitle: string };
  if (
    title === undefined ||
    subtitle === undefined ||
    title === "" ||
    subtitle === ""
  ) {
    console.log(
      "This argument was generated before titles were added, or titles were empty strings"
    );
    const titlesPromise = awaitTitle(id);
    console.log("Generating title");
    await createTitle(argument.id);
    console.log("awaiting title...");
    effectiveTitles = await titlesPromise;
  } else if (title === null || subtitle === null) {
    console.log("Titles either not gen'ed, or are not yet complete");
    try {
      effectiveTitles = await awaitTitle(id);
    } catch (error) {
      console.error("failed to get titles", error);
      console.log("Creating new titles after fail...");
      const titlesPromise = awaitTitle(id);
      await createTitle(argument.id);
      console.log("awaiting title...");
      effectiveTitles = await titlesPromise;
    }
  } else {
    effectiveTitles = { title, subtitle };
  }
  console.log("Titles finalized:", effectiveTitles);
  cacheTitle(
    id,
    effectiveTitles.title,
    effectiveTitles.subtitle,
    databaseClient,
    "completed"
  ).catch(() => {
    console.error("Failed to cache the title and subtitle");
  });

  if (inputPair !== undefined) {
    const route = await updateInputPairHitArguments({ ...argument, inputPair });
    if (!route) {
      console.error(
        "There should always be a returned route, as it is an update of an existing item"
      );
      return undefined;
    }
    return { ...effectiveTitles, language: route.language.name, route };
  }

  if (generateJob && generateJob.status !== "COMPLETED") {
    return {
      ...effectiveTitles,
      language: generateJob.language.name,
      route: {
        jobId: generateJob.id,
        argumentId: argument.id,
        scheduledFor: String(new Date(generateJob.scheduledFor).getTime()),
        language: { name: generateJob.language.name },
      },
    };
  }

  throw new Error(
    "We should never hit this error because InputPairs are created before generate jobs are completed. But just in case..."
  );
};

export default getArgumentRoute;
