import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function convertNullToUndefined(data: unknown) {
  if (data === null) return undefined;
  if (typeof data === "object")
    for (let key in data) data[key] = convertNullToUndefined(data[key]);
  return data;
}

prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);

  // Log all Prisma calls
  const after = Date.now();
  // Convert Nulls to undefined
  const processedResult = convertNullToUndefined(result);

  const { action, model, args } = params;
  console.log(`Called ${model}.${action},
Payload: ${JSON.stringify(args, null, 2)},
Result: ${JSON.stringify(result, null, 2)},
Finished in ${after - before}ms,
Processed Result: ${JSON.stringify(processedResult, null, 2)}`);

  return processedResult;
});

export default prisma;
