import prisma from "./context";

export const handler = async () => {
  await prisma.budget.createMany({
    data: [
      {
        budgetType: "ESSAY",
        amount: 50,
      },
      {
        budgetType: "LANGUAGE",
        amount: 50,
      },
      {
        budgetType: "TITLE",
        amount: 50,
      },
    ],
  });
};

export default handler;
