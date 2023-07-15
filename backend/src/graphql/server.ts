import path from "node:path";

import { ApolloServer } from "@apollo/server";
import {
  handlers,
  startServerAndCreateLambdaHandler,
} from "@as-integrations/aws-lambda";
import fs from "graceful-fs";
// eslint-disable-next-line @shopify/typescript/prefer-build-client-schema
import { buildSchema, printSchema } from "graphql";

import createPubSub from "../aws/pubsub";
import { dislike } from "./resolvers/dislike";
import { getAfffiliationsAndIssues } from "./resolvers/get-affiliations-and-issues";
import { getArgumentId } from "./resolvers/get-argument-id";
import { getInputPairByArgumentId } from "./resolvers/get-input-pair-by-argument-id";
import hello from "./resolvers/hello";
import { like } from "./resolvers/like";

const pubsub = createPubSub("fake", "dummy");

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
      subscribe: async () => {
        console.log("This SHOULDNT be hit, but it might be.... ");
        return pubsub.subscribe();
      },
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
