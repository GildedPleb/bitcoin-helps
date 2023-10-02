import { type Affiliation, type Issue, type Language } from "@prisma/client";

import awsInvoke from "../aws/invoke";
import { fetchGptResponseFull } from "../open-ai/openai-api";

interface DynamoDBAttributeValue {
  S?: string;
}

interface AffiliationIssueCacheRecord {
  languageTag: DynamoDBAttributeValue; // HASH key
  compositeTerm: DynamoDBAttributeValue; // RANGE key
  response: DynamoDBAttributeValue;
}

interface StreamRecord {
  ApproximateCreationDateTime: number;
  Keys: AffiliationIssueCacheRecord;
  NewImage?: AffiliationIssueCacheRecord;
  SequenceNumber: string;
  SizeBytes: number;
  StreamViewType: "NEW_IMAGE";
}

interface DynamoDBRecord {
  eventID: string;
  eventName: "INSERT" | "MODIFY" | "REMOVE";
  eventVersion: string;
  eventSource: string;
  awsRegion: string;
  dynamodb: StreamRecord;
  eventSourceARN: string;
}

interface DynamoDBStreamEvent {
  Records: DynamoDBRecord[];
}

type PopulatedLanguage =
  | (Language & {
      issueCategories: Array<{
        id: string;
        name: string;
        issues: Issue[];
      }>;
      affiliationTypes: Array<{
        id: string;
        name: string;
        affiliations: Affiliation[];
      }>;
    })
  | undefined;

const findLanguage = async (language: string) =>
  awsInvoke<PopulatedLanguage>(
    process.env.FIND_LANGUAGE_FN,
    "RequestResponse",
    { language }
  );

const addAffiliationOrIssue = async (
  type: "A" | "I",
  matchedTypeId: string,
  response: string
) =>
  awsInvoke(process.env.ADD_AFF_OR_ISS_FN, "Event", {
    type,
    matchedTypeId,
    response,
  });

const composePrompt = (type: string, response: string, options: string[]) => {
  const list = options.join(", ");
  if (type === "I") {
    return `Given the issue "${response}", which of these categories does it best fit into? The options are: ${list}. Please provide only one best fit.`;
  }
  return `Given the affiliation "${response}", which of these types does it best fit into? The options are: ${list}. Please provide only one best fit.`;
};

const parseCompletion = (
  listOfPossibleMatches: string[],
  completion: string
) => {
  const processedCompletion = completion.toLowerCase().replace(/[!,.?]/g, "");

  const matches = listOfPossibleMatches.filter((match) => {
    const processedMatch = match.toLowerCase();
    return processedCompletion.includes(processedMatch);
  });

  // eslint-disable-next-line unicorn/no-useless-undefined
  if (matches.length !== 1) return undefined;
  return matches[0];
};

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  const record = event.Records[0];
  if (record.eventName === "INSERT" && record.dynamodb.NewImage) {
    const newImage = record.dynamodb.NewImage;
    const languageTag = newImage.languageTag.S;
    if (languageTag === undefined) {
      console.log("No defined langauge");
      return;
    }
    const [type, term] = newImage.compositeTerm.S?.split("#") ?? ["", ""];
    const response = newImage.response.S;
    if (response === undefined || response === "") {
      console.log(
        "No defined response, or response was intentionaly set to empty"
      );
      return;
    }

    const languageCache = await findLanguage(languageTag);

    if (languageCache === undefined) {
      console.log("No defined language");
      return;
    }
    console.log({ languageTag, type, term, response });
    if (type === "I") {
      // Check if the 'response' exists as the name of an Issue for the language
      const issueExists = languageCache.issueCategories.some((category) =>
        category.issues.some((issue) => issue.name === response)
      );

      if (issueExists) {
        console.log(
          `Issue named '${response}' already exists for language ${languageTag}. Exiting...`
        );
        return;
      }
      console.log("Getting the category and issue...");
      const issueCategoryNames = languageCache.issueCategories.map(
        (category) => category.name
      );
      const completion = await fetchGptResponseFull(
        composePrompt(type, response, issueCategoryNames),
        undefined,
        undefined,
        false,
        undefined,
        false
      );
      console.log("AI response:", completion);
      if (completion === undefined) {
        console.log("Ai did not return anything");
        return;
      }
      const categorySuggestion = parseCompletion(
        issueCategoryNames,
        completion.words
      );

      if (categorySuggestion === undefined) {
        console.log(
          `Failed to match issue category suggestion from the completion. Exiting...`
        );
        return;
      }

      const matchedCategory = languageCache.issueCategories.find(
        (category) =>
          category.name.toLowerCase() === categorySuggestion.toLowerCase()
      );

      if (!matchedCategory) {
        console.log(
          `Failed to match issue category suggestion '${categorySuggestion}' with available categories. Exiting...`
        );
        return;
      }

      await addAffiliationOrIssue(type, matchedCategory.id, response);
    } else if (type === "A") {
      // Check if the 'response' exists as the name of an Affiliation for the language
      const affiliationExists = languageCache.affiliationTypes.some((affType) =>
        affType.affiliations.some(
          (affiliation) => affiliation.name === response
        )
      );

      if (affiliationExists) {
        console.log(
          `Affiliation named '${response}' already exists for language ${languageTag}. Exiting...`
        );
        return;
      }
      console.log("Getting the type of the affilition ...");
      const affiliationTypeNames = languageCache.affiliationTypes.map(
        (affType) => affType.name
      );

      const completion = await fetchGptResponseFull(
        composePrompt(type, response, affiliationTypeNames),
        undefined,
        undefined,
        false,
        undefined,
        false
      );
      if (completion === undefined) {
        console.log("Ai did not return anything");
        return;
      }

      const typeSuggestion = parseCompletion(
        affiliationTypeNames,
        completion.words
      );

      if (typeSuggestion === undefined) {
        console.log(
          `Failed to match affiliation type suggestion from the completion. Exiting...`
        );
        return;
      }

      const matchedType = languageCache.affiliationTypes.find(
        (affType) => affType.name.toLowerCase() === typeSuggestion.toLowerCase()
      );

      if (!matchedType) {
        console.log(
          `Failed to match issue category suggestion '${typeSuggestion}' with available categories. Exiting...`
        );
        return;
      }
      await addAffiliationOrIssue(type, matchedType.id, response);
    }
  }
};

export default handler;
