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
    ): Promise<IssueCategoryCreateWithoutLanguageInput | null> => {
      const categoryString = JSON.stringify(category);
      const aiResponse = await fetchQualityAIResults(
        Handlebars.compile(prompts.issueCategoryPrompt)({
          language,
          example: categoryString,
        }),
        [verifyBaseAffiliationIssue]
      );
      const data = extractJSONFromString<BaseAffiliationIssue>(aiResponse);
      if (data === undefined)
        throw new Error(`Issue extract ${language}: ${categoryString}`);
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
      if (dataList === undefined)
        throw new Error(`Affiliation list ${language} for ${categoryString}`);
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
    }
  );
};

export default issuePromises;
