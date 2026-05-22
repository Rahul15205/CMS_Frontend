const SENSITIVE_KEYS = new Set([
  "password",
  "confirmpassword",
  "token",
  "refreshtoken",
  "accesstoken",
  "secret",
  "mfasecret",
  "apikey",
]);

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatBodySummary(body: Record<string, unknown>): string {
  const parts: string[] = [];

  if (body.email) parts.push(`Email: ${body.email}`);
  if (body.identifier) parts.push(`Identifier: ${body.identifier}`);
  if (body.status) parts.push(`Status: ${capitalize(String(body.status))}`);
  if (body.userId) parts.push(`User ID: ${body.userId}`);
  if (body.name) parts.push(`Name: ${body.name}`);
  if (body.domain) parts.push(`Domain: ${body.domain}`);
  if (body.requestType || body.type) {
    parts.push(`Type: ${body.requestType || body.type}`);
  }
  if (body.requesterEmail) parts.push(`Requester: ${body.requesterEmail}`);

  return parts.join(" · ");
}

/**
 * Turns stored log `details` (string or legacy JSON blobs) into readable text.
 * Never returns raw JSON — avoids showing API payloads in the UI.
 */
export function formatLogDetails(details: unknown): string {
  if (details === null || details === undefined) return "";

  if (typeof details === "string") {
    const trimmed = details.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return formatLogDetails(JSON.parse(trimmed));
      } catch {
        return details;
      }
    }
    return details;
  }

  if (typeof details !== "object") return String(details);

  const obj = details as Record<string, unknown>;

  if (typeof obj.summary === "string") return obj.summary;

  if (obj.requestBody && typeof obj.requestBody === "object" && !Array.isArray(obj.requestBody)) {
    const body = obj.requestBody as Record<string, unknown>;
    for (const key of Object.keys(body)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase()) || key.toLowerCase().includes("password")) {
        body[key] = "[redacted]";
      }
    }
    const summary = formatBodySummary(body);
    if (summary) return summary;
  }

  if (typeof obj.email === "string") return `Email: ${obj.email}`;
  if (obj.status !== undefined) return `Status: ${obj.status}`;
  if (typeof obj.message === "string") return obj.message;
  if (typeof obj.note === "string") return obj.note;
  if (typeof obj.description === "string") return obj.description;
  if (typeof obj.result === "string") return obj.result;

  const summary = formatBodySummary(obj);
  if (summary) return summary;

  return "";
}
