// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */
// edge/bot-intercept

import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import isbot from "isbot";
import tags from "language-tags";

// WARNING: these must remain structured and not destructured to take advantage of esbuilds environment replacement features.
// eslint-disable-next-line prefer-destructuring
const DOMAIN = process.env.DOMAIN;
// eslint-disable-next-line prefer-destructuring
const TITLE_TABLE = process.env.TITLE_TABLE;
// eslint-disable-next-line prefer-destructuring
const LANGUAGE_TABLE = process.env.LANGUAGE_TABLE;

if (DOMAIN === undefined || DOMAIN === "")
  throw new Error("DOMAIN env must be populated");

if (TITLE_TABLE === undefined || TITLE_TABLE === "")
  throw new Error("TITLE_TABLE env must be populated");

if (LANGUAGE_TABLE === undefined || LANGUAGE_TABLE === "")
  throw new Error("LANGUAGE_TABLE env must be populated");

const DOMAIN_STAGED = `https://${DOMAIN}`;

type TitleStatus = "started" | "completed";

interface TitleEntry {
  title?: string;
  subtitle?: string;
  status: TitleStatus;
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

const getTitle = async (argumentId: number) => {
  const parameters = {
    KeyConditionExpression: "argumentId = :argumentIdValue",
    ExpressionAttributeValues: marshall({
      ":argumentIdValue": argumentId,
    }),
    TableName: TITLE_TABLE,
  };
  const command = new QueryCommand(parameters);
  const response = await databaseClient.send(command);

  // eslint-disable-next-line unicorn/no-useless-undefined
  if (!response.Items || response.Items.length === 0) return undefined;
  return unmarshall(response.Items[0]) as TitleEntry | undefined;
};

interface LanguageCacheEntry {
  siteTitle: string;
  siteDescription: string;
}

const getLanguage = async (
  languageTag: string
): Promise<LanguageCacheEntry | undefined> => {
  const parameters = {
    KeyConditionExpression: "languageTag = :languageTagValue",
    ExpressionAttributeValues: marshall({
      ":languageTagValue": languageTag,
    }),
    TableName: LANGUAGE_TABLE,
  };
  const command = new QueryCommand(parameters);
  const response = await databaseClient.send(command);

  if (!response.Items || response.Items.length === 0) return undefined;
  return unmarshall(response.Items[0]) as LanguageCacheEntry;
};

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
      };
    };
  }>;
}

interface UriParseResult {
  error: Error | undefined;
  langTag: string | undefined;
  id: number | undefined;
}

/**
 *
 * @param uri - URI
 */
export function validateAndParseUri(uri: string): UriParseResult {
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

/**
 *
 * @param id - argument ID
 * @param language - Language Tag
 * @example
 * baseUrl: www.domainforstuff.com
 * siteTitle: Domain For Stuff, LLC
 * siteDescription: This is your domain for all kinds of stuff, buy or sell!
 * pageTitle: What is the best way to buy and sell a bike? (www.domainforstuff.com/blog/bikes)
 * pageSubTitle: Selling a bike in the digital age can be difficult, but it doesnt have to be! In this article, we will outline the best strategies for buying and selling bikes online (www.domainforstuff.com/blog/bikes)
 */
async function generateBotContent(id: number | undefined, language = "en") {
  const articleTitleRaw =
    id === undefined ? { title: undefined, subtitle: undefined } : getTitle(id);

  const [articleTitle, websiteTitle] = await Promise.all([
    articleTitleRaw,
    getLanguage(language),
  ]);

  const idIsNot = id === undefined || articleTitle?.title === undefined;

  const siteTitle = websiteTitle
    ? websiteTitle.siteTitle
    : "Does Bitcoin Help?";
  const siteDescription = websiteTitle
    ? websiteTitle.siteDescription
    : "Bitcoin helps no matter who you are or what you care about.";
  const pageTitle = articleTitle?.title;
  const pageSubTitle = articleTitle?.subtitle;

  const subContent = pageSubTitle ?? siteDescription;
  const content =
    pageTitle !== undefined && pageTitle !== ""
      ? `${pageTitle} | ${siteTitle}`
      : siteTitle;
  const type = idIsNot ? "article" : "website";

  const href = idIsNot
    ? `${DOMAIN_STAGED}/${language}`
    : `${DOMAIN_STAGED}/${language}/${id}`;

  // This code should match the /index.html and the helmet defs in /src/app/head/index.ts
  return `<!DOCTYPE html>
  <html lang="${language}">
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
    <script type="module" crossorigin src="${DOMAIN_STAGED}/assets/index-4a333498.js"></script>
  </body>
  </html>
  `;
}

const REDIRECT_REGEX =
  /^[^.]+$|\.(?!(css|gif|ico|jpg|jpeg|js|png|txt|svg|woff|woff2|ttf|map|json|webp|xml|pdf|webmanifest|avif|wasm)$)([^.]+$)/;

export const handler = async (event: CloudFrontRequestEvent) => {
  console.log("Recieved event:", event.Records[0].cf);
  const { request } = event.Records[0].cf;
  const userAgent = request.headers["user-agent"][0].value;
  const { uri, headers } = request;

  // If the request is for a known static file type, forward it to S3 without modification.
  if (/\.js$|\.png$|\.ico$|\.json$/.test(uri)) {
    console.log("Pass through for js/png/ico/json static files.");
    return request;
  }

  // For everyhting else, redirect
  if (REDIRECT_REGEX.test(uri)) request.uri = "/index.html";

  // If its production domain 'www' redirect
  const hostValue = headers.host[0].value;
  if (hostValue === `www.${DOMAIN}`) {
    console.log("Redirect away from www");
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

  const { langTag, id } = validateAndParseUri(uri);

  if (isbot(userAgent)) {
    console.log("A bot!:", userAgent);
    return {
      status: "200",
      statusDescription: "OK",
      headers: {
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
      },
      body: await generateBotContent(id, langTag),
    };
  }
  console.log("Not a bot!:", userAgent);
  return request;
};

export default handler;
