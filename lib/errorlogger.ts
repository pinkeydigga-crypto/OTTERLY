import { supabase } from '@/lib/supabase';

export interface ErrorLogPayload {
  pageFeature: string;
  error: unknown;
  userId?: string | null;
  requestInfo?: Record<string, unknown>;
}

const SENSITIVE_KEYS = [
  'password',
  'token',
  'apikey',
  'api_key',
  'secret',
  'cookie',
  'authorization',
];

const redactStringSecrets = (value: string): string => {
  return value
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED_SECRET]')
    .slice(0, 2000);
};

const sanitizeData = (data: unknown, depth = 0): unknown => {
  if (depth > 4 || data === null || data === undefined) return data;
  if (typeof data === 'string') return redactStringSecrets(data);
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.slice(0, 20).map((item) => sanitizeData(item, depth + 1));
  }

  const record = data as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const key of Object.keys(record)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
      sanitized[key] = '[REDACTED_SECRET]';
    } else {
      sanitized[key] = sanitizeData(record[key], depth + 1);
    }
  }

  return sanitized;
};

export const logErrorSecurely = async ({
  pageFeature,
  error,
  userId = null,
  requestInfo = {},
}: ErrorLogPayload): Promise<string> => {
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const errorCode = `ERR-${randomHex}`;

  const errObj =
    error && typeof error === 'object'
      ? (error as {
          message?: string;
          stack?: string;
          code?: string;
          details?: string;
          hint?: string;
        })
      : null;

  const rawMessage = errObj?.message || String(error || 'Unknown error');

  const errorPayload = {
    error_code: errorCode,
    timestamp: new Date().toISOString(),
    page_feature: String(pageFeature || 'unknown').slice(0, 100),
    user_id: userId,
    actual_error_message: redactStringSecrets(rawMessage).slice(0, 1000),
    stack_trace: errObj?.stack ? redactStringSecrets(errObj.stack).slice(0, 4000) : null,
    database_error_details: errObj?.code
      ? {
          code: errObj.code,
          details: errObj.details ?? null,
          hint: errObj.hint ?? null,
        }
      : null,
    request_info: sanitizeData(requestInfo),
  };

  try {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return errorCode;
    }

    const { error: insertErr } = await supabase
      .from('system_error_logs')
      .insert([errorPayload]);

    if (insertErr) {
      console.error('[error-logger] insert failed:', insertErr.message);
    }
  } catch (dbErr) {
    console.error('[error-logger] exception:', dbErr);
  }

  return errorCode;
};