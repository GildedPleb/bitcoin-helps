import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const localConfig = {
  region: "localhost",
  endpoint: "http://localhost:8000",
  accessKeyId: "DEFAULT_ACCESS_KEY",
  secretAccessKey: "DEFAULT_SECRET",
};

const remoteConfig = { region: process.env.AWS_REGION };

const databaseClient = new DynamoDBClient(
  process.env.IS_OFFLINE === undefined ? remoteConfig : localConfig
);

const ttl = Math.floor(Date.now() / 1000) + 60 * 60 * 2; // 2 hours

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE ?? "CONNECTIONS";

export const addConnection = async (connectionId: string) => {
  console.log("adding connection:", connectionId);
  const parameters = {
    Item: marshall({ connectionId, ttl }),
    TableName: CONNECTIONS_TABLE,
  };
  const command = new PutItemCommand(parameters);
  await databaseClient.send(command);
};

export const removeConnection = async (connectionId: string) => {
  console.log("removing connection:", connectionId);
  const parameters = {
    Key: marshall({ connectionId }),
    TableName: CONNECTIONS_TABLE,
  };
  const command = new DeleteItemCommand(parameters);
  await databaseClient.send(command);
};

export const getConnection = async (connectionId: string) => {
  const parameters = {
    Key: marshall({ connectionId }),
    TableName: CONNECTIONS_TABLE,
  };
  const command = new GetItemCommand(parameters);
  const response = await databaseClient.send(command);
  return response.Item ? unmarshall(response.Item) : undefined;
};

// Streaming

export interface StreamContent {
  streamId: string;
  sequenceNumber: number;
  content: string;
  ttl: number;
}

const STREAM_CONTENT_TABLE =
  process.env.STREAM_CONTENT_TABLE ?? "STREAM_CONTENT";

export const addStreamContent = async (
  streamId: string,
  sequenceNumber: number,
  content: string
) => {
  const parameters = {
    Item: marshall({ streamId, sequenceNumber, content, ttl }),
    TableName: STREAM_CONTENT_TABLE,
  };
  const command = new PutItemCommand(parameters);
  await databaseClient.send(command);
};

export const getStreamContent = async (
  streamId: string,
  sequenceNumber: number
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
  const response = await databaseClient.send(command);
  return response.Items?.map((item) => unmarshall(item) as StreamContent) ?? [];
};

// Language locks

const LANGUAGE_LOCKS_TABLE =
  process.env.LANGUAGE_LOCKS_TABLE ?? "LANGUAGE_LOCK";

export const acquireLock = async (language: string) => {
  try {
    const parameters = {
      Item: marshall({
        language,
        ttl: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes
      }),
      TableName: LANGUAGE_LOCKS_TABLE,
      ConditionExpression: "attribute_not_exists(#lang)",
      ExpressionAttributeNames: {
        "#lang": "language",
      },
    };
    const command = new PutItemCommand(parameters);
    await databaseClient.send(command);
    console.log("Acquired lock for language:", language);
    return true;
  } catch (error) {
    console.error("Failed to acquire lock for language:", language);
    console.error(error);
    return false;
  }
};

export const releaseLock = async (language: string) => {
  const parameters = {
    Key: marshall({ language }),
    TableName: LANGUAGE_LOCKS_TABLE,
  };
  const command = new DeleteItemCommand(parameters);
  await databaseClient.send(command);
  console.log("Released language lock for:", language);
};
