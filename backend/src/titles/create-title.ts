import {
  type Affiliation,
  type AffiliationType,
  type Argument,
  type GenerateJob,
  type InputPair,
  type Issue,
  type IssueCategory,
  type Language,
  type TitlePrompt,
} from "@prisma/client";

import { cacheTitle, databaseClient, getTitle } from "../aws/dynamo";
import awsInvoke from "../aws/invoke";
import fetchAndPrepareTitles from ".";

interface ArgumentParameters {
  argumentId: number;
}

const findArgument = async (argument: number) =>
  awsInvoke<
    Argument & { titlePrompt?: TitlePrompt | undefined } & {
      inputPair:
        | (InputPair & {
            language: Language;
            issue: Issue & { issueCategory: IssueCategory };
            affiliation: Affiliation & { affiliationType: AffiliationType };
          })
        | undefined;
    } & {
      generateJob:
        | (GenerateJob & {
            language: Language;
            issue: Issue & { issueCategory: IssueCategory };
            affiliation: Affiliation & { affiliationType: AffiliationType };
          })
        | undefined;
    }
  >(process.env.FIND_ARGUMENT_FN, "RequestResponse", {
    id: argument,
  });

const findTitlePrompt = async () =>
  awsInvoke<TitlePrompt>(process.env.FIND_TITLE_PROMPT_FN, "RequestResponse");

const updateArgument = async (
  argumentId: number,
  title: string,
  subtitle: string,
  titlePromptId: string
) =>
  awsInvoke(process.env.UPDATE_ARGUMENT_FN, "Event", {
    argumentId,
    title,
    subtitle,
    titlePromptId,
  });

export const handler = async ({ argumentId }: ArgumentParameters) => {
  const existingTitle = await getTitle(argumentId, databaseClient);
  if (existingTitle?.status === "started") {
    console.log("Title generation already in progress for this argumentId");
    return;
  }
  await cacheTitle(argumentId, "", "", databaseClient, "started");
  const fullArgument = await findArgument(argumentId);
  if (!fullArgument) return;
  // we dont need to verify mutiple jobs, cus Generate job logic prevents this.. but actually we might... not sure... this is pretty sloppy.
  console.log("full argument:", fullArgument);
  const { inputPair, titlePrompt, generateJob } = fullArgument;
  const effectivePrompt = titlePrompt ?? (await findTitlePrompt());
  if (!effectivePrompt)
    throw new Error("We should never hit this, but we couldn't find a prompt.");
  const effectiveSource = inputPair ?? generateJob;
  if (!effectiveSource)
    throw new Error("Neither inputPair nor generateJob is available!");
  const { content, cost } = await fetchAndPrepareTitles(
    effectiveSource.language.name,
    effectiveSource.affiliation.affiliationType.name,
    effectiveSource.affiliation.name,
    effectiveSource.issue.issueCategory.name,
    effectiveSource.issue.name,
    effectivePrompt
  );

  const { title, subtitle } = content;

  await Promise.all([
    cacheTitle(argumentId, title, subtitle, databaseClient, "completed"),
    updateArgument(argumentId, title, subtitle, effectivePrompt.id),
  ]);

  // TODO: We still have costs we can account for here.
  console.log("Costs:", cost);
};

export default handler;
