import prisma from "./context";
import { ArgumentPrompt } from "@prisma/client";

// Returns a list of argument prompts, 1 of each argument prompt type, and returns only the latest version for that type.
export const handler = async () => {
  const allData = await prisma.argumentPrompt.findMany();

  const latestVersionsMap = new Map<string, ArgumentPrompt>();

  for (const item of allData)
    if (
      !latestVersionsMap.has(item.name) ||
      item.version > latestVersionsMap.get(item.name)!.version
    )
      latestVersionsMap.set(item.name, item);

  return Array.from(latestVersionsMap.values());
};

export default handler;
