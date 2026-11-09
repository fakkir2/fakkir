/** Failure from the AI endpoint. `status` is the HTTP status (401 = signed out, 429 = rate limited). */
export class AIError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`AI request failed (${status})`);
    this.name = "AIError";
    this.status = status;
  }
}
