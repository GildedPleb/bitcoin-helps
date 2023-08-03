import { extractJSONFromString, extractJSONListFromString } from "../helpers";

export interface BaseAffiliationIssue {
  readonly [x: string]: string | string[];
  name: string;
  description: string;
  examples: string[];
}

/**
 * Validate BaseAffiliationIssue Type
 *
 * @param object - the object to validate
 */
export function validateBaseAffiliationIssue(
  object: unknown
): object is BaseAffiliationIssue {
  if (typeof object !== "object" || object === null) {
    return false;
  }

  const requiredKeys: Array<keyof BaseAffiliationIssue> = [
    "name",
    "description",
    "examples",
  ];

  for (const key of requiredKeys) if (!(key in object)) return false;
  if ("name" in object && typeof object.name !== "string") return false;
  if ("description" in object && typeof object.description !== "string")
    return false;
  return (
    "examples" in object &&
    !(
      !Array.isArray(object.examples) ||
      !object.examples.every(
        (example) => typeof example === "string" && example.length < 128
      )
    )
  );
}

export const verifyBaseAffiliationIssue = (
  object: string
): string | undefined => {
  const json = extractJSONFromString(object);
  if (json === undefined)
    return "Response must include one and only one valid JSON object";

  if (typeof json !== "object" || json === null)
    return `JSON must be an object, got a ${typeof json}`;

  const requiredKeys: Array<keyof BaseAffiliationIssue> = [
    "name",
    "description",
    "examples",
  ];

  const errors: string[] = [];

  if (Object.entries(json).length !== requiredKeys.length)
    errors.push(`The number of keys is miss-matched`);

  const objectKeys = Object.keys(json);
  const invalidKeys = objectKeys.filter(
    (key) => !requiredKeys.includes(key as keyof BaseAffiliationIssue)
  );
  if (invalidKeys.length > 0)
    errors.push(`Do not include the invalid key(s): ${invalidKeys.join(", ")}`);

  const keys: Array<string | number> = [];
  for (const key of requiredKeys) if (!(key in json)) keys.push(key);
  if (keys.length > 0) errors.push(`Missing the key(s): ${keys.join(", ")}`);

  if (errors.length > 0)
    errors.push(`The JSON object must match this schema: {
      "name": "string",
      "description": "string",
      "examples": ["string", "string", ...]
     }`);

  const values: string[] = [];
  for (const key of ["name", "description"])
    if (key in json && typeof json[key] !== "string") values.push(key);
  if (values.length > 0)
    errors.push(
      `The following keys have values which are not type 'string': ${values.join(
        ", "
      )}`
    );

  if ("examples" in json) {
    if (Array.isArray(json.examples)) {
      if (json.examples.length < 5)
        errors.push("Must include at least 5 examples in the JSON");
      const innerErrors = json.examples
        .map((example, index) => {
          if (typeof example !== "string")
            return `Example #${index} must be a string`;
          if (example.length > 128)
            return `Example #${index} must be less than 128 characters`;
          return "";
        })
        .filter((item) => item !== "");
      if (innerErrors.length > 0) errors.push(innerErrors.join(", "));
    } else {
      errors.push("Examples key must contain an array of strings");
    }
  }
  if (errors.length > 0) return `${errors.join(". ")}.`;
  return undefined;
};

export const verifyAffiliationIssueList = (
  input: string
): string | undefined => {
  const list = extractJSONListFromString(input);
  if (list === undefined)
    return `Response must include one and only one valid JSON list: ["string", "string", ... ]`;

  const errors = list
    .map((example, index) => {
      if (typeof example !== "string") return `Item #${index} must be a string`;
      if (example.length > 128)
        return `Item #${index} must be less than 128 characters`;
      return "";
    })
    .filter((item) => item !== "");
  if (errors.length > 0) return errors.join(", ");
  return undefined;
};

export interface IssueCategoryCreateWithoutLanguageInput {
  name: string;
  description: string;
  issues: { create: Array<{ name: string }> };
}

export interface AffiliationTypeCreateWithoutLanguageInput {
  name: string;
  description: string;
  affiliations: { create: Array<{ name: string }> };
}
