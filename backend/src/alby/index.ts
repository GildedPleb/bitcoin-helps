import crypto from "node:crypto";

import { LightningAddress } from "@getalby/lightning-tools";
import { decode } from "@holepunch/light-bolt11-decoder";

// import { type Invoice } from "../generated/graphql";
import { type OmittedInvoice } from "../graphql/resolvers/get-speed-up-invoice";

// const authUrl = "https://api.getalby.com/oauth";
// const authUrlToken = "https://api.getalby.com/oauth/token";
// const invoiceUrl = "https://api.getalby.com/invoices";
// const webhookEndpointUrl = "https://api.getalby.com/webhook_endpoints";
// const method = "POST";

// const getHeader = (token?: string) => ({
//   ...(token !== undefined &&
//     token !== "" && { Authorization: `Bearer ${token}` }),
//   "Content-Type": "application/json",
// });

/**
 *
 * @param signal - Abort Signal
 */
// export async function authenticateWithAlby(
//   signal?: AbortSignal
// ): Promise<string | undefined> {
//   try {
//     const clientId = process.env.ALBY_CLIENT_ID;
//     if (clientId === undefined || clientId === "")
//       throw new Error("ALBY_CLIENT_ID required to run");
//     const clientSecret = process.env.ALBY_CLIENT_SECRET;
//     if (clientSecret === undefined || clientSecret === "")
//       throw new Error("ALBY_CLIENT_SECRET required to run");

//     const properties = {
//       client_id: clientId,
//       client_secret: clientSecret,
//       grant_type: "client_credentials",
//       scope: "invoices:create invoices:read",
//       // client_response_type: "code",
//     };
//     const body = new URLSearchParams(properties).toString();
//     const data = {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       method,
//       body,
//       signal,
//     };

//     console.log("Calling Alby API to authenticate:", data);
//     const response = await fetch(authUrlToken, data);
//     if (response.ok) {
//       const results = (await response.json()) as { access_token: string };
//       console.log("results:", results);
//       return results.access_token;
//     }

//     console.error(
//       "Error fetching Alby Auth API response:",
//       response.status,
//       await response.json()
//     );
//     return undefined;
//   } catch (error) {
//     console.error(error);
//     throw new Error("Failed to authenticate with Alby");
//   }
// }

// interface InvoiceData {
//   amount: number;
//   description?: string;
//   description_hash?: string;
//   // expires_at?: string;
// }

/**
 *
 * @param invoiceData - invoice input
 * @param token - auth token
 * @param signal - abort signal
 */
// export async function createAlbyInvoice(
//   invoiceData: InvoiceData,
//   token: string,
//   signal?: AbortSignal
// ): Promise<Invoice | undefined> {
//   // Replace "any" with the specific type if available
//   try {
//     const body = JSON.stringify(invoiceData);
//     const data = { headers: getHeader(token), method, body, signal };

//     console.log("Calling Alby API to create invoice:", data);
//     const response = await fetch(invoiceUrl, data);

//     if (response.ok) return (await response.json()) as Invoice;

//     console.error(
//       "Error fetching Alby Invoice API response:",
//       response.status,
//       await response.json()
//     );
//     return undefined;
//   } catch (error) {
//     console.error(error);
//     throw new Error("Failed to create invoice");
//   }
// }

interface InvoiceDataV2 {
  satoshiAmount: number;
  description: string;
}

/**
 *
 * @param invoiceData - invoice input
 */
export async function createAlbyInvoiceV2(
  invoiceData: InvoiceDataV2
): Promise<OmittedInvoice | undefined> {
  // Replace "any" with the specific type if available
  try {
    const accountName = process.env.ALBY_ACCOUNT_NAME;
    if (accountName === undefined || accountName === "")
      throw new Error("ALBY_ACCOUNT_NAME required to run");
    const whSecret = process.env.WH_SECRET;
    if (whSecret === undefined || whSecret === "")
      throw new Error("WH_SECRET required to run");
    const stage = process.env.STAGE;
    if (stage === undefined || stage === "")
      throw new Error("STAGE required to run");

    const ln = new LightningAddress(accountName, { proxy: false });

    await ln.fetch();

    console.log("ln:", ln);

    const route = `${stage}/${invoiceData.description}`;
    const toHash = `${route}/${whSecret}`;
    const hash = crypto.createHash("sha256").update(toHash).digest("hex");
    const comment = `${route}/${hash}`;

    const invoice = await ln.requestInvoice({
      satoshi: invoiceData.satoshiAmount,
      comment,
    });

    console.log("invoice:", invoice);
    if (invoice.verify !== null && invoice.verify !== "") {
      const response = await fetch(invoice.verify);
      if (response.ok) console.log("Verify response:", await response.json());
    }

    const decoded = decode(invoice.paymentRequest) as {
      sections: Array<{ name: string; value: number }>;
    };
    console.log("decoded:", decoded);
    const timestamp =
      decoded.sections.find((item) => item.name === "timestamp")?.value ?? 0;
    const expiry =
      decoded.sections.find((item) => item.name === "expiry")?.value ?? 0;
    const createdAt = new Date(timestamp * 1000);
    const expiresAt = new Date((timestamp + expiry) * 1000);
    const amount = Math.floor(
      Number(
        decoded.sections.find((item) => item.name === "amount")?.value ?? 0
      ) / 1000
    );

    return {
      paymentHash: invoice.paymentHash,
      paymentRequest: invoice.paymentRequest,
      verify: invoice.verify ?? "",
      createdAt,
      expiresAt,
      amount,
      settled: false,
      comment,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create invoice");
  }
}

export default createAlbyInvoiceV2;

// interface AlbyWebhook {
//   url: string;
//   description: string;
//   filter_types: string[];
//   created_at: string;
//   id: string;
//   endpoint_secret: string;
// }

/**
 *
 * @param webhookUrl - callback url
 * @param token - auth token
 * @param signal - abort signal
 */
// export async function createAlbyWebhook(
//   webhookUrl: string,
//   token?: string,
//   signal?: AbortSignal
// ): Promise<AlbyWebhook | undefined> {
//   try {
//     const body = JSON.stringify({
//       url: webhookUrl,
//       filter_types: ["invoice.settled"],
//     });
//     const data = { headers: getHeader(token), method, body, signal };

//     console.log("Calling Alby API to create webhook endpoint:");
//     const response = await fetch(webhookEndpointUrl, data);

//     if (response.ok) return (await response.json()) as AlbyWebhook;

//     console.error(
//       "Error fetching Alby Webhook API response:",
//       response.status,
//       await response.json()
//     );
//     return undefined;
//   } catch (error) {
//     console.error(error);
//     throw new Error("Failed to create webhook endpoint");
//   }
// }

/**
 *
 * @param webhookId - id
 * @param token - auth token
 * @param signal - abort signal
 */
// export async function deleteAlbyWebhook(
//   webhookId: string,
//   token?: string,
//   signal?: AbortSignal
// ): Promise<boolean> {
//   try {
//     const deleteEndpointUrl = `https://api.getalby.com/webhook_endpoints/${webhookId}`;
//     const data = {
//       headers: getHeader(token),
//       method: "DELETE",
//       signal,
//     };

//     const response = await fetch(deleteEndpointUrl, data);

//     if (response.ok) return true;

//     console.error(
//       "Error deleting Alby Webhook:",
//       response.status,
//       await response.json()
//     );
//     return false;
//   } catch (error) {
//     console.error(error);
//     throw new Error("Failed to delete webhook endpoint");
//   }
// }
