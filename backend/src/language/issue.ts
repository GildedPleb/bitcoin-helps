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
    ): Promise<IssueCategoryCreateWithoutLanguageInput | undefined> => {
      const categoryString = JSON.stringify(category);
      try {
        const aiResponse = await fetchQualityAIResults(
          Handlebars.compile(prompts.issueCategoryPrompt)({
            language,
            example: categoryString,
          }),
          [verifyBaseAffiliationIssue]
        );
        const data = extractJSONFromString<BaseAffiliationIssue>(aiResponse);
        if (data === undefined) {
          console.error(`Issue extract ${language}: ${categoryString}`);
          return undefined;
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
        const dataList = extractJSONListFromString(aiAffiliationListRaw);
        if (dataList === undefined) {
          console.error(`Affiliation list ${language} for ${categoryString}`);
          return undefined;
        }
        console.log("SUCESS: Final Issue:", data, dataList);
        return {
          name: data.name,
          description: populatedDescription,
          issues: {
            create: dataList.map((item) => ({
              name: item,
            })),
          },
        };
      } catch (error) {
        console.error(
          "Error generating affiliation for",
          categoryString,
          error
        );
        return undefined;
      }
    }
  );
};

export default issuePromises;
