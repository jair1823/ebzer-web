import { useState, useCallback } from "react";
import type { ToastVariant } from "../components/Toast";

export interface ToastConfig {
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

export const useToast = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<ToastConfig>({
    message: "",
    variant: "info",
    duration: 3000,
  });

  const showToast = useCallback((toastConfig: ToastConfig) => {
    setConfig({
      variant: "info",
      duration: 3000,
      ...toastConfig,
    });
    setIsVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setIsVisible(false);
  }, []);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, variant: "success", duration });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, variant: "error", duration });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, variant: "info", duration });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, variant: "warning", duration });
    },
    [showToast]
  );

  return {
    isVisible,
    config,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
