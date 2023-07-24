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
    Array<AffiliationTypeCreateWithoutLanguageInput | undefined>,
    Array<IssueCategoryCreateWithoutLanguageInput | undefined>,
    TranslationTypeMapped
  ],
  promptsId: string
) =>
  awsInvoke(process.env.SAVE_LANGUAGE_FUNCTION_NAME, "Event", {
    language,
    affiliationTypeData: affiliationTypeData.filter(
      (item) => item !== undefined
    ),
    issueCategoryData: issueCategoryData.filter((item) => item !== undefined),
    translations,
    promptsId,
  });

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
    // Create the 14 Affiliations + 15 Issues + 1 Translation = 30 'SUCCESS' logs
    const resolved = await Promise.all([
      Promise.all(affiliationPromises(language, prompts)),
      Promise.all(issuePromises(language, prompts)),
      await fetchAndPrepareTranslations(language, prompts),
    ]);
    await createNewLanguage(languageTag, resolved, prompts.id);
    console.log(`Successfully generated language model for: ${language}`);
  } catch (error) {
    console.error(`Error Generating language model for: ${language}`, error);
  } finally {
    await releaseLock(language, databaseClient);
  }
};

export default handler;
