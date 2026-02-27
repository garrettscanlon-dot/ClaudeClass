import type { LinearGraphQLResponse } from "./types";

const LINEAR_API_URL = "https://api.linear.app/graphql";

export async function linearQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    throw new Error("Missing LINEAR_API_KEY");
  }

  const response = await fetch(LINEAR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Linear API error (${response.status}): ${errorText}`);
  }

  const result: LinearGraphQLResponse<T> = await response.json();

  if (result.errors?.length) {
    throw new Error(`Linear GraphQL errors: ${result.errors.map((e) => e.message).join(", ")}`);
  }

  return result.data;
}
