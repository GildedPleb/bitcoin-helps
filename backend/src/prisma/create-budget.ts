import prisma from "./context";

export const handler = async () => {
  await prisma.budget.createMany({
    data: [
      {
        budgetType: "ESSAY",
        amount: 50,
        spent: 0,
      },
      {
        budgetType: "LANGUAGE",
        amount: 50,
        spent: 0,
      },
    ],
  });
};

export default handler;
