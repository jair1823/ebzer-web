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
    button: "btn-base btn-danger",
    iconBg: "bg-danger-soft",
    iconColor: "text-danger",
  },
  info: {
    button: "btn-base btn-accent",
    iconBg: "bg-info-soft",
    iconColor: "text-info",
  },
  warning: {
    button: "btn-base btn-primary",
    iconBg: "bg-warning-soft",
    iconColor: "text-warning",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl shadow-lg bg-surface-elevated">
        {/* Header */}
        <div className="flex items-start gap-4 p-6">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}>
            {variant === "danger" && (
              <svg className={`h-5 w-5 ${styles.iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
            {variant === "warning" && (
              <svg className={`h-5 w-5 ${styles.iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            {variant === "info" && (
              <svg className={`h-5 w-5 ${styles.iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-primary">
              {title}
            </h2>
            <p className="mt-2 text-sm text-secondary">
              {message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3 border-default">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="btn-base btn-outline"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
