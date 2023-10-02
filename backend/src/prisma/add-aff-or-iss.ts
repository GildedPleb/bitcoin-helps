import prisma from "./context";

interface Event {
  type: "A" | "I";
  matchedTypeId: string;
  response: string;
}

export const handler = async ({ type, matchedTypeId, response }: Event) => {
  if (type === "A") {
    // Add a new Affiliation and connect it to the AffiliationType with ID matchedTypeId
    await prisma.affiliation.create({
      data: {
        name: response,
        affiliationType: {
          connect: {
            id: matchedTypeId,
          },
        },
      },
    });
  } else if (type === "I") {
    // Add a new Issue and connect it to the IssueCategory with ID matchedTypeId
    await prisma.issue.create({
      data: {
        name: response,
        issueCategory: {
          connect: {
            id: matchedTypeId,
          },
        },
      },
    });
  } else {
    throw new Error("Invalid type provided.");
  }
};

export default handler;
