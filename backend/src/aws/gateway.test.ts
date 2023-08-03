import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

import { type Message } from "../graphql/types";
import { databaseClient, getConnection, removeConnection } from "./dynamo";
import createSendMessage from "./gateway";

jest.mock("@aws-sdk/client-apigatewaymanagementapi");
jest.mock("./dynamo");

describe("gateway operations", () => {
  let mockGetConnection: jest.Mock;
  let mockRemoveConnection: jest.Mock;
  let mockGatewaySend: jest.Mock;

  beforeEach(() => {
    mockGatewaySend = jest.fn();

    (ApiGatewayManagementApiClient as jest.Mock).mockImplementation(() => ({
      send: mockGatewaySend,
    }));

    mockGetConnection = (getConnection as jest.Mock).mockResolvedValue(true);
    mockRemoveConnection = (removeConnection as jest.Mock).mockResolvedValue(
      {}
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call the send method of the ApiGatewayManagementApiClient with the correct parameters when sending a message", async () => {
    // Arrange
    const connectionId = "some-connection-id-1";
    const message: Message = {
      type: "ping",
    };
    const sendMessage = createSendMessage(connectionId);

    // Act
    await sendMessage(message);

    // Assert
    expect(mockGetConnection).toHaveBeenCalledWith(
      connectionId,
      databaseClient
    );
    expect(ApiGatewayManagementApiClient).toHaveBeenCalledWith({
      apiVersion: "2018-11-29",
      endpoint: "ERROR: PUBLISH_ENDPOINT env not provided",
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(mockGatewaySend.mock.calls[0][0]).toBeInstanceOf(
      PostToConnectionCommand
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const actualCommand = mockGatewaySend.mock.calls[0][0];
    expect(actualCommand).toBeInstanceOf(PostToConnectionCommand);
  });

  it("should remove connection when an error with statusCode 410 occurs while sending message", async () => {
    // Arrange
    const connectionId = "some-connection-id-2";
    const message: Message = {
      type: "ping",
    };
    const sendMessage = createSendMessage(connectionId);

    // Mock a error response with statusCode 410
    const errorResponse = {
      statusCode: 410,
    };
    mockGatewaySend.mockImplementationOnce(() => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw errorResponse;
    });

    // Act
    try {
      await sendMessage(message);
    } catch {
      // We expect an error to be thrown, do nothing
    }

    // Assert
    expect(mockRemoveConnection).toHaveBeenCalledWith(
      connectionId,
      databaseClient
    );
  });

  it("should not attempt to send message if there's no connection", async () => {
    // Arrange
    const connectionId = "some-connection-id-3";
    const message: Message = {
      type: "ping",
    };
    const sendMessage = createSendMessage(connectionId);

    // Mock getConnection to return false
    mockGetConnection.mockResolvedValueOnce(false);

    // Act
    process.env.PUBLISH_ENDPOINT = "wss://test.endpoint.com";
    await sendMessage(message);

    // Assert
    expect(mockGetConnection).toHaveBeenCalledWith(
      connectionId,
      databaseClient
    );
    expect(mockGatewaySend).not.toHaveBeenCalled();
  });

  it("should handle unexpected errors gracefully", async () => {
    // Arrange
    const connectionId = "some-connection-id";
    const message: Message = {
      /* your message data here */
      type: "ping",
    };
    const sendMessage = createSendMessage(connectionId);

    // Mock a unexpected error
    const unexpectedError = new Error("Unexpected error");
    mockGatewaySend.mockImplementationOnce(() => {
      throw unexpectedError;
    });

    // Spy on console.error
    const errorSpy = jest.spyOn(console, "error");
    errorSpy.mockImplementation(() => {});

    // Act
    process.env.PUBLISH_ENDPOINT = "wss://test.endpoint.com";
    await sendMessage(message);

    // Assert
    expect(errorSpy).toHaveBeenCalledWith(unexpectedError);
    expect(mockRemoveConnection).not.toHaveBeenCalled();

    // Restore console.error
    errorSpy.mockRestore();
  });
});
