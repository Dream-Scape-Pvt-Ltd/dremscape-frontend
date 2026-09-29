export class ApiClientError extends Error {
  public status: number;
  public details?: Record<string, string[]> | { detail?: string } | null;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  getFieldErrors(): Record<string, string> {
    if (!this.details || typeof this.details !== "object") return {};
    const fieldErrors: Record<string, string> = {};
    for (const [key, messages] of Object.entries(this.details)) {
      if (Array.isArray(messages) && messages.length > 0) {
        fieldErrors[key] = messages[0];
      }
    }
    return fieldErrors;
  }
}
