import React, { useEffect } from "react";
import { CircleCheck, CircleX, Info, TriangleAlert, X } from "lucide-react";
import "./Toast.css";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = "info",
  duration = 3000,
  onClose,
  isVisible,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: CircleCheck,
    error: CircleX,
    info: Info,
    warning: TriangleAlert,
  };
  const Icon = icons[variant];

  return (
    <div className={`toast toast--${variant}`} role="alert">
      <span className="toast__icon">
        <Icon size={18} strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="toast__message">{message}</span>
      <button
        className="toast__close"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        <X size={14} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
};
