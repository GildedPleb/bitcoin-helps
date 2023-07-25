import type {} from "vite/client";

interface ImportMeta {
  env: {
    [key: string]: string | boolean | undefined;
    VITE_REACT_APP_STAGE?: string;
    VITE_REACT_APP_API_URL_HTTP_DEV?: string;
    VITE_REACT_APP_API_URL_HTTP_PROD?: string;
  };
}
