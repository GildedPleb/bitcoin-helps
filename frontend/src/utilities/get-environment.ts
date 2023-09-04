/**
 * Gets the ENV var by name
 * @param key - The Env Name
 * @param fallback - The fallback value to return
 */
export default function getEnvironmentVariable(
  key: keyof ImportMeta["env"],
  fallback: string
): string {
  if (key === "VITE_APP_STAGE") return import.meta.env.VITE_APP_STAGE as string;

  if (key === "VITE_APP_API_URL_HTTP_DEV")
    return import.meta.env.VITE_APP_API_URL_HTTP_DEV as string;

  if (key === "VITE_APP_API_URL_HTTP_PROD")
    return import.meta.env.VITE_APP_API_URL_HTTP_PROD as string;

  if (key === "VITE_APP_API_URL_WS_DEV")
    return import.meta.env.VITE_APP_API_URL_WS_DEV as string;

  if (key === "VITE_APP_API_URL_WS_PROD")
    return import.meta.env.VITE_APP_API_URL_WS_PROD as string;

  if (key === "VITE_SITE_TITLE")
    return import.meta.env.VITE_SITE_TITLE as string;

  if (key === "VITE_SITE_DESCRIPTION")
    return import.meta.env.VITE_SITE_DESCRIPTION as string;

  if (key === "VITE_DOMAIN_STAGED")
    return import.meta.env.VITE_DOMAIN_STAGED as string;

  return fallback;
}
