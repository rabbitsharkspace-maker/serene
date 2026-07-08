import React, { useEffect, useState } from 'react';
import { subscribeToasts, Toast } from '../lib/toast';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribeToasts((newToasts) => {
      setToasts(newToasts);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-white border-blue-100 text-blue-900';
        let Icon = <Info className="text-blue-500 shrink-0" size={18} />;

        if (toast.type === 'success') {
          bgColor = 'bg-emerald-50 border-emerald-100 text-emerald-950';
          Icon = <CheckCircle className="text-emerald-500 shrink-0" size={18} />;
        } else if (toast.type === 'error') {
          bgColor = 'bg-rose-50 border-rose-100 text-rose-950';
          Icon = <AlertCircle className="text-rose-500 shrink-0" size={18} />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgColor} animate-in fade-in slide-in-from-top-4 duration-300`}
          >
            {Icon}
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
