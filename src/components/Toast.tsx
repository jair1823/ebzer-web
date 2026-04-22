import React, { useEffect } from "react";
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
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <div className={`toast toast--${variant}`} role="alert">
      <span className="toast__icon">{icons[variant]}</span>
      <span className="toast__message">{message}</span>
      <button
        className="toast__close"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
};
