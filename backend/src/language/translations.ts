import { type LanguagePrompt } from "@prisma/client";
import Handlebars from "handlebars";

import { type TranslationTypeMapped } from "../generated/graphql";
import { extractJSONFromString } from "../helpers";
import { fetchQualityAIResults } from "../open-ai/openai-api";

export const verifyTranslationType = (object: string): undefined | string => {
  const json = extractJSONFromString(object);
  if (json === undefined)
    return "Response must include only one valid JSON object";

  if (typeof json !== "object" || json === null)
    return `JSON must be an object, got a ${typeof json}`;

  // TODO: Get this from the DB.
  // Checking for the existence of keys in obj
  const requiredKeys = [
    "selectAffiliation",
    "selectIssue",
    "selectNoMatch",
    "speak",
    "iAmAffiliatedWith",
    "andICareAbout",
    "loading",
    "whyCare",
    "findingArgument",
  ];

  const errors: string[] = [];

  if (Object.entries(json).length !== requiredKeys.length)
    errors.push(`The number of keys is miss-matched`);

  const keys: string[] = [];
  for (const key of requiredKeys) if (!(key in json)) keys.push(key);
  if (keys.length > 0) errors.push(`Missing the key(s): ${keys.join(", ")}`);

  const values: string[] = [];
  for (const key of requiredKeys)
    if (typeof json[key] !== "string") values.push(key);
  if (values.length > 0)
    errors.push(
      `The following keys have values which are not type 'string': ${values.join(
        ", "
      )}`
    );

  if (errors.length > 0) return `${errors.join(". ")}.`;
  return undefined;
};

const fetchAndPrepareTranslations = async (
  language: string,
  prompts: LanguagePrompt
): Promise<TranslationTypeMapped> => {
  const aiResponse = await fetchQualityAIResults(
    Handlebars.compile(prompts.translationPrompt)({ language }),
    [verifyTranslationType]
  );
  const data = extractJSONFromString<TranslationTypeMapped>(aiResponse);
  if (data === undefined) throw new Error(`translations ${language} `);
  console.log("SUCESS: Final translations:", data);
  return data;
};

export default fetchAndPrepareTranslations;
