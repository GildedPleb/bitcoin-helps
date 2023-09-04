import { PrismaClient } from "@prisma/client";
import { languagePrompts } from "../../../prompts";

import dotenv from "dotenv";
import { TranslationTypeMapped } from "../../generated/graphql";
import { fetchQualityAIResults } from "../../open-ai/openai-api";
import { extractJSONFromString } from "../../helpers";

dotenv.config();

const STAGE = process.argv[2] ?? "dev";

console.log(`Running translation sync for ${STAGE}...`);

const DATABASE_URL = process.env[`DATABASE_URL_${STAGE}`] ?? "Will fail";

const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

const newTranslationSchema = languagePrompts[0].translationExample.example;
const exampleLanguage = languagePrompts[0].translationExample.language;

const validate =
  (key: string) =>
  (object: string): undefined | string => {
    const json = extractJSONFromString(object);
    if (json === undefined)
      return `Response must include only one valid JSON object: { "${key}": "newTranslatedString" }`;

    if (typeof json !== "object" || json === null)
      return `JSON must be an object like { "${key}": "newTranslatedString" }, got a ${typeof json}`;

    if (Object.entries(json).length !== 1)
      return `The number of keys is miss-matched, should be 1: { "${key}": "newTranslatedString" }`;

    if (!(key in json))
      return `Missing the ${key} key.  { "${key}": "newTranslatedString" }`;

    if (typeof json[key] !== "string")
      return `key ${key} has value which is not type 'string'. Must match: { "${key}": "newTranslatedString" }`;

    return undefined;
  };

async function translate(
  key: string,
  value: string,
  language: string,
  languageDisplay: string
): Promise<string> {
  const prompt = `Given language "${exampleLanguage}" with the example:
  {"${key}": "${value}"}

Retaining the english key, translate the value into IETF BCP 47 language tag "${language} (${languageDisplay})". The response must match the example JSON schema.`;

  const results = await fetchQualityAIResults(
    prompt,
    [validate(key)],
    6,
    12,
    false
  );

  return results.words;
}

async function main() {
  console.log("Syncing translations...");

  const languages = await prisma.language.findMany();
  // const languages = [
  //   await prisma.language.findFirstOrThrow({ where: { name: "cs" } }),
  // ];

  for (const language of languages) {
    console.log(language.translations);
    let translations = (
      typeof language.translations === "string"
        ? JSON.parse(language.translations)
        : language.translations
    ) as TranslationTypeMapped;
    let hasChanged = false;

    // Delete keys that no longer exist
    for (const key in translations) {
      if (!(key in newTranslationSchema)) {
        console.log("Removing key ", key, " from ", language.name);
        delete translations[key];
        hasChanged = true;
      }
    }

    // Update existing keys and create new ones
    for await (const [key, value] of Object.entries(newTranslationSchema)) {
      if (!(key in translations) || translations[key] === "") {
        const display = new Intl.DisplayNames([language.name], {
          type: "language",
        });
        const languageDisplay = display.of(language.name);
        if (!languageDisplay)
          throw new Error(
            `${language.name} does not have a languageDisplay name`
          );
        console.log(
          "Translating:",
          key,
          "into",
          language.name,
          languageDisplay
        );

        const translatedValue = await translate(
          key,
          value,
          language.name,
          languageDisplay
        );
        try {
          const newValue = extractJSONFromString<{ [K: string]: string }>(
            translatedValue
          );
          if (!newValue) throw new Error("Should always pass here...");
          translations[key] = newValue[key];
          hasChanged = true;
        } catch (e) {
          console.error(e);
          throw new Error("Failed");
        }
      }
    }

    if (hasChanged) {
      await prisma.language.update({
        where: { id: language.id },
        data: { translations: translations },
      });
      console.log("Successfully updated ", language.name, translations);
    }
  }

  console.log("Translations synced successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Prompts processed successfully!");
    await prisma.$disconnect();
  });
