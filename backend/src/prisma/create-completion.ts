import { PromptMessage } from "../open-ai/openai-api";
import prisma from "./context";

interface Event {
  promptTokens: number;
  completionTokens: number;
  cost: number;
  completion?: string;
  prompt: PromptMessage[];
}

export const handler = async ({
  promptTokens,
  completionTokens,
  cost,
  prompt,
  completion,
}: Event) =>
  prisma.openAICall.create({
    data: {
      completionTokens,
      cost,
      prompt,
      completion,
      promptTokens,
    },
  });

export default handler;
