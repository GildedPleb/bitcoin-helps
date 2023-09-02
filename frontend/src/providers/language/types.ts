import {
  type GroupType,
  type TranslationTypeMapped,
} from "../../graphql/generated";
import { type LeftToRightOrRightToLeft } from "../../types";

export type LanguageStatus = "available" | "generating";

export interface LanguageOptionType {
  label: string;
  value: string;
  status: LanguageStatus;

  translations?: TranslationTypeMapped;

  direction: LeftToRightOrRightToLeft;
  speak: string;
  loading: string;

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
