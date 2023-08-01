import { type LanguagePrompt } from "@prisma/client";
import Handlebars from "handlebars";

import { extractJSONFromString, extractJSONListFromString } from "../helpers";
import { fetchQualityAIResults } from "../open-ai/openai-api";
import {
  type BaseAffiliationIssue,
  type IssueCategoryCreateWithoutLanguageInput,
  verifyAffiliationIssueList,
  verifyBaseAffiliationIssue,
} from "./types";

const issuePromises = (language: string, prompts: LanguagePrompt) => {
  if (prompts.issueExample === null)
    throw new TypeError("issueExample is null");
  if (!Array.isArray(prompts.issueExample))
    throw new TypeError("issueExample is not an array");

  return prompts.issueExample.map(
    async (
      category
    ): Promise<{
      content: IssueCategoryCreateWithoutLanguageInput | undefined;
      cost: string[];
    }> => {
      const categoryString = JSON.stringify(category);
      const cost: string[] = [];
      try {
        const aiResponse = await fetchQualityAIResults(
          Handlebars.compile(prompts.issueCategoryPrompt)({
            language,
            example: categoryString,
          }),
          [verifyBaseAffiliationIssue]
        );
        cost.push(...aiResponse.ids);
        const data = extractJSONFromString<BaseAffiliationIssue>(
          aiResponse.words
        );
        if (data === undefined) {
          console.error(`Issue extract ${language}: ${categoryString}`);
          return { content: undefined, cost };
        }
        const populatedDescription = `${
          data.description
        }. Examples: ${data.examples.join(", ")}`;
        const aiAffiliationListRaw = await fetchQualityAIResults(
          Handlebars.compile(prompts.issuePrompt)({
            language,
            name: data.name,
            description: populatedDescription,
          }),
          [verifyAffiliationIssueList]
        );
        cost.push(...aiAffiliationListRaw.ids);
        const dataList = extractJSONListFromString(aiAffiliationListRaw.words);
        if (dataList === undefined) {
          console.error(`Affiliation list ${language} for ${categoryString}`);
          return { content: undefined, cost };
        }
        console.log("SUCESS: Final Issue:", data, dataList);
        return {
          content: {
            name: data.name,
            description: populatedDescription,
            issues: {
              create: [...new Set(dataList)].map((item) => ({
                name: item,
              })),
            },
          },
          cost,
        };
      } catch (error) {
        console.error(
          "Error generating affiliation for",
          categoryString,
          error
        );
        return { content: undefined, cost };
      }
    }
  );
};

export default issuePromises;
