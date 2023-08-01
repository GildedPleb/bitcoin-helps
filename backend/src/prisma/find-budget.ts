import { BudgetType } from "@prisma/client";
import prisma from "./context";

interface Event {
  budgetType: BudgetType;
}

export const handler = async ({ budgetType }: Event) => {
  const mostRecentBudget = await prisma.budget.findFirst({
    where: { budgetType },
    orderBy: { createdAt: "desc" },
  });

  if (!mostRecentBudget)
    throw new Error("No budgets found - There should always be a budget");

  const totalSpent = await prisma.openAICall.aggregate({
    where: { budgetId: mostRecentBudget.id },
    _sum: { cost: true },
  });

  return { spent: totalSpent._sum.cost ?? 0, budget: mostRecentBudget.amount };
};

export default handler;
