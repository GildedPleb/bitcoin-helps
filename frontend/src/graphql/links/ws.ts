import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const STAGE = process.env.REACT_APP_STAGE ?? "dev";
const ENDPOINT_WS =
  process.env[`REACT_APP_API_URL_WS_${STAGE.toUpperCase()}`] ??
  "ws://localhost:4000/graphql";

const wsLink = new GraphQLWsLink(
  createClient({
    url: ENDPOINT_WS,
    keepAlive: 10_000,
    shouldRetry: () => true,
  })
);

export default wsLink;
