import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

const region = process.env.AWS_REGION ?? "us-east-2";
const lambda = new LambdaClient({ region }); // Set your region

const awsInvoke = async <T>(
  FunctionName: string | undefined,
  InvocationType: "RequestResponse" | "Event",
  payload: object = {}
): Promise<T | undefined> => {
  if (FunctionName === undefined)
    throw new Error(
      "A function name must be provided for an invoke call. Check your ENVs."
    );
  try {
    console.log(`${FunctionName}: Invoking...`);
    const Payload = new TextEncoder().encode(JSON.stringify(payload));

    const command = new InvokeCommand({
      FunctionName,
      InvocationType,
      Payload,
    });
    const data = await lambda.send(command);

    console.log(`${FunctionName}: Successfully invoked:`, data);

    let parsedPayload: Uint8Array | string | undefined =
      typeof data === "object" && "Payload" in data ? data.Payload : undefined;
    if (parsedPayload === undefined)
      if (InvocationType === "RequestResponse")
        throw new Error("Received no payload from invoked function");
      else {
        console.log("Received no payload");
        return undefined;
      }

    if (parsedPayload instanceof Uint8Array) {
      const textDecoder = new TextDecoder();
      parsedPayload = textDecoder.decode(parsedPayload);
    }
    if (typeof parsedPayload !== "string")
      throw new Error(
        `Did not receive a string payload: you shouldn't ever get this but to fix it, you will need to handle "${typeof parsedPayload}" type.`
      );
    if (
      parsedPayload === "null" ||
      parsedPayload === "undefined" ||
      parsedPayload === ""
    ) {
      console.log("Received a null, empty, or undefined payload");
      return undefined;
    }
    console.log("Received a full payload, attempting to parse");
    // console.log("Attempting to parse payload:", parsedPayload);
    return JSON.parse(parsedPayload) as T;
  } catch (error) {
    console.error(`${FunctionName}: Error invoking`, error);
    throw new Error(`Error in ${FunctionName}`);
  }
};

export default awsInvoke;
