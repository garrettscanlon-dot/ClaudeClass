import { getSalesforceToken, clearTokenCache } from "./auth";
import type { SfQueryResponse } from "./types";

const API_VERSION = "v60.0";

export async function sfQuery<T>(soql: string): Promise<T[]> {
  const { accessToken, instanceUrl } = await getSalesforceToken();

  let allRecords: T[] = [];
  let url = `${instanceUrl}/services/data/${API_VERSION}/query/?q=${encodeURIComponent(soql)}`;

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Re-authenticate on 401
    if (response.status === 401) {
      clearTokenCache();
      const newAuth = await getSalesforceToken();
      const retryResponse = await fetch(url, {
        headers: { Authorization: `Bearer ${newAuth.accessToken}` },
      });
      if (!retryResponse.ok) {
        throw new Error(`Salesforce query failed after re-auth: ${retryResponse.status}`);
      }
      const data: SfQueryResponse<T> = await retryResponse.json();
      allRecords = allRecords.concat(data.records);
      url = data.nextRecordsUrl
        ? `${newAuth.instanceUrl}${data.nextRecordsUrl}`
        : "";
      continue;
    }

    if (response.status === 429) {
      // Rate limited — wait and retry
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Salesforce query failed (${response.status}): ${errorText}`);
    }

    const data: SfQueryResponse<T> = await response.json();
    allRecords = allRecords.concat(data.records);
    url = data.nextRecordsUrl
      ? `${instanceUrl}${data.nextRecordsUrl}`
      : "";
  }

  return allRecords;
}
