import type { SfAuthResponse } from "./types";

let cachedToken: { accessToken: string; instanceUrl: string; expiresAt: number } | null = null;

export async function getSalesforceToken(): Promise<{
  accessToken: string;
  instanceUrl: string;
}> {
  // Return cached token if still valid (with 5-minute buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60 * 1000) {
    return { accessToken: cachedToken.accessToken, instanceUrl: cachedToken.instanceUrl };
  }

  const loginUrl = process.env.SALESFORCE_LOGIN_URL || "https://login.salesforce.com";
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SALESFORCE_CLIENT_ID or SALESFORCE_CLIENT_SECRET");
  }

  const response = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Salesforce auth failed (${response.status}): ${errorText}`);
  }

  const data: SfAuthResponse = await response.json();

  // Cache for 2 hours (default Salesforce session timeout)
  cachedToken = {
    accessToken: data.access_token,
    instanceUrl: data.instance_url,
    expiresAt: Date.now() + 2 * 60 * 60 * 1000,
  };

  return { accessToken: data.access_token, instanceUrl: data.instance_url };
}

export function clearTokenCache() {
  cachedToken = null;
}
