import { encodingForModel } from "js-tiktoken";

import { type PubSub } from "../aws/pubsub";
import { FINISHED_STREEM, RETRIES, TIMEOUT } from "../constants";

interface PromptMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

const MODEL = (process.env.GPT_VERSION ?? "gpt-3.5-turbo") as
  | "gpt-3.5-turbo"
  | "gpt-4"
  | "gpt2";

/**
 *
 * @param messages - The prompt
 * @param signal - Abort signal if you want
 * @param stream - To stream or not
 */
export async function fetchGptResponse(
  messages: PromptMessage[],
  signal?: AbortSignal,
  stream = true
): Promise<Response | undefined> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey === undefined || apiKey === "")
      throw new Error("Open API key required to run");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    const data = {
      messages,
      model: MODEL,
      stream,
    };

    console.log("Calling OpenAI with:", data);

    // Use the ChatGPT model with chat completions
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      signal,
    });

    // console.log(response);

    if (response.ok) return response;

    console.error("Error fetching GPT response:", await response.json());
    return undefined;
  } catch (error) {
    console.error("Error fetching GPT response:", error);
    throw new Error("rekt");
  }
}

/**
 *
 * @param userInput - The prompt
 * @param pubSub - the pubsub context
 * @param signal - Abort signal if you want
 */
export async function fetchGptResponseFull(
  userInput: string | PromptMessage[],
  pubSub?: PubSub,
  signal?: AbortSignal
): Promise<string | undefined> {
  try {
    const messages: PromptMessage[] = [
      { role: "system", content: "You are a helpful assistant." },
      ...(typeof userInput === "string"
        ? [{ role: "user", content: userInput } satisfies PromptMessage]
        : userInput),
    ];

    const response = await fetchGptResponse(messages, signal);

    if (response === undefined) {
      console.error("Response body is not available.");
      if (pubSub !== undefined) await pubSub.publish(FINISHED_STREEM);
      return undefined;
    }

    const reader = response.body?.getReader();

    if (!reader) {
      console.error("Response body reader is not available.");
      if (pubSub !== undefined) await pubSub.publish(FINISHED_STREEM);
      return undefined;
    }

    const decoder = new TextDecoder();

    let words = "";
    let finished = false;
    while (!finished) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done } = await reader.read();
      if (done) finished = true;

      const text = decoder.decode(value);
      const lines = text
        .split("\n")
        .filter(Boolean)
        .map((thing) => thing.slice(6));

      // eslint-disable-next-line no-await-in-loop
      for await (const item of lines) {
        if (item === "[DONE]") break;
        try {
          const { choices } = JSON.parse(item) as CompletionChunk;
          const { finish_reason: isFinished, delta } = choices[0];
          if (isFinished !== "stop" && delta.content !== undefined) {
            if (pubSub !== undefined) await pubSub.publish(delta.content);
            words += delta.content;
          }
        } catch (error: unknown) {
          console.error(error);
          throw new Error("An unknown error occurred iterating over stream.");
        }
      }
    }
    if (pubSub !== undefined) await pubSub.publish(FINISHED_STREEM);

    const enc = encodingForModel(MODEL);
    const count = (text: string) => enc.encode(text).length;

    const promptTokens = messages.reduce(
      (accumulator, { role, content }) =>
        accumulator + 3 + count(content) + count(role),
      3
    );
    const completionTokens = count(words);

    let costPerInputToken: number;
    let costPerOutputToken: number;
    if (MODEL === "gpt-4") {
      costPerInputToken = 0.03 / 1000; // $0.03 per 1K tokens for GPT-4 input
      costPerOutputToken = 0.06 / 1000; // $0.06 per 1K tokens for GPT-4 output
    } else if (MODEL === "gpt-3.5-turbo") {
      costPerInputToken = 0.0015 / 1000; // $0.0015 per 1K tokens for GPT-3.5-turbo input
      costPerOutputToken = 0.002 / 1000; // $0.002 per 1K tokens for GPT-3.5-turbo output
    } else throw new Error(`Unknown model: ${MODEL}`);

    const cost =
      promptTokens * costPerInputToken + completionTokens * costPerOutputToken;
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });
    console.log(
      `Total cost: ${promptTokens} + ${completionTokens} = ${formatter.format(
        cost
      )} (${cost})`
    );

    return words;
  } catch (error) {
    console.error("Unexpected error fetching GPT response:", error);
    if (pubSub !== undefined) await pubSub.publish(FINISHED_STREEM);
    return undefined;
  }
}

export const tryAndRetryFetchAI = async (
  userInput: PromptMessage[],
  maxRetries = RETRIES
): Promise<string | undefined> => {
  const abreviation = userInput
    .map((item) => item.content)
    .join(", ")
    .slice(0, 100);
  const retryMessage = `Retrying for "${abreviation}...". ${maxRetries} retries left.`;
  const exhaustedMessage = `Retries Exhausted for "${abreviation}...". Returning undefined`;
  const controller = new AbortController();
  const { signal } = controller;
  setTimeout(() => {
    controller.abort();
  }, TIMEOUT);
  try {
    const result = await fetchGptResponseFull(userInput, undefined, signal);
    if (result !== undefined) return result;
    if (maxRetries > 0) {
      console.log(retryMessage);
      return await tryAndRetryFetchAI(userInput, maxRetries - 1);
    }
    console.log(exhaustedMessage);
    return undefined;
  } catch (error) {
    console.error(error);
    if (maxRetries > 0) {
      console.log(retryMessage);
      return await tryAndRetryFetchAI(userInput, maxRetries - 1);
    }
    console.log(exhaustedMessage);
    return undefined;
  }
};

export const fetchQualityAIResults = async (
  userInput: string,
  validators: Array<(generated: string) => undefined | string>,
  maxExchanges = 6
) => {
  let invalids = "false";
  const exchanges: PromptMessage[] = [{ role: "user", content: userInput }];
  let current: string | undefined = "";
  while (invalids !== "") {
    // eslint-disable-next-line no-await-in-loop
    current = await tryAndRetryFetchAI(exchanges);
    invalids = "";
    if (current === undefined) {
      console.error(
        "No AI response returned for query:",
        userInput.slice(0, 100)
      );
    } else {
      for (const validator of validators) {
        const isInvalid = validator(current);
        if (isInvalid !== undefined) invalids = `${invalids} - ${isInvalid}\n`;
      }
      exchanges.push(
        { role: "assistant", content: current },
        { role: "user", content: `Please revise to account for:\n${invalids}` }
      );
      if (exchanges.length > maxExchanges && exchanges.length > 1)
        exchanges.splice(1, 2);
    }
  }
  return current;
};
