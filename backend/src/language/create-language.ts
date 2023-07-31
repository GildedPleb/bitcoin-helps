import { type LanguagePrompt } from "@prisma/client";

import { databaseClient, releaseLock } from "../aws/dynamo";
import awsInvoke from "../aws/invoke";
import { type TranslationTypeMapped } from "../generated/graphql";
import affiliationPromises from "./affiliation";
import issuePromises from "./issue";
import fetchAndPrepareTranslations from "./translations";
import {
  type AffiliationTypeCreateWithoutLanguageInput,
  type IssueCategoryCreateWithoutLanguageInput,
} from "./types";

interface Event {
  language: string;
}

const createNewLanguage = async (
  language: string,
  [affiliationTypeData, issueCategoryData, translations]: [
    Array<{
      content: AffiliationTypeCreateWithoutLanguageInput | undefined;
      cost: string[];
    }>,
    Array<{
      content: IssueCategoryCreateWithoutLanguageInput | undefined;
      cost: string[];
    }>,
    { content: TranslationTypeMapped; cost: string[] }
  ],
  promptsId: string
) => {
  const affiliationTypeList: AffiliationTypeCreateWithoutLanguageInput[] = [];
  const issueCategoryList: IssueCategoryCreateWithoutLanguageInput[] = [];
  const cost: string[] = [];

  for (const affiliationItem of affiliationTypeData) {
    if (affiliationItem.content)
      affiliationTypeList.push(affiliationItem.content);
    cost.push(...affiliationItem.cost);
  }

  for (const issueItem of issueCategoryData) {
    if (issueItem.content) issueCategoryList.push(issueItem.content);
    cost.push(...issueItem.cost);
  }

  cost.push(...translations.cost);

  return awsInvoke(process.env.SAVE_LANGUAGE_FUNCTION_NAME, "Event", {
    language,
    affiliationTypeData: affiliationTypeList,
    issueCategoryData: issueCategoryList,
    translations: translations.content,
    promptsId,
    cost,
  });
};

const findLanguagePrompt = async () =>
  awsInvoke<LanguagePrompt>(
    process.env.FIND_LANGUAGE_PROMPT_FUNCTION_NAME,
    "RequestResponse"
  );

export const handler = async ({ language }: Event) => {
  const languageTag = language.split(" ")[0];
  try {
    const prompts = await findLanguagePrompt();
    if (!prompts) throw new Error("There should be prompts");
    // Create the 17 Affiliations + 15 Issues + 1 Translation = 33 'SUCCESS' logs
    const resolved = await Promise.all([
      Promise.all(affiliationPromises(language, prompts)),
      Promise.all(issuePromises(language, prompts)),
      await fetchAndPrepareTranslations(language, prompts),
    ]);
    await createNewLanguage(languageTag, resolved, prompts.id);
    console.log(`Successfully generated language model for: ${language}`);
  } catch (error) {
    // TODO: consider adding a "${id}-ERRORED-en-US" langauge to record costs is the case of failure.
    console.error(`Error Generating language model for: ${language}`, error);
  } finally {
    await releaseLock(language, databaseClient);
  }
};

export default handler;
