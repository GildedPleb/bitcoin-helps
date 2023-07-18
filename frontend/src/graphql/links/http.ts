import { HttpLink } from "@apollo/client";

const STAGE = process.env.REACT_APP_STAGE ?? "dev";
const ENDPOINT_HTTP =
  process.env[`REACT_APP_API_URL_HTTP_${STAGE.toUpperCase()}`] ??
  "http://localhost:4000/graphql";

const httpLink = new HttpLink({
  uri: ENDPOINT_HTTP,
});

export default httpLink;
