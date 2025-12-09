import { useState } from "react";
import type { ConfirmModalConfig } from "../components";

export const useConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmModalConfig | null>(null);

  const openConfirm = (confirmConfig: ConfirmModalConfig) => {
    setConfig(confirmConfig);
    setIsOpen(true);
  };

  const closeConfirm = () => {
    setIsOpen(false);
    setConfig(null);
  };

  return {
    isOpen,
    config,
    openConfirm,
    closeConfirm,
  };
};
