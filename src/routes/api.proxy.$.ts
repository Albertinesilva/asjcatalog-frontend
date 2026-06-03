import { createFileRoute } from "@tanstack/react-router";

const API_BASE_URL = process.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
} as const;

async function doProxy(request: Request, targetPath: string): Promise<Response> {
  const url = new URL(request.url);
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
      GET: async ({ request, params }) => {
        const splat = (params as Record<string, string>)["*"] ?? "";
        return doProxy(request, splat);
      },
      POST: async ({ request, params }) => {
        const splat = (params as Record<string, string>)["*"] ?? "";
        return doProxy(request, splat);
      },
      PUT: async ({ request, params }) => {
        const splat = (params as Record<string, string>)["*"] ?? "";
        return doProxy(request, splat);
      },
      DELETE: async ({ request, params }) => {
        const splat = (params as Record<string, string>)["*"] ?? "";
        return doProxy(request, splat);
      },
      PATCH: async ({ request, params }) => {
        const splat = (params as Record<string, string>)["*"] ?? "";
        return doProxy(request, splat);
      },
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: CORS_HEADERS,
        });
      },
    },
  },
});
