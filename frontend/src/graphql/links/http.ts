import { HttpLink } from "@apollo/client";

import getEnvironmentVariable from "../../utilities/get-environment";

const STAGE = getEnvironmentVariable("VITE_APP_STAGE", "dev");
const key = `VITE_APP_API_URL_HTTP_${STAGE.toUpperCase()}`;
const defaultEndpoint = "http://localhost:4000/graphql";
const ENDPOINT_HTTP = getEnvironmentVariable(key, defaultEndpoint);

const httpLink = new HttpLink({ uri: ENDPOINT_HTTP });

export default httpLink;
