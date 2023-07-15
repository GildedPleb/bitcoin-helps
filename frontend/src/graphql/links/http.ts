import { HttpLink } from "@apollo/client";

const ENDPOINT_HTTP =
  process.env.REACT_APP_API_URL_HTTP ?? "http://localhost:4000/graphql";

const httpLink = new HttpLink({
  uri: ENDPOINT_HTTP,
});

export default httpLink;
