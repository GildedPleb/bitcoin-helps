import { type PubSub } from "../aws/pubsub";
import { FINISHED_STREEM, RETRIES, TIMEOUT } from "../constants";

interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const MODEL = process.env.GPT_VERSION ?? "gpt-3.5-turbo";

/**
 *
 * @param userInput - The prompt
 * @param signal - Abort signal if you want
 */
export async function fetchGptResponse(
  userInput: string,
  signal?: AbortSignal
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
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userInput },
      ],
      // model: "gpt-4",
      model: MODEL,
      stream: true,
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
  userInput: string,
  pubSub?: PubSub,
  signal?: AbortSignal
): Promise<string | undefined> {
  try {
    const response = await fetchGptResponse(userInput, signal);
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
    const promptTokens = 0;
    const completionTokens = 0;
    let result = "";
    let finished = false;
    while (!finished) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done: readerDone } = await reader.read();
      const text = decoder.decode(value);
      if (readerDone) {
        // text.includes("data: [DONE]")) {
        // console.log("Ending OpenAI call as expected", text);
        finished = true;
      }
      if (value) {
        // Decode the Uint8Array to a string

        // Append this chunk to our existing string
        result += text;

        // Parse the chunk and add to token count
        console.log("recieved stream text:", text);
        // const parsed = JSON.parse(text) as CompletionResponse;
        // promptTokens += parsed.usage.prompt_tokens;
        // completionTokens += parsed.usage.completion_tokens;
        // console.log("tokens:", parsed, promptTokens, completionTokens);
      }

      // eslint-disable-next-line no-await-in-loop
      for await (const item of text
        .split("\n")
        .filter(Boolean)
        .map((thing) => thing.slice(6))) {
        try {
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access
          const word = JSON.parse(item).choices[0].delta.content
            ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              (JSON.parse(item).choices[0].delta.content as string)
            : "";
          // process.stdout.write(word);
          // Publish the word to the subscription topic
          if (pubSub !== undefined) await pubSub.publish(word);

          words += word;
        } catch (error: unknown) {
          const isError = error instanceof Error;
          const isLast = "Unexpected token D in JSON at position 1";
          if (!(isError && error.message.includes(isLast))) {
            console.error(error, item);
            throw isError ? error : new Error("An unknown error occurred");
          }
        }
      }
    }
    if (pubSub !== undefined) await pubSub.publish(FINISHED_STREEM);

    // calculate the cost based on your per-token rate
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
    console.log("final result:", result);
    console.log(`Total cost: ${formatter.format(cost)}`);

    return words;
  } catch (error) {
    console.error("Unexpected error fetching GPT response:", error);
    if (pubSub !== undefined) await pubSub.publish(FINISHED_STREEM);
    return undefined;
  }
}

export const tryAndRetryFetchAI = async (
  userInput: string,
  maxRetries = RETRIES
): Promise<string | undefined> => {
  const abreviation = userInput.slice(0, 100);
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
  maxExchanges = 3
) => {
  let invalids = "false";
  const exchanges = [`User: ${userInput}\n`];
  let current: string | undefined = "";
  while (invalids !== "") {
    const conversation = exchanges.join("");
    // console.log("conversation:", conversation);
    // eslint-disable-next-line no-await-in-loop
    current = await tryAndRetryFetchAI(conversation);
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
        `AI Assistant: ${current}\n\nUser: Please revise to account for:\n${invalids}`
      );
      if (exchanges.length > maxExchanges && exchanges.length > 1)
        exchanges.splice(1, 1);
    }
  }
  return current;
};
