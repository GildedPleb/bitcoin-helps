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
  },
  selectedAffTerm: string | undefined,
  selectedIssTerm: string | undefined
): LanguageSelectors => {
  let selectedAffId: string | undefined;
  let selectedIssId: string | undefined;
  const issueCategories = toMap.issueCategories.map((category) => ({
    label: category.name,
    options: category.issues.map((issue) => {
      if (issue.name === selectedIssTerm) selectedIssId = issue.id;
      return { value: issue.id, label: issue.name };
    }),
  }));

  const affiliationTypes = toMap.affiliationTypes.map((affiliationType) => ({
    label: affiliationType.name,
    options: affiliationType.affiliations.map((affiliation) => {
      if (affiliation.name === selectedAffTerm) selectedAffId = affiliation.id;
      return { value: affiliation.id, label: affiliation.name };
    }),
  }));

  return {
    id: toMap.id,
    issueCategories,
    affiliationTypes,
    translations: toMap.translations as TranslationTypeMapped,
    selectedAffId,
    selectedIssId,
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
