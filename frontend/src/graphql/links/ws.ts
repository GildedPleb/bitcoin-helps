import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

import { KEEP_ALIVE } from "../../utilities/constants";
import getEnvironmentVariable from "../../utilities/get-environment";

const STAGE = getEnvironmentVariable("VITE_APP_STAGE", "broken");
const key = `VITE_APP_API_URL_WS_${STAGE.toUpperCase()}`;
const defaultEndpoint = "ws://localhost:4000/graphql";
const ENDPOINT_WS = getEnvironmentVariable(key, defaultEndpoint);

const wsLink = new GraphQLWsLink(
  createClient({
    url: ENDPOINT_WS,
    keepAlive: KEEP_ALIVE,
    shouldRetry: () => true,
  })
);

export default wsLink;
