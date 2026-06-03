import { createFileRoute } from "@tanstack/react-router";

const API_BASE_URL = process.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
} as const;

async function doProxy(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const prefix = "/api/proxy/";
  const targetPath = url.pathname.startsWith(prefix)
    ? url.pathname.slice(prefix.length)
    : "";
  const targetUrl = new URL(targetPath + url.search, API_BASE_URL);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (
      key.toLowerCase() === "host" ||
      key.toLowerCase() === "origin" ||
      key.toLowerCase() === "referer"
    ) {
      return;
    }
    headers.set(key, value);
  });

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;

  const upstream = await fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body,
  });

  const responseHeaders = new Headers(upstream.headers);
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    responseHeaders.set(key, value);
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const Route = createFileRoute("/api/proxy/$")({
  server: {
    handlers: {
      GET: async ({ request }) => doProxy(request),
      POST: async ({ request }) => doProxy(request),
      PUT: async ({ request }) => doProxy(request),
      DELETE: async ({ request }) => doProxy(request),
      PATCH: async ({ request }) => doProxy(request),
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: CORS_HEADERS,
        });
      },
    },
  },
});
