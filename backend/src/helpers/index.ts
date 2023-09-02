import type { Affiliation, Issue, Language } from "@prisma/client";

import {
  type LanguageSelectors,
  type TranslationTypeMapped,
} from "../generated/graphql";

export const reactSelectorMap = (
  toMap: Language & {
    issueCategories: Array<{
      name: string;
      issues: Issue[];
    }>;
    affiliationTypes: Array<{
      name: string;
      affiliations: Affiliation[];
    }>;
  }
): LanguageSelectors => {
  // The fetched data should be structured to match the GroupType, like so:
  const issueCategories = toMap.issueCategories.map((category) => ({
    label: category.name,
    options: category.issues.map((issue) => ({
      value: issue.id, // or another unique identifier of the issue
      label: issue.name, // or another property of the issue that you want to display
    })),
  }));

  const affiliationTypes = toMap.affiliationTypes.map((affiliationType) => ({
    label: affiliationType.name,
    options: affiliationType.affiliations.map((affiliation) => ({
      value: affiliation.id, // or another unique identifier of the affiliation
      label: affiliation.name, // or another property of the affiliation that you want to display
    })),
  }));

  return {
    id: toMap.id,
    issueCategories,
    affiliationTypes,
    translations: toMap.translations as TranslationTypeMapped,
  };
};

export const extractJSONFromString = <T>(
  input: string | undefined
): T | undefined => {
  if (input === undefined) return undefined;
  const startIndex = input.indexOf("{");
  const endIndex = input.lastIndexOf("}");

  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    const jsonString = input.slice(startIndex, endIndex + 1);
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

export const extractJSONListFromString = <T extends string[]>(
  input: string | undefined
): T | undefined => {
  if (input === undefined) return undefined;
  const startIndex = input.indexOf("[");
  const endIndex = input.lastIndexOf("]");

  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    const jsonString = input.slice(startIndex, endIndex + 1);
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

/**
 *
 * @param initialDelay - Delay
 * @param maxDelay - Tiemout
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function* backoffGenerator(
  initialDelay: number,
  maxDelay: number
): AsyncGenerator<number> {
  let delay = initialDelay;
  while (delay <= maxDelay) {
    yield delay;
    delay += 1000;
  }
}
