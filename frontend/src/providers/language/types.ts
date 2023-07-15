import { type GroupType } from "../../graphql/generated";
import { type LeftToRightOrRightToLeft } from "../../types";

export type LanguageStatus = "available" | "generating";

export interface LanguageOptionType {
  label: string;
  value: string;
  status: LanguageStatus;

  direction: LeftToRightOrRightToLeft;
  speak: string;
  loading: string;

  selectAffiliation?: string;
  selectIssue?: string;
  selectNoMatch?: string;
  iAmAffiliatedWith?: string;
  andICareAbout?: string;
  whyCare?: string;
  findingArgument?: string;

  affiliationTypes?: GroupType[];
  issueCategories?: GroupType[];
  id?: string;
}

export interface LanguageContextProperties {
  language: LanguageOptionType;
  languages: LanguageOptionType[];
  setLanguage: (newLanguage: LanguageOptionType) => void;
  loading: boolean;
  browserLanguage: LanguageOptionType;
}
