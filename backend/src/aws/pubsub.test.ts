// pubSub.test.ts

import * as awsCrt from "aws-crt";
import * as gracefulFs from "graceful-fs";

import { FINISHED_STREEM } from "../constants";
import { addStreamContent } from "./dynamo";
import createPubSub from "./pubsub";

jest.mock("aws-crt", () => ({
  iot: {
    AwsIotMqttConnectionConfigBuilder: {
      new_mtls_builder: jest.fn(() => ({
        with_clean_session: jest.fn().mockReturnThis(),
        with_client_id: jest.fn().mockReturnThis(),
        with_endpoint: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnThis(),
      })),
    },
  },
  mqtt: {
    MqttClient: jest.fn().mockImplementation(() => {
      // Create mock functions for connect and publish
      // eslint-disable-next-line unicorn/no-useless-undefined
      const connect = jest.fn().mockResolvedValue(undefined);
      const publish = jest.fn().mockImplementation(() => {
        connect();
      });

      return {
        bootstrap: jest.fn(),
        handle: jest.fn(),
        native_handle: jest.fn(),
        new_connection: jest.fn().mockReturnValue({
          connect,
          disconnect: jest.fn(),
          publish,
          subscribe: jest
            .fn()
            .mockImplementation(
              (
                topic: string,
                QoS: number,
                callback: (topic: string, data: Uint8Array) => void
              ) => {
                // mock the callback to return some dummy data
                const data = new TextEncoder().encode(
                  JSON.stringify({ message: "mockMessage", sequence: 1 })
                );
                callback(topic, data);
              }
            ),
          unsubscribe: jest.fn(),
        }),
      };
    }),
    QoS: {
      AtLeastOnce: 0,
    },
  },
}));

jest.mock("graceful-fs", () => ({
  readFileSync: jest.fn().mockReturnValue("dummy_certificate"),
}));

jest.mock("./dynamo", () => ({
  // eslint-disable-next-line unicorn/no-null
  addStreamContent: jest.fn().mockResolvedValue(null),
  databaseClient: {},
}));

describe("createPubSub", () => {
  beforeAll(() => {
    process.env.AWS_DEVICE_PRIVATE_KEY = "my-private-key";
    process.env.AWS_IOT_CLIENT_ID = "my-client-id";
    process.env.AWS_IOT_HOST = "my-iot-host";
  });

  it("should correctly initialize the pubSub client", () => {
    const topic = "test_topic";
    const id = "test_id";

    const pubSub = createPubSub(topic, id);

    expect(
      // eslint-disable-next-line @typescript-eslint/unbound-method
      awsCrt.iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder
    ).toHaveBeenCalledWith(
      "dummy_certificate",
      process.env.AWS_DEVICE_PRIVATE_KEY
    );
    expect(pubSub).toHaveProperty("publish");
    expect(pubSub).toHaveProperty("subscribe");
    expect(pubSub).toHaveProperty("unsubscribe");
    expect(pubSub).toHaveProperty("disconnect");
  });

  it("should correctly publish a message", async () => {
    const topic = "test_topic";
    const id = "test_id";
    const message = "test message";

    // Create a reference to the mocked functions
    const mockedConnect = jest.fn();
    const mockedPublish = jest.fn();

    // Update the MqttClient mock
    (awsCrt.mqtt.MqttClient as jest.MockedClass<typeof awsCrt.mqtt.MqttClient>)
      // @ts-expect-error this is insane.
      .mockImplementation(() => ({
        new_connection: jest.fn().mockReturnValue({
          connect: mockedConnect,
          disconnect: jest.fn(),
          publish: mockedPublish,
          subscribe: jest.fn(),
          unsubscribe: jest.fn(),
        }),
        bootstrap: {
          handle: jest.fn(),
          native_handle: jest.fn(),
        },
        handle: jest.fn(),
        native_handle: jest.fn(),
      }));

    const pubSub = createPubSub(topic, id);

    // Publish a message
    await pubSub.publish(message);

    // Check if the connect function has been called
    expect(mockedConnect).toHaveBeenCalled();

    // Check if the publish function has been called
    expect(mockedPublish).toHaveBeenCalled();
  });

  // To test the subscribe function, we will need to create a publisher and a subscriber. The publisher will need to be able to publish messages and the subscriber will need to be able to listen to messages in an async and independent manner.

  // Some of the test will need to include:
  // - publishing messages sequentially out of order
  // - publishing messages with large delays
  // - publishing messages with missing frames

  // and other edge cases. We need to focus on these "e2e" tests and not on the minutia of the "unit" test or "integration" test which will crazily bog down mocking

  // Continue with er tests (e.g., subscribe, unsubscribe, disconnect)
});
