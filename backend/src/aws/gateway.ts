import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

import { type Message } from "../graphql/types";
import { databaseClient, getConnection, removeConnection } from "./dynamo";

const PUBLISH_ENDPOINT =
  process.env.PUBLISH_ENDPOINT ?? "ERROR: PUBLISH_ENDPOINT env not provided";

const createSendMessage = (connectionId: string) => {
  const endpoint =
    process.env.IS_OFFLINE === undefined
      ? PUBLISH_ENDPOINT.replace("wss://", "https://")
      : "http://localhost:3001";

  const gatewayClient = new ApiGatewayManagementApiClient({
    apiVersion: "2018-11-29",
    endpoint,
  });

  return async (message: Message) => {
    if (!(await getConnection(connectionId, databaseClient))) {
      console.log("No connection, can not send. Skipping send.");
      return;
    }

    try {
      console.log(
        "Sending Message:",
        endpoint,
        JSON.stringify(message, undefined, 2)
      );
      const data = new TextEncoder().encode(JSON.stringify(message));
      const command = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: data,
      });

      await gatewayClient.send(command);
    } catch (error: unknown) {
      console.error(error);
      if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        error.statusCode === 410
      )
        await removeConnection(connectionId, databaseClient);
    }
  };
};

export default createSendMessage;
