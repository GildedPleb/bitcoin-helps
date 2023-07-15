import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const ENDPOINT_WS =
  process.env.REACT_APP_API_URL_WS ?? "ws://localhost:4000/graphql";

const wsLink = new GraphQLWsLink(
  createClient({
    url: ENDPOINT_WS,
    on: {
      message: (message) => {
        // console.log(message);
        // console.log(
        //   "Received message:",
        //   // @ts-expect-error i just dont give a shit
        //   message.payload?.data?.subscribeToArgument
        // );
      },
      connected: (message) => {
        console.log("Connected!", message);
      },
      closed: (message) => {
        console.log("Disconnected!", message);
      },
    },
    keepAlive: 10_000,
    shouldRetry: (event) => {
      console.log("got a CLOSE EVENT:", event);
      return true;
    },
  })
);

export default wsLink;
