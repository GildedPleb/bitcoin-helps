import { type Affiliation, type Issue, type Language } from "@prisma/client";
import tags from "language-tags";

import { acquireLock } from "../../aws/dynamo";
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
  if (await acquireLock(language))
    await getNewLanguageAffiliationsAndIssues(language);
  else console.log("Another function is already creating language:", language);

  return undefined;
};

export default getAfffiliationsAndIssues;
