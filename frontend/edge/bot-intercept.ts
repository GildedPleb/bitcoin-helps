// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */
// edge/bot-intercept

import querystring from "node:querystring";

import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import isbot from "isbot";
import tags from "language-tags";

type TitleStatus = "started" | "completed";

interface TitleEntry {
  title?: string;
  subtitle?: string;
  status: TitleStatus;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    message: { content: string; role: string };
    index: number;
    finish_reason: string;
  }>;
}

interface QueryParameters {
  [key: string]:
    | string
    | number
    | boolean
    | readonly string[]
    | readonly number[]
    | readonly boolean[]
    | null
    | undefined;
  i?: string | string[];
  a?: string | string[];
}

interface LanguageCacheEntry {
  siteTitle: string;
  siteDescription: string;
}

interface AffiliationIssueCacheEntry {
  response: string;
  phrase: string;
}

interface CloudFrontRequestEvent {
  Records: Array<{
    cf: {
      request: {
        headers: Record<
          string,
          Array<{
            key: string;
            value: string;
          }>
        >;
        uri: string;
        querystring: string;
      };
    };
  }>;
}

interface UriParseResult {
  error: Error | undefined;
  langTag: string | undefined;
  id: number | undefined;
}

const handelError = (error: unknown) => {
  console.log(error);
};
const BAD = "BAD_CONTENT";
const RTL_LANGUAGES = [
  "ar",
  "fa",
  "ur",
  "ks",
  "yi",
  "he",
  "dv",
  "syc",
  "men",
  "lb",
];

const FLAGGED_PHRASES = [
  "sorry",
  "apologize",
  "please",
  "i can't",
  "i'm not",
  "i'm here",
  "not appropriate",
  "let's keep",
  "refrain from",
  "for your",
];

const affApproved = new Set(["health goth", "leftist"]);

const issApproved = new Set(["demographic decline", "debanking"]);

// WARNING: these must remain structured and not destructured to take advantage of esbuilds environment replacement features.
// eslint-disable-next-line prefer-destructuring
const DOMAIN = process.env.DOMAIN;
// eslint-disable-next-line prefer-destructuring
const TITLE_TABLE = process.env.TITLE_TABLE;
// eslint-disable-next-line prefer-destructuring
const LANGUAGE_TABLE = process.env.LANGUAGE_TABLE;
// eslint-disable-next-line prefer-destructuring
const AFFILIATION_ISSUE_CACHE_TABLE = process.env.AFFILIATION_ISSUE_CACHE_TABLE;
// eslint-disable-next-line prefer-destructuring
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.GPT_VERSION;

if (DOMAIN === undefined || DOMAIN === "")
  throw new Error("DOMAIN env must be populated");

if (TITLE_TABLE === undefined || TITLE_TABLE === "")
  throw new Error("TITLE_TABLE env must be populated");

if (LANGUAGE_TABLE === undefined || LANGUAGE_TABLE === "")
  throw new Error("LANGUAGE_TABLE env must be populated");

if (
  AFFILIATION_ISSUE_CACHE_TABLE === undefined ||
  AFFILIATION_ISSUE_CACHE_TABLE === ""
)
  throw new Error("AFFILIATION_ISSUE_CACHE_TABLE env must be populated");

const DOMAIN_STAGED = `https://${DOMAIN}`;

const URL = "https://api.openai.com/v1/chat/completions";

/**
 *
 * @param message - the message to send the API
 * @param signal - abort signal
 * @param restrictToYesNo - weather to limit tokens
 * @param defaultResponse - in the case of restrict to yes or no, default is returned when neight yes nor no is returned.
 */
async function fetchGptResponse(
  message: string,
  signal?: AbortSignal,
  restrictToYesNo = false,
  defaultResponse = ""
): Promise<string | undefined> {
  try {
    if (OPENAI_API_KEY === undefined || OPENAI_API_KEY === "")
      throw new Error("OPENAI_API_KEY env must be populated");
    if (MODEL === undefined || MODEL === "")
      throw new Error("MODEL env must be populated");
    const Authorization = `Bearer ${OPENAI_API_KEY}`;
    const headers = { "Content-Type": "application/json", Authorization };

    const promptMessage = {
      role: "user",
      content: message,
    };

    const requestBody = {
      messages: [promptMessage],
      model: MODEL,
      stream: false,
      ...(restrictToYesNo ? { max_tokens: 5 } : {}),
    };

    const body = JSON.stringify(requestBody);
    const data = { headers, method: "POST", body, signal };

    console.log("Calling OpenAI with:", body);
    const response = await fetch(URL, data);
    if (response.ok) {
      const jsonResponse = (await response.json()) as OpenAIResponse;
      console.log("OpenAI raw response:", jsonResponse.choices[0]);
      let modelResponse =
        jsonResponse.choices[0]?.message?.content.trim().toLowerCase() ??
        undefined;

      if (restrictToYesNo) {
        if (
          modelResponse === "y" ||
          modelResponse === "ye" ||
          modelResponse.startsWith("yes")
        ) {
          modelResponse = "yes";
        } else if (modelResponse === "n" || modelResponse.startsWith("no")) {
          modelResponse = "no";
        } else {
          modelResponse = defaultResponse;
        }
      }

      if (FLAGGED_PHRASES.some((phrase) => modelResponse.includes(phrase)))
        return BAD;

      return modelResponse;
    }

    console.error("Error fetching GPT response:", await response.json());
    return undefined;
  } catch (error) {
    console.error("Error fetching GPT response:", error);
    return undefined;
  }
}

const localConfig = {
  region: "localhost",
  endpoint: "http://localhost:8000",
  accessKeyId: "DEFAULT_ACCESS_KEY",
  secretAccessKey: "DEFAULT_SECRET",
};

const remoteConfig = { region: "us-east-2" };

const databaseClient = new DynamoDBClient(
  process.env.IS_OFFLINE === undefined ? remoteConfig : localConfig
);

const getTitle = async (
  argumentId: number
): Promise<TitleEntry | undefined> => {
  const parameters = {
    Key: marshall({ argumentId }),
    TableName: TITLE_TABLE,
  };

  const command = new GetItemCommand(parameters);
  const response = await databaseClient.send(command);

  if (!response.Item) return undefined;
  return unmarshall(response.Item) as TitleEntry;
};

const getLanguage = async (
  languageTag: string
): Promise<LanguageCacheEntry | undefined> => {
  const parameters = {
    Key: marshall({
      languageTag,
    }),
    TableName: LANGUAGE_TABLE,
  };

  const command = new GetItemCommand(parameters);
  const response = await databaseClient.send(command);

  if (!response.Item) return undefined;
  return unmarshall(response.Item) as LanguageCacheEntry;
};

const cacheAffiliationOrIssue = async (
  languageTag: string,
  type: "A" | "I", // It's either 'Affiliation' or 'Issue'
  term: string,
  response: string,
  phrase: string
) => {
  const compositeTerm = `${type}#${term}`;
  const parameters = {
    Item: marshall({
      languageTag,
      compositeTerm,
      response,
      phrase,
    }),
    TableName: AFFILIATION_ISSUE_CACHE_TABLE,
  };
  const command = new PutItemCommand(parameters);
  await databaseClient.send(command);
};

const getAffiliationOrIssue = async (
  languageTag: string,
  type: "A" | "I",
  term: string | undefined
): Promise<AffiliationIssueCacheEntry | undefined> => {
  if (term === undefined || term === "") return undefined;
  const compositeTerm = `${type}#${term}`;
  const parameters = {
    KeyConditionExpression:
      "languageTag = :languageTagValue AND compositeTerm = :compositeTermValue",
    ExpressionAttributeValues: marshall({
      ":languageTagValue": languageTag,
      ":compositeTermValue": compositeTerm,
    }),
    TableName: AFFILIATION_ISSUE_CACHE_TABLE,
  };
  const command = new QueryCommand(parameters);
  const response = await databaseClient.send(command);

  if (!response.Items || response.Items.length === 0) return undefined;
  return unmarshall(response.Items[0]) as AffiliationIssueCacheEntry;
};

/**
 *
 * @param uri - URI
 */
function validateAndParseUri(uri: string): UriParseResult {
  // Strip leading/trailing slashes and split by slash
  // eslint-disable-next-line prefer-const
  let [langTag, id, rest] = uri.split("/").filter((part) => part !== "") as [
    string | undefined,
    string | undefined,
    unknown | undefined
  ];

  // Check if there are more than 2 parts, which would be invalid
  if (rest !== undefined)
    return {
      error: new Error("Invalid URI structure."),
      langTag: undefined,
      id: undefined,
    };

  // Validate BCP-47 language tag
  if (langTag !== undefined && langTag !== "" && !tags.check(langTag))
    return {
      error: new Error("Invalid language tag."),
      langTag,
      id: undefined,
    };

  if (langTag === "") langTag = undefined;

  // Validate ID, if present
  if (id !== undefined && id !== "") {
    const parsedId = Number.parseInt(id, 10);
    if (Number.isNaN(parsedId) || parsedId <= 0)
      return {
        error: new Error("Invalid ID."),
        langTag,
        id: undefined,
      };
    return {
      error: undefined,
      langTag,
      id: parsedId,
    };
  }

  return {
    error: undefined,
    langTag,
    id: undefined,
  };
}

const sanitizeInput = (input: string): string =>
  /**
   * Removes all characters from the input string except for:
   * alphanumeric characters, spaces, hyphens, plus signs, single quotes,
   * ampersands, and open/close parentheses.
   */
  // eslint-disable-next-line unicorn/prefer-string-replace-all
  input.replace(/[^\d &'()+A-Za-z-]+/g, "");

const sanitizeOutput = (input: string, locale = "en"): string => {
  const unwrapped = input
    .trim()
    // eslint-disable-next-line unicorn/prefer-string-replace-all
    .replace(/^["'.]|["'.]$/g, "") // remove outer
    .trim()
    // eslint-disable-next-line unicorn/prefer-string-replace-all
    .replace(/^["'.]|["'.]$/g, "") // remove nested
    .trim();
  return unwrapped.charAt(0).toLocaleUpperCase(locale) + unwrapped.slice(1);
};

/**
 *
 * @param id - argument ID
 * @param rawQueryString - if there is a given Affiliation or issue
 * @param language - Language Tag
 * @example
 * baseUrl: www.domainforstuff.com
 * siteTitle: Domain For Stuff, LLC
 * siteDescription: This is your domain for all kinds of stuff, buy or sell!
 * pageTitle: What is the best way to buy and sell a bike? (www.domainforstuff.com/blog/bikes)
 * pageSubTitle: Selling a bike in the digital age can be difficult, but it doesnt have to be! In this article, we will outline the best strategies for buying and selling bikes online (www.domainforstuff.com/blog/bikes)
 */
async function generateBotContent(
  id: number | undefined,
  rawQueryString: string,
  language = "en"
) {
  const articleTitleRaw =
    id === undefined
      ? Promise.resolve<TitleEntry>({
          title: undefined,
          subtitle: undefined,
          status: "completed",
        })
      : getTitle(id);

  const [articleTitle, translations] = await Promise.all([
    articleTitleRaw,
    getLanguage(language),
  ]);

  let content: string;
  let subContent: string;
  let type: string;
  let href: string;
  console.log("Translations for", language, ":", translations);

  const {
    siteTitle = "Does Bitcoin Help?",
    siteDescription = "Bitcoin helps no matter who you are or what you care about.",
  } = translations ?? {};

  const isRtl = RTL_LANGUAGES.some((rtlLang) => language.startsWith(rtlLang));

  if (id === undefined) {
    // Special case when no ID is provided

    const { i, a } = querystring.parse(rawQueryString);
    console.log("QUERY STRING:", i, a);
    let alignWithFull = "";
    let concernWithFull = "";
    const affChecks: Array<Promise<string | undefined>> = [];
    const issChecks: Array<Promise<string | undefined>> = [];

    const controller = new AbortController();
    const { signal } = controller;

    setTimeout(() => {
      controller.abort();
    }, 3500); // 3.5 seconds

    const cachePromises: Array<
      Promise<AffiliationIssueCacheEntry | undefined> | undefined
    > = [undefined, undefined];
    if (typeof a === "string" && a !== "") {
      const aff = sanitizeInput(a);
      cachePromises[0] = getAffiliationOrIssue(language, "A", aff);
    }

    if (typeof i === "string" && i !== "") {
      const issue = sanitizeInput(i);
      cachePromises[1] = getAffiliationOrIssue(language, "I", issue);
    }
    const responseCache = await Promise.all(cachePromises);

    // Check for affiliation
    if (typeof a === "string" && a !== "") {
      const aff = sanitizeInput(a);
      const ca = responseCache[0];
      console.log("Retrieved Cached Affiliation:", ca);
      const preScreened = affApproved.has(aff.toLowerCase());

      let shouldProcess = false; // Flag to determine if the processing block should be executed

      if (preScreened) {
        if (!ca || ca.response === "" || ca.phrase === "") {
          // Pre-screened and not cached or previously rejected
          shouldProcess = true;
        } else {
          // Pre-screened and cached
          const final = sanitizeOutput(ca.phrase);
          alignWithFull = `${final}. `;
        }
      } else if (ca && ca.response !== "" && ca.phrase !== "") {
        // Not pre-screened and cached
        const final = sanitizeOutput(ca.phrase);
        alignWithFull = `${final}. `;
      } else {
        // Not pre-screened and not cached
        shouldProcess = true;
      }

      // Do the processing if the flag is true
      if (shouldProcess) {
        // Get promises for chatGPT
        const affiliationExists = `Is '${aff}' an ideological affiliation held by any people in the BPC-47 language tag '${language}' speaking world? Answer with only 'Yes' or 'No’.`;
        const affiliationIsGroup = `Is '${aff}' a term used to describe a specific group of people in the BPC-47 language tag '${language}' speaking world? Answer with only 'Yes' or 'No’.`;
        const affiliationIsAppropriate = `Considering legality, cultural sensitivity, and ethical standards globally, is the affiliation '${aff}' potentially inappropriate, offensive, or associated with negative or illegal behavior in the BCP-47 language tag '${language}' speaking world? Answer with only 'Yes' or 'No'.`;
        const correctedAffiliation = `Correctly spell, punctuate, capitalize, and otherwise make "${aff}" grammatically correct as an affiliation or group in the BCP-47 language tag '${language}' speaking world. Answer only with the correct term in the '${language}' language. ONLY REPLY WITH THE TERM.`;
        const correctedAffiliationPhrase = `Correctly spell, punctuate, capitalize, and otherwise make "I align with ${aff}" grammatically correct as a statement of affiliation or group ideological alignment. Translate it into the BCP-47 language tag '${language}' language. Answer only with the correct phrase in the '${language}' language. ONLY REPLY WITH THE PHRASE.`;
        const appropriateAffiliation = `Provide a conventional, neutral, tactful term to replace '${aff}' as an ideological affiliation or group. Translate it into the BCP-47 language tag '${language}' language. Answer only with the appropriate expression in the '${language}' language. ONLY REPLY WITH THE TERM.`;
        const appropriateAffiliationPhrase = `Provide a conventional, neutral, tactful phrase to replace 'I align with ${aff}' a statement of affiliation or group ideological alignment. Translate it into the BCP-47 language tag '${language}' language. Answer only with the appropriate expression in the '${language}' language. ONLY REPLY WITH THE PHRASE.`;

        affChecks.push(
          Promise.resolve(aff),
          fetchGptResponse(affiliationExists, signal, true, "no"),
          fetchGptResponse(affiliationIsGroup, signal, true, "no"),
          fetchGptResponse(affiliationIsAppropriate, signal, true, "yes"),
          fetchGptResponse(correctedAffiliation, signal),
          fetchGptResponse(correctedAffiliationPhrase, signal),
          fetchGptResponse(appropriateAffiliation, signal),
          fetchGptResponse(appropriateAffiliationPhrase, signal)
        );
      }
    }

    // Check for issue
    if (typeof i === "string" && i !== "") {
      const issue = sanitizeInput(i);
      const ci = responseCache[1];
      console.log("Retrieved Cached Issue:", ci);

      const preScreened = issApproved.has(issue.toLowerCase());

      let shouldProcess = false; // Flag to determine if the processing block should be executed

      if (preScreened) {
        if (!ci || ci.response === "" || ci.phrase === "") {
          // Pre-screened and not cached or previously rejected
          shouldProcess = true;
        } else {
          // Pre-screened and cached
          const final = sanitizeOutput(ci.phrase);
          concernWithFull = `${final}. `;
        }
      } else if (ci && ci.response !== "" && ci.phrase !== "") {
        // Not pre-screened and cached
        const final = sanitizeOutput(ci.phrase);
        concernWithFull = `${final}. `;
      } else {
        // Not pre-screened and not cached
        shouldProcess = true;
      }

      // Do the processing if the flag is true
      if (shouldProcess) {
        // Get promises for chatGPT
        const issueExists = `Is the issue '${issue}' a reasonable issue faced or potentially faced by people in the BCP-47 language tag '${language}' speaking community? Answer 'Yes' or 'No' only.`;
        const issueIsAppropriate = `Given the necessity of maintaining decorum and respecting cultural and legal constraints, is the expression of the issue '${issue}' formulated using language or terms that are inappropriate, offensive, explicit, overly vague, or affiliated with illegal content in the regions where the BCP-47 language tag '${language}' is spoken? Answer with only 'Yes' or 'No’.`;
        const correctedIssue = `Correctly spell, punctuate, capitalize, and otherwise make the phrasing of the issue "${issue}" grammatically correct for the BCP-47 language tag '${language}' speaking world. Answer only with the correct term in the '${language}' language. ONLY REPLY WITH THE TERM.`;
        const correctedIssuePhrase = `Correctly spell, punctuate, capitalize, and otherwise make "My concern is ${issue}" grammatically correct as a statement of worry about an problem. Translate it into the BCP-47 language tag '${language}' language. Answer only with the correct phrase in the '${language}' language. ONLY REPLY WITH THE PHRASE.`;
        const appropriateIssue = `Provide a conventional, neutral, tactful phrase to replace '${issue}' as an issue or problem. Translate it into the BCP-47 language tag '${language}' language. Answer only with the appropriate expression in the '${language}' language. ONLY REPLY WITH THE TERM.`;
        const appropriateIssuePhrase = `Provide a conventional, neutral, tactful phrase to replace 'My concern is ${issue}' a statement of worry about an problem. Translate it into the BCP-47 language tag '${language}' language. Answer only with the appropriate expression in the '${language}' language. ONLY REPLY WITH THE PHRASE.`;

        issChecks.push(
          Promise.resolve(issue),
          fetchGptResponse(issueExists, signal, true, "no"),
          fetchGptResponse(issueIsAppropriate, signal, true, "yes"),
          fetchGptResponse(correctedIssue, signal),
          fetchGptResponse(correctedIssuePhrase, signal),
          fetchGptResponse(appropriateIssue, signal),
          fetchGptResponse(appropriateIssuePhrase, signal)
        );
      }
    }

    const [affAnswers, issAnswers] = await Promise.all([
      Promise.all(affChecks),
      Promise.all(issChecks),
    ]);
    console.log("OpenAI Completions:", { affAnswers, issAnswers });

    if (affAnswers.length > 0) {
      const [
        original,
        exists,
        isGroup,
        inppropriate,
        corrected,
        correctedPhrase,
        appropriate,
        appropriatePhrase,
      ] = affAnswers;
      const censored = affAnswers.some((answer) => answer?.includes(BAD));

      const preScreened = affApproved.has(original?.toLowerCase() ?? "Nope");

      if ((exists === "yes" || isGroup === "yes" || preScreened) && !censored) {
        if (inppropriate === "yes") {
          if (appropriate === undefined || appropriatePhrase === undefined) {
            // there was no conventional framing or it failed to return. Do nothing, let it cache next time.
          } else {
            const term = sanitizeOutput(appropriate);
            const phrase = sanitizeOutput(appropriatePhrase);
            alignWithFull = `${phrase}. `;
            cacheAffiliationOrIssue(
              language,
              "A",
              original ?? "",
              term,
              phrase
            ).catch(handelError);
            cacheAffiliationOrIssue(language, "A", term, term, phrase).catch(
              handelError
            );
          }
        } else if (corrected === undefined || correctedPhrase === undefined) {
          // the corrected response failed to return. Do nothing, let it cache next attempt.
        } else {
          const term = sanitizeOutput(corrected);
          const phrase = sanitizeOutput(correctedPhrase);
          alignWithFull = `${phrase}. `;
          cacheAffiliationOrIssue(
            language,
            "A",
            original ?? "",
            term,
            phrase
          ).catch(handelError);
          cacheAffiliationOrIssue(language, "A", term, term, phrase).catch(
            handelError
          );
        }
      } else {
        console.log("Adding a bad A query to cache");

        cacheAffiliationOrIssue(language, "A", original ?? "", "", "").catch(
          handelError
        );
        cacheAffiliationOrIssue(language, "A", corrected ?? "", "", "").catch(
          handelError
        );
      }
    }

    if (issAnswers.length > 0) {
      const [
        original,
        exists,
        inppropriate,
        corrected,
        correctedPhrase,
        appropriate,
        appropriatePhrase,
      ] = issAnswers;

      const censored = affAnswers.some((answer) => answer?.includes(BAD));
      const preScreened = issApproved.has(original?.toLowerCase() ?? "Nope");

      if ((exists === "yes" || preScreened) && !censored) {
        if (inppropriate === "yes") {
          if (appropriate === undefined || appropriatePhrase === undefined) {
            // the appropriately stated response failed to return. Do nothing, let it cache next attempt.
          } else {
            const term = sanitizeOutput(appropriate);
            const phrase = sanitizeOutput(appropriatePhrase);
            concernWithFull = `${phrase}. `;
            cacheAffiliationOrIssue(
              language,
              "I",
              original ?? "",
              term,
              phrase
            ).catch(handelError);
            cacheAffiliationOrIssue(language, "I", term, term, phrase).catch(
              handelError
            );
          }
        } else if (corrected === undefined || correctedPhrase === undefined) {
          // the corrected response failed to return. Do nothing, let it cache next attempt.
        } else {
          const term = sanitizeOutput(corrected);
          const phrase = sanitizeOutput(correctedPhrase);
          concernWithFull = `${phrase}. `;
          cacheAffiliationOrIssue(
            language,
            "I",
            original ?? "",
            term,
            phrase
          ).catch(handelError);
          cacheAffiliationOrIssue(language, "I", term, term, phrase).catch(
            handelError
          );
        }
      } else {
        console.log("Adding a bad I query to cache");
        cacheAffiliationOrIssue(language, "I", original ?? "", "", "").catch(
          (error) => {
            console.log(error);
          }
        );
        cacheAffiliationOrIssue(language, "I", corrected ?? "", "", "").catch(
          (error) => {
            console.log(error);
          }
        );
      }
    }

    // content = isRtl
    //   ? `${siteTitle}${concernWithFull}${alignWithFull}`
    //   : `${alignWithFull}${concernWithFull}${siteTitle}`;

    content = `${alignWithFull}${concernWithFull}${siteTitle}`;

    console.log("CONTENT:", content);
    subContent = siteDescription;
    type = "website";

    const validParameters: QueryParameters = {};
    if (i !== undefined) validParameters.i = i;
    if (a !== undefined) validParameters.a = a;
    const newQueryString = querystring.stringify(validParameters);
    href = `${DOMAIN_STAGED}/${language}?${newQueryString}`;
    console.log("HREF:", href);
  } else {
    const { title: pageTitle, subtitle: pageSubTitle } = articleTitle ?? {};
    const pageTitlePresent = pageTitle !== "" && pageTitle !== undefined;
    content = pageTitlePresent ? `${pageTitle} | ${siteTitle}` : siteTitle;
    subContent = pageSubTitle ?? siteDescription;
    type = pageTitlePresent ? "article" : "website";
    href = pageTitlePresent
      ? `${DOMAIN_STAGED}/${language}`
      : `${DOMAIN_STAGED}/${language}/${id}`;
  }

  const direction = isRtl ? "rtl" : "ltr";
  // This code should match the /index.html and the helmet defs in /src/app/head/index.ts
  return `<!DOCTYPE html>
  <html lang="${language}" dir="${direction}">
  <head>
    <script src="https://kit.fontawesome.com/090ca49637.js" crossorigin="anonymous"></script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="${DOMAIN_STAGED}/favicon.ico" />
    <meta name="theme-color" content="#000000" />

    <!-- Base Meta Tags -->
    <meta name="description" content="${siteDescription}" />
    <title>${content}</title>
    <link rel="canonical" href="${href}" />

    <!-- Open Graph Tags -->
    <meta property="og:url" content="${href}" />
    <meta property="og:title" content="${content}" />
    <meta property="og:description" content="${subContent}" />
    <meta property="og:image" content="${DOMAIN_STAGED}/does_Bitcoin_help.png" />
    <meta property="og:image:alt" content="je؟¿₿?吗か" />
    <meta property="og:type" content="${type}" />

    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@gildedpleb" />
    <meta name="twitter:creator" content="@gildedpleb" />
    <meta name="twitter:title" content="${content}" />
    <meta name="twitter:description" content="${subContent}" />
    <meta name="twitter:image" content="${DOMAIN_STAGED}/does_Bitcoin_help.png" />

    <!-- Other Relevant Tags -->
    <link rel="apple-touch-icon" href="${DOMAIN_STAGED}/logo192.png" />
    <link rel="manifest" href="${DOMAIN_STAGED}/manifest.json" />
    <meta name="robots" content="index, follow" />
  </head>
  <body>
    <div id="root"></div>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <script type="module" crossorigin src="${DOMAIN_STAGED}/assets/index-21e02e5d.js"></script>
  </body>
  </html>
  `;
}

const REDIRECT_REGEX =
  /^[^.]+$|\.(?!(css|gif|ico|jpg|jpeg|js|png|txt|svg|woff|woff2|ttf|map|json|webp|xml|pdf|webmanifest|avif|wasm)$)([^.]+$)/;
const PASS_THROUGH_REGEX = /\.js$|\.png$|\.ico$|\.json$/;
const STATIC_HEADERS = {
  "cache-control": [
    {
      key: "Cache-Control",
      value: "no-cache",
    },
  ],
  "content-type": [
    {
      key: "Content-Type",
      value: "text/html",
    },
  ],
};

export const handler = async (event: CloudFrontRequestEvent) => {
  console.log("Recieved event:", event.Records[0].cf);
  const { request } = event.Records[0].cf;
  const userAgent = request.headers["user-agent"][0].value;
  const { uri, headers, querystring: rawQueryString } = request;

  // If the request is for a known static file type, forward it to S3 without modification.
  if (PASS_THROUGH_REGEX.test(uri)) {
    console.log("Pass through js/png/ico/json files.");
    return request;
  }

  // For everything else, redirect
  if (REDIRECT_REGEX.test(uri)) {
    console.log("Redirecting everything else.");
    request.uri = "/index.html";
  }

  // If its production domain 'www' redirect
  if (headers.host[0].value === `www.${DOMAIN}`) {
    console.log("Redirect www to root");
    return {
      status: "301",
      statusDescription: "Moved Permanently",
      headers: {
        location: [
          {
            key: "Location",
            value: `${DOMAIN_STAGED}${uri}`,
          },
        ],
      },
    };
  }

  if (isbot(userAgent)) {
    console.log("A bot!:", userAgent);

    const { langTag, id } = validateAndParseUri(uri);
    return {
      status: "200",
      statusDescription: "OK",
      headers: STATIC_HEADERS,
      body: await generateBotContent(id, rawQueryString, langTag),
    };
  }
  console.log("Not a bot!:", userAgent);
  return request;
};

export default handler;
