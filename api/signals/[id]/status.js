const backendBaseUrl = "https://hackaton-20261-front-587720740455.us-east1.run.app/api/v1";

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function getBody(req) {
  if (req.body === undefined) return readRawBody(req);
  if (Buffer.isBuffer(req.body) || typeof req.body === "string") return req.body;
  return JSON.stringify(req.body);
}

function getSignalId(req) {
  const url = new URL(req.url || "/", "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  return parts[2];
}

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    res.statusCode = 405;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ message: "Metodo no permitido" }));
    return;
  }

  const id = getSignalId(req);
  if (!id) {
    res.statusCode = 400;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ message: "Falta id de senal" }));
    return;
  }

  try {
    const response = await fetch(`${backendBaseUrl}/signals/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "authorization": req.headers.authorization || "",
      },
      body: await getBody(req),
    });

    res.statusCode = response.status;
    res.setHeader("content-type", response.headers.get("content-type") || "application/json");
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ message: "No se pudo actualizar la senal", detail: error instanceof Error ? error.message : "Unknown error" }));
  }
}
