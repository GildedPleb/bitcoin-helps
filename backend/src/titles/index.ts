import { type TitlePrompt } from "@prisma/client";
import Handlebars from "handlebars";

import { extractJSONFromString } from "../helpers";
import { fetchQualityAIResults } from "../open-ai/openai-api";

interface TitleTypeMapped {
  title: string;
  subtitle: string;
}

const verifyTitleType = (object: string): undefined | string => {
  const json = extractJSONFromString(object);
  if (json === undefined)
    return "Response must include only one valid JSON object";

  if (typeof json !== "object" || json === null)
    return `JSON must be an object, got a ${typeof json}`;

  const requiredKeys = ["title", "subtitle"];
  const errors: string[] = [];

  if (Object.entries(json).length !== requiredKeys.length)
    errors.push(`The number of keys is miss-matched`);

  const missingKeys: string[] = [];
  for (const key of requiredKeys) if (!(key in json)) missingKeys.push(key);
  if (missingKeys.length > 0)
    errors.push(`Missing the key(s): ${missingKeys.join(", ")}`);

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

const fetchAndPrepareTitles = async (
  language: string,
  affiliationType: string,
  affiliation: string,
  issueCategory: string,
  issue: string,
  prompt: TitlePrompt
): Promise<{ content: TitleTypeMapped; cost: string[] }> => {
  console.log("fetchAndPrepareTitles..", prompt);
  const aiResponse = await fetchQualityAIResults(
    Handlebars.compile(prompt.content)({
      language,
      affiliationType,
      affiliation,
      issueCategory,
      issue,
    }),
    [verifyTitleType],
    6,
    12,
    true,
    "TITLE"
  );

  const data = extractJSONFromString<TitleTypeMapped>(aiResponse.words);
  if (data === undefined)
    throw new Error(`title generation failed for ${issue}`);
  console.log("SUCCESS: Final title:", data);
  return { content: data, cost: aiResponse.ids };
};

export default fetchAndPrepareTitles;
