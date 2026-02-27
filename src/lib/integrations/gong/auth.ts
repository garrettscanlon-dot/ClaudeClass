export function getGongAuthHeader(): string {
  const accessKey = process.env.GONG_ACCESS_KEY;
  const accessKeySecret = process.env.GONG_ACCESS_KEY_SECRET;

  if (!accessKey || !accessKeySecret) {
    throw new Error("Missing GONG_ACCESS_KEY or GONG_ACCESS_KEY_SECRET");
  }

  const credentials = Buffer.from(`${accessKey}:${accessKeySecret}`).toString("base64");
  return `Basic ${credentials}`;
}
