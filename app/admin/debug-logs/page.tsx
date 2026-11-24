"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

interface ErrorLogRecord {
  error_code?: string;
  timestamp?: string;
  page_feature?: string;
  user_id?: string | null;
  actual_error_message?: string;
  stack_trace?: string | null;
  request_info?: unknown;
}

export default function AdminDebugLogsPage() {
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [searchCode, setSearchCode] = useState("");
  const [lastSearchedCode, setLastSearchedCode] = useState("");
  const [logDetails, setLogDetails] = useState<ErrorLogRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [accessError, setAccessError] = useState("");

  useEffect(() => {
    let active = true;

    const checkUser = (email?: string | null, hasUser = false, hasError = false) => {
      if (!active) return;
      const normalized = (email || "").trim().toLowerCase();
      const allowed =
        !hasError &&
        hasUser &&
        ADMIN_EMAILS.length > 0 &&
        ADMIN_EMAILS.includes(normalized);
      setIsAuthorized(allowed);
      setAuthChecking(false);
    };

    async function verifyAdminAccess() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        checkUser(user?.email, Boolean(user), Boolean(error));
      } catch {
        checkUser(null, false, true);
      }
    }

    void verifyAdminAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser(session?.user?.email, Boolean(session?.user), false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccessError("");
    setNotFound(false);
    setLogDetails(null);

    if (!isAuthorized) {
      setAccessError("Unauthorized: Admin access required.");
      return;
    }

    const cleanedCode = searchCode.trim().toUpperCase();
    if (!cleanedCode) return;

    setLastSearchedCode(cleanedCode);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("system_error_logs")
        .select("*")
        .eq("error_code", cleanedCode)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setLogDetails(data as ErrorLogRecord);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-300 p-6 md:p-12 font-mono flex items-center justify-center">
        <p className="text-sm">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 font-mono flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-slate-800 border border-red-500/50 rounded-xl space-y-2">
          <h1 className="text-lg font-bold text-red-400">403 — Access Denied</h1>
          <p className="text-xs text-slate-400">
            This internal debugger is restricted to authorized administrators only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 font-mono">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Internal System Debugger</h1>
          <p className="text-sm text-slate-400">Search error codes to view full stack trace and logs.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Enter Error Code (e.g. ERR-A7F2)"
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-bold rounded-lg transition-colors"
          >
            {loading ? "Searching..." : "Search Log"}
          </button>
        </form>

        {accessError && (
          <div className="p-4 bg-red-900/30 border border-red-500 text-red-300 rounded-lg text-xs">
            {accessError}
          </div>
        )}

        {notFound && (
          <div className="p-4 bg-red-900/30 border border-red-500 text-red-300 rounded-lg">
            No internal error record found for code: <strong>{lastSearchedCode}</strong>
          </div>
        )}

        {logDetails && (
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 border-b border-slate-700 pb-4">
              <div>
                <span className="text-slate-500">Error Code:</span>
                <p className="text-sm font-bold text-yellow-400">{logDetails.error_code}</p>
              </div>
              <div>
                <span className="text-slate-500">Timestamp:</span>
                <p className="text-slate-300">
                  {logDetails.timestamp ? new Date(logDetails.timestamp).toLocaleString() : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Feature/Location:</span>
                <p className="text-slate-300">{logDetails.page_feature || "N/A"}</p>
              </div>
              <div>
                <span className="text-slate-500">User ID:</span>
                <p className="text-slate-300">{logDetails.user_id || "Guest / Unauthenticated"}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-500">Actual Exception Message:</span>
              <p className="text-red-400 font-semibold mt-1 p-2 bg-slate-900 rounded">
                {logDetails.actual_error_message || "N/A"}
              </p>
            </div>

            {logDetails.stack_trace && (
              <div>
                <span className="text-slate-500">Stack Trace:</span>
                <pre className="mt-1 p-3 bg-slate-950 text-slate-400 rounded overflow-x-auto">
                  {logDetails.stack_trace}
                </pre>
              </div>
            )}

            <div>
              <span className="text-slate-500">Request Meta Data (Sanitized):</span>
              <pre className="mt-1 p-3 bg-slate-950 text-green-400 rounded overflow-x-auto">
                {JSON.stringify(logDetails.request_info ?? null, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}