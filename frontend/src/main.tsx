import { ApolloProvider } from "@apollo/client";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app/app";
import client from "./graphql/client";
import { LanguageProvider } from "./providers/language";
import { LoadingProvider } from "./providers/loading";
import GlobalStyles from "./styles/global";

const root = ReactDOM.createRoot(
  document.querySelector("#root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <LanguageProvider>
        <BrowserRouter>
          <LoadingProvider>
            <GlobalStyles />
            <App />
          </LoadingProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ApolloProvider>
  </React.StrictMode>
);
