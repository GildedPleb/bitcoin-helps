import prisma from "./context";

interface Event {
  languageId: string;
  issueId: string;
  affiliationId: string;
  promptId: string;
}

function formatSecondsToDHMS(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return `${days} days, ${hours} hours, ${minutes} minutes, ${Math.round(
    seconds
  )} seconds`;
}

export const handler = async ({
  languageId,
  issueId,
  affiliationId,
  promptId,
}: Event) => {
  const mostRecentBudget = await prisma.budget.findFirst({
    where: { budgetType: "ESSAY" },
    orderBy: { createdAt: "desc" },
  });

  if (!mostRecentBudget) {
    throw new Error(
      "No budget available - there should always be a current budget"
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthInSeconds = (endOfMonth.getTime() - startOfMonth.getTime()) / 1000;
  const timeElapsedIntoMonthInSeconds = Math.floor(
    (now.getTime() - startOfMonth.getTime()) / 1000
  );

  const totalCosts = await prisma.openAICall.aggregate({
    where: {
      budgetId: mostRecentBudget.id,
      budget: {
        budgetType: "ESSAY",
      },
    },
    _sum: {
      cost: true,
    },
  });

  const totalCostThisMonth = totalCosts._sum.cost ?? 0;

  const aggregationResult = await prisma.openAICall.aggregate({
    where: {
      budget: {
        budgetType: "ESSAY",
      },
    },
    _avg: {
      cost: true,
    },
  });

  const averageCost = aggregationResult._avg?.cost ?? 0;
  const spendRatePerSecond = mostRecentBudget.amount / monthInSeconds;
  const numberOfSecondsPerEssayPerMonth = averageCost / spendRatePerSecond;
  const expectedCost = timeElapsedIntoMonthInSeconds * spendRatePerSecond;
  const weAreAboveBudget = totalCostThisMonth > expectedCost;
  const overUnderBudget = totalCostThisMonth - expectedCost;
  const budgetUsed = totalCostThisMonth / mostRecentBudget.amount;
  const monthProgress = timeElapsedIntoMonthInSeconds / monthInSeconds;
  const essaysCanBeProducedRightNow =
    overUnderBudget < 0
      ? Math.floor(Math.abs(overUnderBudget) / averageCost)
      : 0;

  let scheduledFor;

  if (!weAreAboveBudget) {
    scheduledFor = now;
  } else {
    const lastJob = await prisma.generateJob.findFirst({
      where: {
        status: "PENDING",
        scheduledFor: {
          gt: now,
        },
      },
      orderBy: { scheduledFor: "desc" },
    });

    if (!lastJob) {
      const delay = (overUnderBudget / spendRatePerSecond) * 1000;

      scheduledFor = new Date(Date.now() + delay);
    } else {
      scheduledFor = new Date(
        lastJob.scheduledFor.getTime() + numberOfSecondsPerEssayPerMonth * 1000
      );
    }
  }

  console.log("Timing: ", {
    budget: mostRecentBudget.amount,
    now: now.toISOString(),
    startOfMonth: startOfMonth.toISOString(),
    endOfMonth: endOfMonth.toISOString(),
    monthInSeconds: formatSecondsToDHMS(monthInSeconds),
    timeElapsedIntoMonthInSeconds: formatSecondsToDHMS(
      timeElapsedIntoMonthInSeconds
    ),
    totalCostThisMonth: `$${totalCostThisMonth.toFixed(8)}`,
    averageCost: `$${averageCost.toFixed(8)}`,
    spendRatePerSecond: `$${spendRatePerSecond.toFixed(8)}/second`,
    numberOfSecondsPerEssayPerMonth: formatSecondsToDHMS(
      numberOfSecondsPerEssayPerMonth
    ),
    expectedSpendToThisPoint: `$${expectedCost.toFixed(8)}`,
    weAreAboveBudget: weAreAboveBudget ? "Yes" : "No",
    scheduledFor: scheduledFor.toISOString(),
    remainingEssaysThatCanBeProducedThisMonth: Math.floor(
      (mostRecentBudget.amount - totalCostThisMonth) / averageCost
    ),
    budgetUsed: `${(budgetUsed * 100).toFixed(2)}%`,
    monthProgress: `${(monthProgress * 100).toFixed(2)}%`,
    overUnderBudget: `$${overUnderBudget.toFixed(8)}`,
    essaysCanBeProducedBeforeOverBudget: essaysCanBeProducedRightNow,
  });

  return prisma.generateJob.create({
    data: {
      scheduledFor,
      language: {
        connect: {
          id: languageId,
        },
      },
      issue: {
        connect: {
          id: issueId,
        },
      },
      affiliation: {
        connect: {
          id: affiliationId,
        },
      },
      argument: {
        create: {
          content: "",
        },
      },
      argumentPrompt: {
        connect: {
          id: promptId,
        },
      },
    },
  });
};
export default handler;
