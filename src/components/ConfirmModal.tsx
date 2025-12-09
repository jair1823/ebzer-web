import React from "react";

export interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmModalProps extends ConfirmModalConfig {
  isOpen: boolean;
  onClose: () => void;
}

const variantStyles = {
  danger: {
    button: "bg-red-900 hover:bg-red-950",
    icon: "text-red-900",
  },
  info: {
    button: "bg-emerald-300 hover:bg-emerald-400",
    icon: "text-emerald-300",
  },
  warning: {
    button: "bg-red-300 hover:bg-red-400",
    icon: "text-red-300",
  },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "info",
  onConfirm,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-slate-900">
        {/* Header */}
        <div className="mb-4 flex items-start gap-4">
          <div className={`mt-1 text-2xl ${styles.icon}`}>
            {variant === "danger" && "D"}
            {variant === "warning" && "W"}
            {variant === "info" && "I"}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles.button}`}
          >
            {isLoading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
