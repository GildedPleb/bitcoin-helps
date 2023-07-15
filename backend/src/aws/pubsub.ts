import { iot, mqtt } from "aws-crt";
// import dotenv from "dotenv";
import fs from "graceful-fs";

import { FINISHED_STREEM, MESSAGE_QUEUE_TIMEOUT } from "../constants";
import { addStreamContent } from "./dynamo";

// dotenv.config();

export interface Gossip extends Record<string, unknown> {
  message: string;
  sequence: number;
}

export interface PubSub {
  subscribe: () => Promise<AsyncIterable<Gossip>>;
  unsubscribe: () => Promise<void>;
  publish: (message: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

const createPubSub = (topic: string, id: string): PubSub => {
  let publishSequence = 0;
  let subscriberSequence: number | undefined;
  const { AWS_DEVICE_PRIVATE_KEY, AWS_IOT_CLIENT_ID, AWS_IOT_HOST } =
    process.env;
  if (
    AWS_DEVICE_PRIVATE_KEY === undefined ||
    AWS_DEVICE_PRIVATE_KEY === "" ||
    AWS_IOT_CLIENT_ID === undefined ||
    AWS_IOT_CLIENT_ID === "" ||
    AWS_IOT_HOST === undefined ||
    AWS_IOT_HOST === ""
  )
    throw new Error("ENVs for pub-sub are miss-populated");
  const cert = fs.readFileSync("src/public-certs/cert.pem.crt", "utf8");
  if (cert === "") throw new Error("Cert failed import");

  const configBuilder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder(
    cert,
    AWS_DEVICE_PRIVATE_KEY
  );
  const clientId = `${AWS_IOT_CLIENT_ID}-${id.slice(0, 10)}-${Math.floor(
    Math.random() * 10_000_000
  ).toString()}`;

  configBuilder.with_clean_session(false);
  configBuilder.with_client_id(clientId);
  // configBuilder.with_keep_alive_seconds(100);
  configBuilder.with_endpoint(AWS_IOT_HOST);
  const config = configBuilder.build();
  const client = new mqtt.MqttClient();
  const connection = client.new_connection(config);
  let connected = false;

  const connect = async () => {
    if (!connected) {
      await connection.connect();
      connected = true;
      console.log("-------> PUBSUB CONNECTED <---------");
    }
  };

  const disconnect = async () => {
    if (connected) {
      await connection.disconnect();
      connected = false;
      console.log("------> PUBSUB DISCONNECTED <--------");
    }
  };

  console.log("IoT Device created with options:", config);

  const publish = async (message: string): Promise<void> => {
    console.log(`Attempting to publish '${message}' to '${topic}'`);
    await addStreamContent(topic, publishSequence, message);
    await connect();
    const gossip: Gossip = { message, sequence: publishSequence };
    await connection.publish(topic, gossip, mqtt.QoS.AtLeastOnce);
    publishSequence += 1;
  };

  const subscribe = async (): Promise<AsyncIterable<Gossip>> => {
    console.log(`Attempting to subscribe to topic: ${topic}`);
    await connect();

    const messageQueue: Gossip[] = [];
    let resolveNext: ((result: IteratorResult<Gossip>) => void) | undefined;
    // eslint-disable-next-line no-undef
    let timerId: NodeJS.Timeout | undefined;
    let promiseChain = Promise.resolve();

    const deliverNextInSequence = () => {
      // Prevents race condition on timeout logic.
      promiseChain = promiseChain
        .then(() => {
          clearTimeout(timerId);
          if (!resolveNext || messageQueue.length === 0) return;
          const value = messageQueue[0];
          if (subscriberSequence === undefined)
            subscriberSequence = value.sequence;

          // eslint-disable-next-line promise/always-return
          if (value.sequence >= subscriberSequence) {
            const isFinished = value.message === FINISHED_STREEM;
            const inOrder = value.sequence === subscriberSequence;
            if (inOrder) {
              messageQueue.shift();
              resolveNext({ value, done: isFinished });
              resolveNext = undefined;
              subscriberSequence += 1;
            }
            if ((inOrder && !isFinished) || !inOrder) {
              timerId = setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (messageQueue[0] !== undefined) {
                  console.log(
                    `Topic: '${topic}', client: '${clientId}' Missed Message(s): ${
                      subscriberSequence ?? "?"
                    } to ${messageQueue[0].sequence - 1} `
                  );
                  subscriberSequence = messageQueue[0].sequence;
                }
                deliverNextInSequence();
              }, MESSAGE_QUEUE_TIMEOUT);
            }
          } else if (subscriberSequence !== 0 && messageQueue.length > 0) {
            console.log("Duplicates detected");
            messageQueue.shift();
          }
        })
        .catch((error) => {
          console.error("Error during message processing:", error);
        });
    };

    const processMessage = (_topic: string, payload: Uint8Array) => {
      const stringPayload = new TextDecoder().decode(payload);
      const value = JSON.parse(stringPayload) as Gossip;
      console.log("gossip", value);
      if (
        subscriberSequence !== undefined &&
        value.sequence < subscriberSequence
      ) {
        const stringified = JSON.stringify(value);
        const message = `Late Message: ${stringified}. Confirm that it is not a duplicate before adjusting MESSAGE_QUEUE_TIMEOUT, presently: ${MESSAGE_QUEUE_TIMEOUT}`;
        console.log(message);
        return;
      }
      messageQueue.push(value);
      messageQueue.sort((a, b) => a.sequence - b.sequence);
      deliverNextInSequence();
    };

    await connection.subscribe(topic, mqtt.QoS.AtLeastOnce, processMessage);

    const asyncIterable: AsyncIterable<Gossip> = {
      [Symbol.asyncIterator]: () => ({
        next: async () =>
          new Promise((resolve) => {
            resolveNext = resolve;
            deliverNextInSequence();
          }),
      }),
    };

    return asyncIterable;
  };

  const unsubscribe = async (): Promise<void> => {
    console.log(`Attempting to unsubscribe from topic: ${topic}`);
    await connect();
    await connection.unsubscribe(topic);
  };

  return {
    publish,
    subscribe,
    unsubscribe,
    disconnect,
  };
};

export default createPubSub;
