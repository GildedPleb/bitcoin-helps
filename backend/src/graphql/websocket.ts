import path from "node:path";

import fs from "graceful-fs";
// eslint-disable-next-line @shopify/typescript/prefer-build-client-schema
import {
  buildSchema,
  getOperationAST,
  GraphQLError,
  parse,
  validate,
} from "graphql";

import { addConnection, getConnection, removeConnection } from "../aws/dynamo";
import createSendMessage from "../aws/gateway";
import awsInvoke from "../aws/invoke";
import { type Event } from "./types";

const stream = async (
  connectionId: string,
  jobId: string,
  awsRequestId: string,
  id: string
) =>
  awsInvoke(process.env.STREAM_FUNCTION_NAME, "Event", {
    jobId,
    connectionId,
    awsRequestId,
    graphQLId: id,
  });

const response = { statusCode: 200, body: "" };

const schema = buildSchema(
  // eslint-disable-next-line unicorn/prefer-module
  fs.readFileSync(path.join(__dirname, "./schema.graphql"), "utf8")
);

const streamRouting = async (
  event: Event,
  connectionId: string,
  awsRequestId: string
) => {
  console.log("Client event.body:", event.body);
  if (event.body === undefined || event.body === "") return response;

  const { type, id, payload } = JSON.parse(event.body) as {
    type: string;
    id: string;
    payload: {
      query: string;
      variables: Record<string, string>;
      operationName: string | undefined;
    };
  };
  const sendMessage = createSendMessage(connectionId);
  if (type === "connection_init") {
    await sendMessage({ type: "connection_ack" });
    return response;
  }
  if (type === "stop") return response;
  const client = await getConnection(connectionId);
  if (!client) throw new Error("Unknown client");

  if (type === "ping") {
    await sendMessage({ type: "pong" });
    return response;
  }

  const { query: rawQuery, variables, operationName } = payload;
  const graphqlDocument = parse(rawQuery);
  const operationAST = getOperationAST(graphqlDocument, operationName ?? "");
  if (!operationAST || operationAST.operation !== "subscription") {
    await sendMessage({
      id,
      type: "error",
      payload: [new GraphQLError("Only subscriptions are supported")],
    });
    return response;
  }
  const validationErrors = validate(schema, graphqlDocument);
  if (validationErrors.length > 0) {
    await sendMessage({
      id,
      type: "error",
      payload: validationErrors,
    });
    return response;
  }
  try {
    if (
      type === "subscribe" &&
      operationName === "subscribeToArgument" &&
      "jobId" in variables
    ) {
      console.log("Starting to streem...");
      const { jobId } = variables;
      await stream(connectionId, jobId, awsRequestId, id);
    }
  } catch (error: unknown) {
    await sendMessage({
      id,
      payload: [new GraphQLError(error as string)],
      type: "error",
    });
  }
  return response;
};

export const handler = async (
  event: Event,
  context: { awsRequestId: string }
) => {
  const { connectionId } = event.requestContext;
  if (connectionId === undefined || connectionId === "")
    throw new Error("Invalid event. Missing `connectionId` parameter.");
  const { awsRequestId } = context;
  const { routeKey } = event.requestContext;
  console.log(routeKey, awsRequestId, connectionId);
  try {
    if (routeKey === "$connect") await addConnection(connectionId);
    else if (routeKey === "$disconnect") await removeConnection(connectionId);
    // Route is therefore $default:
    else await streamRouting(event, connectionId, awsRequestId);
    return response;
  } catch (error) {
    console.error("Connection level Error occurred:", error);
    await removeConnection(connectionId);
    return response;
  }
};

export default handler;
