import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export const localConfig = {
  region: "localhost",
  endpoint: "http://localhost:8000",
  accessKeyId: "DEFAULT_ACCESS_KEY",
  secretAccessKey: "DEFAULT_SECRET",
};

export const remoteConfig = { region: process.env.AWS_REGION };

export const databaseClient = new DynamoDBClient(
  process.env.IS_OFFLINE === undefined ? remoteConfig : localConfig
);

export const ttl = Math.floor(Date.now() / 1000) + 60 * 60 * 2; // 2 hours

export const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE ?? "CONNECTIONS";

export const addConnection = async (
  connectionId: string,
  client: DynamoDBClient
) => {
  console.log("adding connection:", connectionId);
  const parameters = {
    Item: marshall({ connectionId, ttl }),
    TableName: CONNECTIONS_TABLE,
  };
  const command = new PutItemCommand(parameters);
  await client.send(command);
};

export const removeConnection = async (
  connectionId: string,
  client: DynamoDBClient
) => {
  console.log("removing connection:", connectionId);
  const parameters = {
    Key: marshall({ connectionId }),
    TableName: CONNECTIONS_TABLE,
  };
  const command = new DeleteItemCommand(parameters);
  await client.send(command);
};

export const getConnection = async (
  connectionId: string,
  client: DynamoDBClient
) => {
  const parameters = {
    Key: marshall({ connectionId }),
    TableName: CONNECTIONS_TABLE,
  };
  const command = new GetItemCommand(parameters);
  const response = await client.send(command);
  return response.Item ? unmarshall(response.Item) : undefined;
};

// Streaming

export interface StreamContent {
  streamId: string;
  sequenceNumber: number;
  content: string;
  ttl: number;
}

export const STREAM_CONTENT_TABLE =
  process.env.STREAM_CONTENT_TABLE ?? "STREAM_CONTENT";

export const addStreamContent = async (
  streamId: string,
  sequenceNumber: number,
  content: string,
  client: DynamoDBClient
) => {
  const parameters = {
    Item: marshall({ streamId, sequenceNumber, content, ttl }),
    TableName: STREAM_CONTENT_TABLE,
  };
  const command = new PutItemCommand(parameters);
  await client.send(command);
};

export const getStreamContent = async (
  streamId: string,
  sequenceNumber: number,
  client: DynamoDBClient
): Promise<StreamContent[]> => {
  const parameters = {
    KeyConditionExpression: "streamId = :sid and sequenceNumber <= :sn",
    ExpressionAttributeValues: marshall({
      ":sid": streamId,
      ":sn": sequenceNumber,
    }),
    TableName: STREAM_CONTENT_TABLE,
  };
  const command = new QueryCommand(parameters);
  const response = await client.send(command);
  return response.Items?.map((item) => unmarshall(item) as StreamContent) ?? [];
};

// Language locks

export const LANGUAGE_LOCKS_TABLE =
  process.env.LANGUAGE_LOCKS_TABLE ?? "LANGUAGE_LOCK";

export const acquireLock = async (language: string, client: DynamoDBClient) => {
  try {
    const parameters = {
      Item: marshall({ language, ttl }),
      TableName: LANGUAGE_LOCKS_TABLE,
      ConditionExpression: "attribute_not_exists(#lang)",
      ExpressionAttributeNames: {
        "#lang": "language",
      },
    };
    const command = new PutItemCommand(parameters);
    await client.send(command);
    console.log("Acquired lock for language:", language);
    return true;
  } catch (error) {
    console.error("Failed to acquire lock for language:", language);
    console.error(error);
    return false;
  }
};

export const releaseLock = async (language: string, client: DynamoDBClient) => {
  const parameters = {
    Key: marshall({ language }),
    TableName: LANGUAGE_LOCKS_TABLE,
  };
  const command = new DeleteItemCommand(parameters);
  await client.send(command);
  console.log("Released language lock for:", language);
};

// Invoice Subscribers

export const INVOICE_SUBSCRIPTION_TABLE =
  process.env.INVOICE_SUBSCRIPTION_TABLE ?? "INVOICE_SUBSCRIPTION";

export const saveSubscription = async (
  connectionId: string,
  topic: string,
  subscriptionId: string,
  client: DynamoDBClient
) => {
  const parameters = {
    Item: marshall({ connectionId, topic, ttl, subscriptionId }),
    TableName: INVOICE_SUBSCRIPTION_TABLE,
  };
  const command = new PutItemCommand(parameters);
  await client.send(command);
};

export const getSubscription = async (
  topic: string,
  client: DynamoDBClient
): Promise<Array<{ connectionId: string; subscriptionId: string }>> => {
  const parameters = {
    IndexName: "TopicIndex",
    KeyConditionExpression: "topic = :topicValue",
    ExpressionAttributeValues: marshall({
      ":topicValue": topic,
    }),
    TableName: INVOICE_SUBSCRIPTION_TABLE,
  };
  const command = new QueryCommand(parameters);
  const response = await client.send(command);
  return (
    response.Items?.map(
      (item) =>
        unmarshall(item) as { connectionId: string; subscriptionId: string }
    ) ?? []
  );
};

export const deleteSubscription = async (
  topic: string,
  client: DynamoDBClient
) => {
  const connections = await getSubscription(topic, client);
  for await (const { connectionId } of connections) {
    const parameters = {
      Key: marshall({ connectionId, topic }),
      TableName: INVOICE_SUBSCRIPTION_TABLE,
    };
    const command = new DeleteItemCommand(parameters);
    await client.send(command);
  }
};

export const deleteSubscribersByConnectionId = async (
  connectionId: string,
  client: DynamoDBClient
) => {
  const queryParameters = {
    IndexName: "ConnectionIdIndex",
    KeyConditionExpression: "connectionId = :connectionIdValue",
    ExpressionAttributeValues: marshall({
      ":connectionIdValue": connectionId,
    }),
    TableName: INVOICE_SUBSCRIPTION_TABLE,
  };
  const queryCommand = new QueryCommand(queryParameters);
  const queryResponse = await client.send(queryCommand);

  const deletePromises = queryResponse.Items?.map(async (item) => {
    const unmarshalledItem = unmarshall(item) as {
      connectionId: string;
      topic: string;
    };
    const deleteParameters = {
      Key: marshall({
        connectionId: unmarshalledItem.connectionId,
        topic: unmarshalledItem.topic,
      }),
      TableName: INVOICE_SUBSCRIPTION_TABLE,
    };
    const deleteCommand = new DeleteItemCommand(deleteParameters);
    return client.send(deleteCommand);
  });

  // Wait for all delete operations to complete
  if (deletePromises) {
    await Promise.all(deletePromises);
    console.log(
      `Deleted ${deletePromises.length} subscribers for connection ID: ${connectionId}`
    );
  }
};

// Title Cache

export const TITLE_TABLE = process.env.TITLE_TABLE ?? "TITLE_TABLE";

type TitleStatus = "started" | "completed";

interface TitleEntry {
  title: string;
  subtitle: string;
  status: TitleStatus;
}

export const cacheTitle = async (
  argumentId: number,
  title: string,
  subtitle: string,
  client: DynamoDBClient,
  status: TitleStatus
) => {
  const parameters = {
    Item: marshall({ argumentId, title, subtitle, status }),
    TableName: TITLE_TABLE,
  };
  const command = new PutItemCommand(parameters);
  await client.send(command);
};

export const getTitle = async (
  argumentId: number,
  client: DynamoDBClient
): Promise<TitleEntry | undefined> => {
  const parameters = {
    KeyConditionExpression: "argumentId = :argumentIdValue",
    ExpressionAttributeValues: marshall({
      ":argumentIdValue": argumentId,
    }),
    TableName: TITLE_TABLE,
  };
  const command = new QueryCommand(parameters);
  const response = await client.send(command);

  if (!response.Items || response.Items.length === 0) return undefined;
  return unmarshall(response.Items[0]) as TitleEntry;
};
