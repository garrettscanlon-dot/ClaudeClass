import { getGongAuthHeader } from "./auth";
import type {
  GongUsersResponse,
  GongCallsResponse,
  GongTranscriptResponse,
} from "./types";

const GONG_BASE_URL = "https://api.gong.io/v2";

// Simple rate limiter: 3 requests per second
let lastRequestTime = 0;
async function rateLimitedFetch(url: string, options: RequestInit): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 334) {
    // ~3 req/sec
    await new Promise((resolve) => setTimeout(resolve, 334 - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  const response = await fetch(url, options);

  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get("Retry-After") || "5", 10);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return rateLimitedFetch(url, options);
  }

  return response;
}

export async function getGongUsers(): Promise<GongUsersResponse> {
  const response = await rateLimitedFetch(`${GONG_BASE_URL}/users`, {
    headers: { Authorization: getGongAuthHeader() },
  });

  if (!response.ok) {
    throw new Error(`Gong users API error (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

export async function getGongCalls(
  fromDateTime: string,
  toDateTime: string,
): Promise<GongCallsResponse> {
  const params = new URLSearchParams({ fromDateTime, toDateTime });
  const response = await rateLimitedFetch(`${GONG_BASE_URL}/calls?${params}`, {
    headers: { Authorization: getGongAuthHeader() },
  });

  if (!response.ok) {
    throw new Error(`Gong calls API error (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

export async function getGongTranscripts(callIds: string[]): Promise<GongTranscriptResponse> {
  const response = await rateLimitedFetch(`${GONG_BASE_URL}/calls/transcript`, {
    method: "POST",
    headers: {
      Authorization: getGongAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filter: { callIds } }),
  });

  if (!response.ok) {
    throw new Error(`Gong transcript API error (${response.status}): ${await response.text()}`);
  }

  return response.json();
}
