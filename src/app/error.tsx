"use client"; // Obligatorio para error boundaries

import SegmentErrorUI from "@/gcm-bisp/components/system/SegmentErrorUI";

export default function ProcessErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SegmentErrorUI error={error} reset={reset} />;
}
