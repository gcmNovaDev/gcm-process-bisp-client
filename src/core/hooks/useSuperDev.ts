"use client";

import { useAuthStore } from "@/gcm-bisp/components/store/authStore";
import { usePermissions } from "./usePermissions";

export function useSuperDev() {
  const { hasPermission } = usePermissions();
  const auth = useAuthStore((state) => state.auth);

  // Permisos técnicos y de auditoría administrados dinámicamente desde PROCESS-IAM
  const canBypassBiometric = hasPermission("headless.superdev.biometric_bypass");
  const canOverrideLine = hasPermission("headless.superdev.line_override");
  const canUnlockSession = hasPermission("headless.superdev.session_unlock");
  const canCorrectWeight = hasPermission("headless.superdev.weight_correction");
  const canOverrideTail = hasPermission("headless.superdev.tail_override");
  const canWeighClosedLine = hasPermission("headless.superdev.closed_line_weighing");
  const canViewAudit = hasPermission("headless.superdev.view_audit");

  // Usuario con privilegios técnicos si cuenta con cualquiera de los permisos asignados a su rol
  const isSuperDev =
    canBypassBiometric ||
    canOverrideLine ||
    canUnlockSession ||
    canCorrectWeight ||
    canOverrideTail ||
    canWeighClosedLine ||
    canViewAudit;

  return {
    isSuperDev,
    canBypassBiometric,
    canOverrideLine,
    canUnlockSession,
    canCorrectWeight,
    canRecalibrateWeights: canCorrectWeight,
    canReopenLine: canUnlockSession || canOverrideLine,
    canForceWeighing: canOverrideTail,
    canWeighClosedLine,
    canViewAudit,
    hasSuperDevPermission: (permissionCode?: string) =>
      permissionCode ? hasPermission(permissionCode) : false,
    canOverrideTail,
    currentUser:
      auth?.data?.usuario?.nombreCompleto ||
      auth?.data?.usuario?.username ||
      "Usuario",
  };
}
