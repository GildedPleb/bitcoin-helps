// dynamo.test.ts

import {
  DeleteItemCommand,
  type DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import {
  acquireLock,
  addConnection,
  addStreamContent,
  CONNECTIONS_TABLE,
  getConnection,
  getStreamContent,
  LANGUAGE_LOCKS_TABLE,
  releaseLock,
  removeConnection,
  STREAM_CONTENT_TABLE,
  ttl,
} from "./dynamo";

describe("dynamo operations", () => {
  let mockClient: DynamoDBClient;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockSend = jest.fn();
    mockClient = { send: mockSend } as unknown as DynamoDBClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call the PutItemCommand with the correct parameters when adding a connection", async () => {
    // Arrange
    const connectionId = "some-connection-id";

    // Act
    await addConnection(connectionId, mockClient);

    const mockItem = {
      Item: { connectionId, ttl },
      TableName: CONNECTIONS_TABLE,
    };

    // Assert
    expect(marshall).toHaveBeenCalledTimes(1);
    expect(marshall).toHaveBeenCalledWith({
      connectionId,
      ttl: expect.any(Number) as number,
    });
    expect(PutItemCommand).toHaveBeenCalledWith(mockItem);
    expect(mockSend).toHaveBeenCalledWith({ input: mockItem });
  });

  it("should call the DeleteItemCommand with the correct parameters when removing a connection", async () => {
    // Arrange
    const connectionId = "some-other-connection-id";

    // Act
    await removeConnection(connectionId, mockClient);

    const mockItem = {
      Key: { connectionId },
      TableName: CONNECTIONS_TABLE,
    };

    // Assert
    expect(marshall).toHaveBeenCalledTimes(1);
    expect(marshall).toHaveBeenCalledWith({ connectionId });
    expect(DeleteItemCommand).toHaveBeenCalledWith(mockItem);
    expect(mockSend).toHaveBeenCalledWith({ input: mockItem });
  });

  // The rest of your imports...

  it("should call the GetItemCommand with the correct parameters when getting a connection", async () => {
    // Arrange
    const connectionId = "some-connection-id";
    const mockResponse = { Item: marshall({ connectionId, ttl }) };

    // We mock the response to return an object similar to what the real service would return
    mockSend.mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getConnection(connectionId, mockClient);

    const mockItem = {
      Key: marshall({ connectionId }),
      TableName: CONNECTIONS_TABLE,
    };

    // Assert
    expect(marshall).toHaveBeenCalledTimes(3);
    expect(marshall).toHaveBeenCalledWith({ connectionId });
    expect(GetItemCommand).toHaveBeenCalledWith(mockItem);
    expect(mockSend).toHaveBeenCalledWith(new GetItemCommand(mockItem));
    expect(unmarshall).toHaveBeenCalledWith(mockResponse.Item);
    expect(result).toEqual(unmarshall(mockResponse.Item));
  });

  it("should return undefined when getting a non-existing connection", async () => {
    // Arrange
    const connectionId = "non-existing-connection-id";
    const mockResponse = {}; // No 'Item' field present in the response

    // We mock the response to return an object similar to what the real service would return
    mockSend.mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getConnection(connectionId, mockClient);

    const expectedInput = {
      Key: marshall({ connectionId }),
      TableName: CONNECTIONS_TABLE,
    };

    // Assert
    expect(marshall).toHaveBeenCalledTimes(2);
    expect(marshall).toHaveBeenCalledWith({ connectionId });
    expect(GetItemCommand).toHaveBeenCalledWith(expectedInput);
    expect(mockSend).toHaveBeenCalledWith(new GetItemCommand(expectedInput));
    expect(result).toBeUndefined();
  });

  it("should call the PutItemCommand with the correct parameters when adding stream content", async () => {
    // Arrange
    const streamId = "some-stream-id";
    const sequenceNumber = 1;
    const content = "some-content-for-stream";

    // Act
    await addStreamContent(streamId, sequenceNumber, content, mockClient);

    const expectedInput = {
      Item: marshall({ streamId, sequenceNumber, content, ttl }),
      TableName: STREAM_CONTENT_TABLE,
    };

    // Assert
    expect(marshall).toHaveBeenCalledTimes(2);
    expect(marshall).toHaveBeenCalledWith({
      streamId,
      sequenceNumber,
      content,
      ttl,
    });
    expect(PutItemCommand).toHaveBeenCalledWith(expectedInput);
    expect(mockSend).toHaveBeenCalledWith(new PutItemCommand(expectedInput));
  });

  it("should call the QueryCommand with correct parameters when getting stream content", async () => {
    // Arrange
    const streamId = "some-stream-id";
    const sequenceNumber = 1;

    const mockResponse = {
      Items: [
        marshall({ streamId, sequenceNumber, content: "some-content", ttl }),
        marshall({
          streamId,
          sequenceNumber: 2,
          content: "some-other-content",
          ttl,
        }),
      ],
    };

    // We mock the response to return an object similar to what the real service would return
    mockSend.mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getStreamContent(streamId, sequenceNumber, mockClient);

    const expectedInput = {
      KeyConditionExpression: "streamId = :sid and sequenceNumber <= :sn",
      ExpressionAttributeValues: marshall({
        ":sid": streamId,
        ":sn": sequenceNumber,
      }),
      TableName: STREAM_CONTENT_TABLE,
    };

    // Assert
    expect(marshall).toHaveBeenCalledTimes(4);
    expect(marshall).toHaveBeenNthCalledWith(1, {
      content: "some-content",
      sequenceNumber,
      streamId,
      ttl,
    });
    expect(QueryCommand).toHaveBeenCalledWith(expectedInput);
    expect(mockSend).toHaveBeenCalledWith(new QueryCommand(expectedInput));
    expect(result).toEqual(mockResponse.Items.map((item) => unmarshall(item)));
  });

  it("should return an empty array when getting stream content for a non-existing stream", async () => {
    // Arrange
    const streamId = "non-existing-stream-id";
    const sequenceNumber = 1;

    const mockResponse = { Items: undefined }; // No 'Items' field present in the response

    // We mock the response to return an object similar to what the real service would return
    mockSend.mockResolvedValueOnce(mockResponse);

    // Act
    const result = await getStreamContent(streamId, sequenceNumber, mockClient);

    const expectedInput = {
      KeyConditionExpression: "streamId = :sid and sequenceNumber <= :sn",
      ExpressionAttributeValues: marshall({
        ":sid": streamId,
        ":sn": sequenceNumber,
      }),
      TableName: STREAM_CONTENT_TABLE,
    };

    // Assert
    expect(marshall).toHaveBeenCalledTimes(2);
    expect(marshall).toHaveBeenNthCalledWith(1, {
      ":sid": "non-existing-stream-id",
      ":sn": 1,
    });
    expect(QueryCommand).toHaveBeenCalledWith(expectedInput);
    expect(mockSend).toHaveBeenCalledWith(new QueryCommand(expectedInput));
    expect(result).toEqual([]);
  });

  it("should call the PutItemCommand with the correct parameters when acquiring a lock", async () => {
    // Arrange
    const language = "some-language-lock";

    // Mock successful acquisition of lock
    mockSend.mockResolvedValueOnce({});

    // Act
    const result = await acquireLock(language, mockClient);

    const expectedInput = {
      Item: marshall({
        language,
        ttl: expect.any(Number) as number,
      }),
      TableName: LANGUAGE_LOCKS_TABLE,
      ConditionExpression: "attribute_not_exists(#lang)",
      ExpressionAttributeNames: {
        "#lang": "language",
      },
    };

    // Assert
    expect(marshall).toHaveBeenCalledTimes(2);
    expect(marshall).toHaveBeenCalledWith({
      language,
      ttl: expect.any(Number) as number,
    });
    expect(PutItemCommand).toHaveBeenCalledWith(expectedInput);
    expect(mockSend).toHaveBeenCalledWith(new PutItemCommand(expectedInput));
    expect(result).toBe(true);
  });

  it("should return false and log an error when failing to acquire a lock", async () => {
    // Arrange
    const language = "some-language";

    // Mock failed acquisition of lock
    mockSend.mockRejectedValueOnce(new Error("Lock already exists"));

    // Spy on console to check for the correct logs
    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    // Act
    const result = await acquireLock(language, mockClient);

    const expectedInput = {
      Item: marshall({
        language,
        ttl: expect.any(Number) as number,
      }),
      TableName: LANGUAGE_LOCKS_TABLE,
      ConditionExpression: "attribute_not_exists(#lang)",
      ExpressionAttributeNames: {
        "#lang": "language",
      },
    };

    // Assert
    expect(marshall).toHaveBeenCalledTimes(2);
    expect(marshall).toHaveBeenCalledWith({
      language,
      ttl: expect.any(Number) as number,
    });
    expect(PutItemCommand).toHaveBeenCalledWith(expectedInput);
    expect(mockSend).toHaveBeenCalledWith(new PutItemCommand(expectedInput));
    expect(errorSpy).toHaveBeenCalledTimes(2); // two error messages are logged
    expect(errorSpy).toHaveBeenNthCalledWith(
      1,
      "Failed to acquire lock for language:",
      language
    );
    expect(errorSpy).toHaveBeenNthCalledWith(2, expect.any(Error)); // the thrown error
    expect(result).toBe(false); // acquireLock should return false on error

    // Restore console.error
    errorSpy.mockRestore();
  });

  it("should call the DeleteItemCommand with the correct parameters when releasing a lock", async () => {
    // Arrange
    const language = "some-language";

    // Act
    await releaseLock(language, mockClient);

    const expectedInput = {
      Key: marshall({ language }),
      TableName: LANGUAGE_LOCKS_TABLE,
    };

    // Assert
    expect(marshall).toHaveBeenCalledTimes(2);
    expect(marshall).toHaveBeenCalledWith({ language });
    expect(DeleteItemCommand).toHaveBeenCalledWith(expectedInput);
    expect(mockSend).toHaveBeenCalledWith(new DeleteItemCommand(expectedInput));
  });
});
