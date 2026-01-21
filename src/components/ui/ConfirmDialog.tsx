'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  subtext?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  subtext,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111f22] border border-[#325e67]/50 rounded-xl shadow-2xl animate-fade-in">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-[#92c0c9]">{message}</p>
          {subtext && (
            <p className="text-[#92c0c9]/70 text-sm mt-2">{subtext}</p>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-[#325e67]/50">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors font-medium"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg font-bold transition-colors ${
              variant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#13c8ec] text-[#101f22] hover:bg-[#0ea5c7]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
