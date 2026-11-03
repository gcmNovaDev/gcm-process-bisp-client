"use client";

import GlobalErrorUI from "@/gcm-bisp/components/system/GlobalErrorUI";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <GlobalErrorUI error={error} reset={reset} />;
}
