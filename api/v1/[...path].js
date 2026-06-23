const backendBaseUrl = "https://hackaton-20261-front-587720740455.us-east1.run.app/api/v1";

const blockedRequestHeaders = new Set([
  "connection",
  "content-length",
  "host",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-vercel-id",
]);

const blockedResponseHeaders = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
]);

function buildTargetUrl(req) {
  const incoming = new URL(req.url || "/api/v1", "http://localhost");
  const path = incoming.pathname.replace(/^\/api\/v1\/?/, "");
  const target = new URL(`${backendBaseUrl}/${path}`);
  target.search = incoming.search;
  return target;
}

function buildHeaders(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    const lowerKey = key.toLowerCase();
    if (blockedRequestHeaders.has(lowerKey) || value === undefined) continue;
    headers.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  return headers;
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function getBody(req) {
  const method = req.method || "GET";
  if (method === "GET" || method === "HEAD") return undefined;
  if (req.body === undefined) return readRawBody(req);
  if (Buffer.isBuffer(req.body) || typeof req.body === "string") return req.body;
  return JSON.stringify(req.body);
}

export default async function handler(req, res) {
  try {
    const response = await fetch(buildTargetUrl(req), {
      method: req.method,
      headers: buildHeaders(req),
      body: await getBody(req),
      redirect: "manual",
    });

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      if (!blockedResponseHeaders.has(key.toLowerCase())) res.setHeader(key, value);
    });

    const body = Buffer.from(await response.arrayBuffer());
    res.end(body);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ message: "No se pudo conectar con la API", detail: error instanceof Error ? error.message : "Unknown error" }));
  }
}
