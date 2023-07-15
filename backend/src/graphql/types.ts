import { type GraphQLError } from "graphql";

import { type Subscription } from "../generated/graphql";

export interface Event {
  body: string | undefined;
  isBase64Encoded: boolean;
  multiValueHeaders: Record<string, string[]>;
  requestContext: {
    apiId: string;
    connectionId?: string;
    domainName: string;
    eventType: string;
    extendedRequestId: string;
    httpMethod: string;
    identity: {
      accessKey: string;
      accountId: string;
      caller: string;
      cognitoAuthenticationProvider: string;
      cognitoAuthenticationType: string;
      cognitoIdentityId: string;
      cognitoIdentityPoolId: string;
      principalOrgId: string;
      sourceIp: string;
      user: string;
      userAgent: string;
      userArn: string;
    };
    messageDirection: string;
    messageId: string | null;
    requestId: string;
    routeKey: string;
    stage: string;
  };
  resource: string;
}

interface ConnectionInitMessage {
  type: "connection_init";
  payload?: Record<string, unknown> | null;
}

interface ConnectionAckMessage {
  type: "connection_ack";
  payload?: Record<string, unknown> | null;
}

interface PingMessage {
  type: "ping";
  payload?: Record<string, unknown> | null;
}

interface PongMessage {
  type: "pong";
  payload?: Record<string, unknown> | null;
}

interface SubscribeMessage {
  id: string;
  type: "subscribe";
  payload: {
    operationName?: string | null;
    query: string;
    variables?: Record<string, unknown> | null;
    extensions?: Record<string, unknown> | null;
  };
}

interface NextMessage {
  id: string;
  type: "next";
  payload: {
    data: Subscription;
  };
}

interface ErrorMessage {
  id: string;
  type: "error";
  payload: readonly GraphQLError[];
}

interface CompleteMessage {
  id: string;
  type: "complete";
}
export type Message =
  | CompleteMessage
  | ErrorMessage
  | NextMessage
  | SubscribeMessage
  | PongMessage
  | PingMessage
  | ConnectionAckMessage
  | ConnectionInitMessage;
