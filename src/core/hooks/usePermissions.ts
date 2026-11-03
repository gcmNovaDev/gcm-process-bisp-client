import { useAuthStore } from "@/gcm-bisp/components/store/authStore";

export function usePermissions() {
  const permissions = useAuthStore((state) => state.permissions || []);

  const hasPermission = (requiredPermission: string) => {
    return permissions.includes(requiredPermission);
  };

  const hasAnyPermission = (requiredPermissions: string[]) => {
    return requiredPermissions.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (requiredPermissions: string[]) => {
    return requiredPermissions.every(p => permissions.includes(p));
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions, permissions };
}
