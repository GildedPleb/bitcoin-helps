import { type LanguagePrompt } from "@prisma/client";
import Handlebars from "handlebars";

import { extractJSONFromString, extractJSONListFromString } from "../helpers";
import { fetchQualityAIResults } from "../open-ai/openai-api";
import {
  type AffiliationTypeCreateWithoutLanguageInput,
  type BaseAffiliationIssue,
  verifyAffiliationIssueList,
  verifyBaseAffiliationIssue,
} from "./types";

const affiliationPromises = (language: string, prompts: LanguagePrompt) => {
  if (prompts.affiliationExample === null)
    throw new TypeError("affiliationExample is null");
  if (!Array.isArray(prompts.affiliationExample)) {
    console.log(
      "prompts.affiliationExample:",
      typeof prompts.affiliationExample,
      prompts.affiliationExample
    );
    throw new TypeError("affiliationExample is not an array");
  }

  return prompts.affiliationExample.map(
    async (
      type
    ): Promise<AffiliationTypeCreateWithoutLanguageInput | undefined> => {
      const typeString = JSON.stringify(type);
      try {
        const aiResponse = await fetchQualityAIResults(
          Handlebars.compile(prompts.affiliationTypePrompt)({
            language,
            example: typeString,
          }),
          [verifyBaseAffiliationIssue]
        );
        const data = extractJSONFromString<BaseAffiliationIssue>(aiResponse);
        if (data === undefined) {
          console.error(`Affiliation extract ${language}: ${typeString}`);
          return undefined;
        }
        const populatedDescription = `${
          data.description
        }. Examples: ${data.examples.join(", ")}`;
        const aiAffiliationListRaw = await fetchQualityAIResults(
          Handlebars.compile(prompts.affiliationPrompt)({
            language,
            name: data.name,
            description: populatedDescription,
          }),
          [verifyAffiliationIssueList]
        );
        const dataList = extractJSONListFromString(aiAffiliationListRaw);
        if (dataList === undefined) {
          console.error(`Affiliation list ${language} for ${typeString}`);
          return undefined;
        }
        console.log("SUCESS: Final Affiliation:", data, dataList);
        return {
          name: data.name,
          description: populatedDescription,
          affiliations: {
            create: dataList.map((item) => ({
              name: item,
            })),
          },
        };
      } catch (error) {
        console.error("Error generating affiliation for", typeString, error);
        return undefined;
      }
    }
  );
};

export default affiliationPromises;
