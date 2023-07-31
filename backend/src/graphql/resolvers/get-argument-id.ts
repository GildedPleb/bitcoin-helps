import {
  type Argument,
  type ArgumentPrompt,
  type GenerateJob,
  type InputPair,
} from "@prisma/client";

import awsInvoke from "../../aws/invoke";
import { type ArgumentId } from "../../generated/graphql";

interface ArgumentParameters {
  languageId: string;
  issueId: string;
  affiliationId: string;
}

const findInputPair = async (argument: ArgumentParameters) =>
  awsInvoke<(InputPair & { arguments: Argument[] }) | undefined>(
    process.env.FIND_INPUT_PAIR_FUNCTION_NAME,
    "RequestResponse",
    argument
  );

const findJob = async (argument: ArgumentParameters) =>
  awsInvoke<GenerateJob | undefined>(
    process.env.FIND_JOB_FUNCTION_NAME,
    "RequestResponse",
    argument
  );

const createJob = async (argument: ArgumentParameters, id: string) =>
  awsInvoke<GenerateJob>(
    process.env.CREATE_JOB_FUNCTION_NAME,
    "RequestResponse",
    { ...argument, promptId: id }
  );

const getArgumentPrompts = async () =>
  awsInvoke<ArgumentPrompt[]>(
    process.env.FIND_LATEST_ARGUMENT_PROMPT_FUNCTION_NAME,
    "RequestResponse"
  );

export const getArgumentId = async (
  _parent: unknown,
  ids: ArgumentParameters
): Promise<ArgumentId | null> => {
  console.log("Looking for input_pair:", ids);
  const inputPair = await findInputPair(ids);
  console.log(
    "Result:",
    inputPair === undefined ? "Didn't find it" : "Found: ",
    inputPair
  );
  if (inputPair !== undefined && inputPair.arguments.length > 0)
    return { id: inputPair.arguments[0].id };

  console.log("Checking if a job for this pair exists ...");
  const existingJob = await findJob(ids);
  console.log(
    "Result:",
    existingJob === undefined ? "Didn't find it" : "Found: ",
    existingJob
  );
  if (existingJob && existingJob.status !== "COMPLETED")
    return { id: existingJob.argumentId };

  console.log("Creating a new job...");
  const argumentPrompts = await getArgumentPrompts();
  if (argumentPrompts === undefined)
    throw new Error("There should always be prompts for arguments");
  // Replace with user logic later on
  const randomIndex = Math.floor(Math.random() * argumentPrompts.length);
  const newJob = await createJob(ids, argumentPrompts[randomIndex].id);
  if (newJob === undefined) throw new Error("Couldnt create a new job");
  return { id: newJob.argumentId };
};

export default getArgumentId;
