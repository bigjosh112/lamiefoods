import { env } from "@/config/env";
import { ApiError, ApiNotConfiguredError } from "./errors";

/**
 * Thin fetch wrapper — the single place the frontend talks to the backend, so
 * base URL, credentials and error handling are not re-invented per component.
 *
 * No endpoints are defined yet on purpose. The backend developer has not
 * supplied a contract, and guessing request/response shapes would mean building
 * UI against an API that does not exist.
 */
export function isApiConfigured(): boolean {
  return Boolean(env.NEXT_PUBLIC_API_URL);
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
  const baseUrl = env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new ApiNotConfiguredError();

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
