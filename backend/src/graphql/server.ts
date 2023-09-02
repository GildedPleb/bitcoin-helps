import path from "node:path";

import { ApolloServer } from "@apollo/server";
import {
  handlers,
  startServerAndCreateLambdaHandler,
} from "@as-integrations/aws-lambda";
import fs from "graceful-fs";
// eslint-disable-next-line @shopify/typescript/prefer-build-client-schema
import { buildSchema, printSchema } from "graphql";

import { type Gossip } from "../aws/pubsub";
import { dislike } from "./resolvers/dislike";
import { getAfffiliationsAndIssues } from "./resolvers/get-affiliations-and-issues";
import { getArgumentId } from "./resolvers/get-argument-id";
import { getInputPairByArgumentId } from "./resolvers/get-input-pair-by-argument-id";
import hello from "./resolvers/hello";
import { like } from "./resolvers/like";

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/require-await
async function* asyncGossipGenerator(): AsyncGenerator<Gossip, void> {
  yield { message: "Mocked message", sequence: 0 };
}

/**
 *
 * @param topic - mocked topic to log
 */
function mockSubscriptionWarning(topic: string): AsyncIterable<Gossip> {
  console.log(`This SHOULD NOT be hit, but it might be... ${topic}`);
  return asyncGossipGenerator();
}

const schema = buildSchema(
  // eslint-disable-next-line unicorn/prefer-module
  fs.readFileSync(path.join(__dirname, "./schema.graphql"), "utf8")
);
const typeDefs = printSchema(schema);

const resolvers = {
  Query: {
    hello,
    getAfffiliationsAndIssues,
    getArgumentId,
    getInputPairByArgumentId,
  },
  Mutation: {
    like,
    dislike,
  },
  Subscription: {
    subscribeToArgument: {
      subscribe: () => mockSubscriptionWarning("argument"),
    },
    subscribeToInvoice: {
      subscribe: () => mockSubscriptionWarning("invoice"),
    },
  },
  InputPairOrJob: {
    // eslint-disable-next-line no-underscore-dangle
    __resolveType(value: unknown) {
      if (typeof value === "object" && value !== null) {
        if ("jobId" in value) return "Job"; // Type name
        if ("arguments" in value) return "InputPair"; // Type name
      }
      console.error("Value that is erroring:", value);
      throw new Error("Invalid type");
    },
  },
};

export const server = new ApolloServer({
  resolvers,
  typeDefs,
});

export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler()
);

export default handler;
