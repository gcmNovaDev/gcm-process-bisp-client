'use client'

import { useCallback, useEffect, useState } from "react";
import { useModuleStore } from "@/gcm-bisp/components/store/useModuleStore";
import { useAuthStore } from "@/gcm-bisp/components/store/authStore";
import { useToast } from "@/core/providers/ToastProvider";
import WelcomeBanner from "./components/WelcomeBanner";
import ApiStatusCard from "./components/ApiStatusCard";
import FeatureStructureTree from "./components/FeatureStructureTree";
import ArchitectureLayers from "./components/ArchitectureLayers";
import RequestFlow from "./components/RequestFlow";
import LayerDetailsModal from "./components/Modals/LayerDetailsModal";
import { getApiStatus } from "./api/services/dashboard.services";
import { ApiStatus, ArchitectureLayer } from "./api/types/dashboard.types";
import { architectureLayers, featureStructure, requestFlow } from "./utils/architecture.data";

export default function PageDashboard() {
  const setModule = useModuleStore((state) => state.setModule);
  const userName = useAuthStore((state) => state.auth?.data?.usuario?.nombreCompleto);
  const { showToast } = useToast();

  // States for API data
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // States for Modals
  const [isLayerModalOpen, setIsLayerModalOpen] = useState<boolean>(false);
  const [selectedLayer, setSelectedLayer] = useState<ArchitectureLayer | null>(null);

  useEffect(() => {
    setModule("Dashboard", "Arquitectura del proyecto");
  }, [setModule]);

  const fetchApiStatus = useCallback(async (isManualRefresh = false) => {
    setLoading(true);
    try {
      const res = await getApiStatus();
      setApiStatus(res);
      setApiError(null);
      if (isManualRefresh) showToast("API en línea", "success", 3000);
    } catch {
      setApiStatus(null);
      setApiError("No se pudo conectar con la API. Verifica que gcm-process-bisp-api esté corriendo.");
      if (isManualRefresh) showToast("No se pudo conectar con la API", "error", 3000);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchApiStatus();
  }, [fetchApiStatus]);

  const handleSelectLayer = (layer: ArchitectureLayer) => {
    setSelectedLayer(layer);
    setIsLayerModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-6">
      <WelcomeBanner userName={userName} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FeatureStructureTree root={featureStructure} />
        </div>
        <ApiStatusCard
          status={apiStatus}
          loading={loading}
          error={apiError}
          onRefresh={() => fetchApiStatus(true)}
        />
      </div>

      <ArchitectureLayers layers={architectureLayers} onSelect={handleSelectLayer} />

      <RequestFlow steps={requestFlow} />

      <LayerDetailsModal
        isOpen={isLayerModalOpen}
        setIsOpen={setIsLayerModalOpen}
        layer={selectedLayer}
      />
    </div>
  )
}
