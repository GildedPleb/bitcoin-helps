import {
  type Affiliation,
  type BudgetType,
  type Issue,
  type Language,
} from "@prisma/client";
import tags from "language-tags";

import { acquireLock, databaseClient } from "../../aws/dynamo";
import awsInvoke from "../../aws/invoke";
import { type LanguageSelectors } from "../../generated/graphql";
import { reactSelectorMap } from "../../helpers";

const getNewLanguageAffiliationsAndIssues = async (language: string) =>
  awsInvoke(process.env.CREATE_LANGUAGE_FUNCTION_NAME, "Event", {
    language,
  });

const findLanguage = async (language: string) =>
  awsInvoke<
    | (Language & {
        issueCategories: Array<{
          name: string;
          issues: Issue[];
        }>;
        affiliationTypes: Array<{
          name: string;
          affiliations: Affiliation[];
        }>;
      })
    | undefined
  >(process.env.FIND_LANGUAGE_FUNCTION_NAME, "RequestResponse", { language });

const findBudget = async (budgetType: BudgetType) =>
  awsInvoke<{
    spent: number;
    budget: number;
  }>(process.env.FIND_BUDGET_FUNCTION_NAME, "RequestResponse", { budgetType });

export const getAfffiliationsAndIssues = async (
  _parent: unknown,
  { language }: { language: string }
): Promise<LanguageSelectors | undefined> => {
  console.log("Fetching language data for:", language);
  const languageTag = language.split(" ")[0];
  if (!tags.check(languageTag)) {
    console.error("Invalid language requested:", language);
    return undefined;
  }
  try {
    const languagePupulated = await findLanguage(languageTag);
    console.log(
      "Language search results:",
      languagePupulated === undefined ? `Couldnt find ` : `Found `,
      languageTag
    );
    if (languagePupulated !== undefined)
      return reactSelectorMap(languagePupulated);
  } catch (error) {
    console.error(error);
    return undefined;
  }
  if (await acquireLock(language, databaseClient)) {
    const budget = await findBudget("LANGUAGE");
    console.log("budget:", budget);
    if (!budget) {
      console.error("No budgets found");
      return undefined;
    }
    if (budget.spent > budget.budget) {
      console.log("Exceeded Language budget for this month", budget);
      return undefined;
    }
    await getNewLanguageAffiliationsAndIssues(language);
  } else
    console.log("Another function is already creating language:", language);

  return undefined;
};

export default getAfffiliationsAndIssues;
