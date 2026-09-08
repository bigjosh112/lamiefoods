import { env, siteUrl } from "@/config/env";
import { ApiError } from "./errors";

/**
 * Thin fetch wrapper — the single place the frontend talks to the backend, so
 * base URL, credentials and error handling are not re-invented per component.
 *
 * SUPERSEDES the original "no endpoint functions yet" decision recorded in
 * architecture.md: the API now lives as Next.js Route Handlers in this same
 * app (`src/app/api/`), not a separate origin. `NEXT_PUBLIC_API_URL` still
 * exists for a genuinely external backend later; when it is unset, requests
 * resolve against this app's own `siteUrl` instead of throwing, since a
 * same-origin API needs no configuration to reach.
 *
 * Server Components should call `server/` functions directly (an in-process
 * call, not a self-fetch over HTTP) — this gateway is for Client Components,
 * which only have the browser's fetch. See `lib/orders/orders.ts` for the
 * pattern.
 */
export function isApiConfigured(): boolean {
  return true;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Serialised as JSON unless it is already a string or FormData. */
  body?: unknown;
  /** Passed straight through to Next's extended fetch. */
  next?: NextFetchRequestConfig;
}

export async function apiFetch<T>(
  path: string,
  { body, headers, next, ...init }: RequestOptions = {},
): Promise<T> {
  // An external backend (NEXT_PUBLIC_API_URL) always wins if configured;
  // otherwise the API is this same app's own Route Handlers.
  const baseUrl = env.NEXT_PUBLIC_API_URL || siteUrl;

  const isPlainBody = body !== undefined && !(body instanceof FormData);

  const response = await fetch(new URL(path, baseUrl), {
    ...init,
    next,
    // Session cookies over tokens in localStorage; harmless until auth exists.
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(isPlainBody ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body === undefined
      ? {}
      : { body: isPlainBody ? JSON.stringify(body) : (body as BodyInit) }),
  });

  const payload: unknown = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(
      `Request to ${path} failed with ${response.status}`,
      response.status,
      payload,
    );
  }

  return payload as T;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
