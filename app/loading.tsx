// app/loading.tsx
"use client";

import React, { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export default function Loading() {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Exact 2 seconds (2000ms) ke baad loading screen ko force-hide kar dega
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!showLoading) {
    return null;
  }

  return <LoadingScreen />;
}