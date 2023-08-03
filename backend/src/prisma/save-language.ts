import prisma from "./context";
import {
  AffiliationTypeCreateWithoutLanguageInput,
  IssueCategoryCreateWithoutLanguageInput,
} from "../language/types";
import { TranslationTypeMapped } from "../generated/graphql";

interface Event {
  language: string;
  affiliationTypeData: AffiliationTypeCreateWithoutLanguageInput[];
  issueCategoryData: IssueCategoryCreateWithoutLanguageInput[];
  translations: TranslationTypeMapped;
  promptsId: string;
  cost: string[];
}

export const handler = async ({
  language,
  affiliationTypeData,
  issueCategoryData,
  translations,
  promptsId,
  cost,
}: Event) => {
  try {
    await prisma.language.create({
      data: {
        name: language,
        affiliationTypes: {
          create: affiliationTypeData,
        },
        issueCategories: {
          create: issueCategoryData,
        },
        translations,
        languagePromptId: promptsId,
        openAICall: {
          connect: cost.map((id) => ({ id })),
        },
      },
      include: {
        issueCategories: {
          select: {
            name: true,
            issues: true,
          },
        },
        affiliationTypes: {
          select: {
            name: true,
            affiliations: true,
          },
        },
      },
    });
  } catch (error) {
    console.error(`Error saving language model for :${language}`, error);
    throw new Error("rekt");
  }
};

export default handler;
