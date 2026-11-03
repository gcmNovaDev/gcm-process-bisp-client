// src/gcm-bisp/components/hooks/useGoBack.ts
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const useGoBack = () => {
  const router = useRouter();

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return { goBack };
};

export default useGoBack;
