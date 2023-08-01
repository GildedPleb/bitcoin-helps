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
    ): Promise<{
      content: AffiliationTypeCreateWithoutLanguageInput | undefined;
      cost: string[];
    }> => {
      const typeString = JSON.stringify(type);
      const cost: string[] = [];
      try {
        const aiResponse = await fetchQualityAIResults(
          Handlebars.compile(prompts.affiliationTypePrompt)({
            language,
            example: typeString,
          }),
          [verifyBaseAffiliationIssue]
        );
        cost.push(...aiResponse.ids);
        const data = extractJSONFromString<BaseAffiliationIssue>(
          aiResponse.words
        );
        if (data === undefined) {
          console.error(`Affiliation extract ${language}: ${typeString}`, cost);
          return { content: undefined, cost };
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
        cost.push(...aiAffiliationListRaw.ids);
        const dataList = extractJSONListFromString(aiAffiliationListRaw.words);
        if (dataList === undefined) {
          console.error(`Affiliation list ${language} for ${typeString}`, cost);
          return { content: undefined, cost };
        }
        console.log("SUCESS: Final Affiliation:", data, dataList);
        return {
          content: {
            name: data.name,
            description: populatedDescription,
            affiliations: {
              create: [...new Set(dataList)].map((item) => ({
                name: item,
              })),
            },
          },
          cost,
        };
      } catch (error) {
        console.error("Error generating affiliation", typeString, error, cost);
        return { content: undefined, cost };
      }
    }
  );
};

export default affiliationPromises;
