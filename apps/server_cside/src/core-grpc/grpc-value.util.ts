/** Unwrap google.protobuf.StringValue or plain string from gRPC JSON-ish payloads */
export function unwrapString(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v !== null && 'value' in v) {
    const inner = (v as { value?: unknown }).value;
    if (typeof inner === 'string') return inner;
  }
  return undefined;
}
