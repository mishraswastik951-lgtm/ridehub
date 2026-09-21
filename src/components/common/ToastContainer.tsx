import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  useEffect(() => {
    if (toasts.length === 0) return;
    
    const timer = setTimeout(() => {
      // Remove the oldest toast after 1 second
      removeToast(toasts[0].id);
    }, 1000);

    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-3rem)] pointer-events-none"
    >
      {toasts.map((toast) => {
        let icon = <CheckCircle2 size={18} className="text-[#1B7A4E]" />;
        let borderColor = "border-l-[#1B7A4E]";

        if (toast.type === "warning") {
          icon = <AlertCircle size={18} className="text-[#E8A317]" />;
          borderColor = "border-l-[#E8A317]";
        } else if (toast.type === "error") {
          icon = <XCircle size={18} className="text-[#C8432F]" />;
          borderColor = "border-l-[#C8432F]";
        } else if (toast.type === "info") {
          icon = <Info size={18} className="text-[#2456D6]" />;
          borderColor = "border-l-[#2456D6]";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white border border-[#E4DDD1] border-l-4 ${borderColor} rounded-[8px] shadow-[0_4px_12px_rgba(15,31,61,0.12)] p-3.5 flex items-start gap-3 relative overflow-hidden transition-all`}
          >
            <div className="mt-0.5 shrink-0">{icon}</div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-heading font-bold text-[#16181F] mb-0.5">
                {toast.title}
              </h5>
              <p className="text-[11px] text-[#5B6070] leading-snug">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-[#5B6070] hover:text-[#16181F] p-0.5 cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
