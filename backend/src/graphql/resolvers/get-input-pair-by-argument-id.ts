import {
  type Argument,
  type GenerateJob,
  type InputPair,
  type Language,
} from "@prisma/client";

import awsInvoke from "../../aws/invoke";
import { type InputPairOrJob } from "../../generated/graphql";

interface IdParameter {
  id: number;
}

const findArgument = async (argument: IdParameter) =>
  awsInvoke<
    | (Argument & {
        GenerateJob:
          | (GenerateJob & {
              language: Language;
            })
          | undefined;
        inputPair:
          | (InputPair & {
              arguments: Argument[];
              language: Language;
            })
          | undefined;
      })
    | undefined
  >(process.env.FIND_ARGUMENT_FUNCTION_NAME, "RequestResponse", argument);

const updateInputPairHitArguments = async (
  argument: Argument & {
    inputPair: InputPair & { arguments: Argument[]; language: Language };
  }
) =>
  awsInvoke<InputPair & { arguments: Argument[]; language: Language }>(
    process.env.UPDATE_INPUT_PAIR_HIT_FUNCTION_NAME,
    "RequestResponse",
    argument
  );

export const getInputPairByArgumentId = async (
  _parent: unknown,
  { id }: { id: number }
): Promise<InputPairOrJob | undefined> => {
  console.log("Looking for argument by id:", id);
  const argument = await findArgument({ id });
  console.log(
    "Result:",
    argument === undefined ? "Didn't find it" : "Found: ",
    argument
  );

  if (argument === undefined) return undefined;
  if ("inputPair" in argument && argument.inputPair !== undefined) {
    const updatedArgument = { ...argument, inputPair: argument.inputPair };
    return updateInputPairHitArguments(updatedArgument);
  }
  if (argument.GenerateJob && argument.GenerateJob.status !== "COMPLETED")
    return {
      jobId: argument.GenerateJob.id,
      argumentId: argument.id,
      language: { name: argument.GenerateJob.language.name },
    };

  throw new Error(
    "We should never hit this error because InputPairs are created before generate jobs are completed. But just in case..."
  );
};

export default getInputPairByArgumentId;
