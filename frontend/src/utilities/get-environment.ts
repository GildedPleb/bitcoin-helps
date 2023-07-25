/**
 * Gets the ENV var by name
 * @param key - The Env Name
 * @param fallback - The fallback value to return
 */
export default function getEnvironmentVariable(
  key: keyof ImportMeta["env"],
  fallback: string
): string {
  const value = import.meta.env[key] as string;
  if (typeof value === "string") {
    return value;
  }
  return fallback;
}
