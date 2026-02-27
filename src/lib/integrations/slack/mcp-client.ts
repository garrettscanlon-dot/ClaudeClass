import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

let mcpClient: Client | null = null;
let transport: StdioClientTransport | null = null;

export async function getSlackMcpClient(): Promise<Client> {
  if (mcpClient) return mcpClient;

  transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    env: {
      ...process.env,
      SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
      SLACK_TEAM_ID: process.env.SLACK_TEAM_ID!,
    },
  });

  mcpClient = new Client({
    name: "monday-morning-playbook",
    version: "1.0.0",
  });

  await mcpClient.connect(transport);
  return mcpClient;
}

export async function postSlackMessage(
  channel: string,
  text: string,
): Promise<void> {
  const client = await getSlackMcpClient();

  await client.callTool({
    name: "slack_post_message",
    arguments: {
      channel_id: channel,
      text,
    },
  });
}

export async function closeSlackMcpClient(): Promise<void> {
  if (mcpClient) {
    await mcpClient.close();
    mcpClient = null;
  }
  if (transport) {
    await transport.close();
    transport = null;
  }
}
