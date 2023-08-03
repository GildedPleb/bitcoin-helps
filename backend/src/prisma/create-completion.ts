import { BudgetType } from "@prisma/client";
import { PromptMessage } from "../open-ai/openai-api";
import prisma from "./context";

interface Event {
  promptTokens: number;
  completionTokens: number;
  cost: number;
  completion?: string;
  prompt: PromptMessage[];
  budgetType: BudgetType;
}

export const handler = async ({
  promptTokens,
  completionTokens,
  cost,
  prompt,
  completion,
  budgetType,
}: Event) => {
  const mostRecentBudget = await prisma.budget.findFirst({
    where: { budgetType },
    orderBy: { createdAt: "desc" },
  });

  if (!mostRecentBudget)
    throw new Error("There should always be a most recent budget");

  return prisma.openAICall.create({
    data: {
      completionTokens,
      cost,
      prompt,
      completion,
      promptTokens,
      budgetId: mostRecentBudget.id,
    },
  });
};

export default handler;
