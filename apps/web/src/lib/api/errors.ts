/** Thrown for every API failure so callers have one error type to handle. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** Raised when NEXT_PUBLIC_API_URL is unset — the backend is not wired up yet. */
export class ApiNotConfiguredError extends ApiError {
  constructor() {
    super("No API base URL is configured (set NEXT_PUBLIC_API_URL).", 0);
    this.name = "ApiNotConfiguredError";
  }
}
