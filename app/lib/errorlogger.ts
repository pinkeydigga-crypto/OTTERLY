import { supabase } from '@/lib/supabase';

export interface ErrorLogPayload {
  pageFeature: string;
  error: any;
  userId?: string | null;
  requestInfo?: Record<string, any>;
}

const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveKeys = ['password', 'token', 'apikey', 'secret', 'cookie', 'authorization'];
  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  for (const key in sanitized) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED_SECRET]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
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

  const sanitizedRequestInfo = sanitizeData(requestInfo);

  const errorPayload = {
    error_code: errorCode,
    timestamp: new Date().toISOString(),
    page_feature: pageFeature,
    user_id: userId,
    actual_error_message: error?.message || String(error),
    stack_trace: error?.stack || null,
    database_error_details: error?.code ? { code: error.code, details: error.details, hint: error.hint } : null,
    request_info: sanitizedRequestInfo,
  };

  try {
    // Agar user offline hai toh DB network call skip karein
    if (typeof window !== 'undefined' && !navigator.onLine) {
      console.warn("Offline mode: Skipping DB error log insert.");
      return errorCode;
    }

    await supabase.from('system_error_logs').insert([errorPayload]);
  } catch (dbErr) {
    console.error("Internal fallback log fail:", dbErr);
  }

  return errorCode;
};