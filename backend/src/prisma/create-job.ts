import prisma from "./context";

interface Event {
  languageId: string;
  issueId: string;
  affiliationId: string;
  promptId: string;
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
      "No budget available - there shoudl always be a current budget"
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

  let scheduledFor;

  if (!weAreAboveBudget) {
    // Schedule essay for completion at current time
    scheduledFor = now;
  } else {
    // Get the last job in the queue
    const lastJob = await prisma.generateJob.findFirst({
      where: { status: "PENDING" },
      orderBy: { scheduledFor: "desc" },
    });

    if (!lastJob) {
      // Calculate how much we've exceeded our budget
      const overBudget = totalCostThisMonth - expectedCost;

      // Calculate the delay based on the excess and the spend rate per second
      const delay = (overBudget / spendRatePerSecond) * 1000; // convert to milliseconds

      // If there are no previous jobs and this job puts us over budget,
      // schedule it after a delay calculated based on the overbudget amount.
      scheduledFor = new Date(Date.now() + delay);
    } else {
      // Calculate the scheduled time for the new job
      scheduledFor = new Date(
        lastJob.scheduledFor.getTime() + numberOfSecondsPerEssayPerMonth * 1000
      );
    }
  }
  console.log("Timing: ", {
    now: now.toISOString(),
    startOfMonth: startOfMonth.toISOString(),
    endOfMonth: endOfMonth.toISOString(),
    monthInSeconds: `${monthInSeconds} seconds`,
    timeElapsedIntoMonthInSeconds: `${timeElapsedIntoMonthInSeconds} seconds`,
    totalCostThisMonth: `$${totalCostThisMonth.toFixed(2)}`,
    averageCost: `$${averageCost.toFixed(2)}`,
    spendRatePerSecond: `$${spendRatePerSecond.toFixed(2)}/second`,
    numberOfSecondsPerEssayPerMonth: `${numberOfSecondsPerEssayPerMonth} seconds`,
    expectedCost: `$${expectedCost.toFixed(2)}`,
    weAreAboveBudget: weAreAboveBudget ? "Yes" : "No",
    scheduledFor: scheduledFor.toISOString(),
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
