type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

export const showToast = (message: string, type: ToastType = 'info') => {
  const id = Math.random().toString(36).substring(2);
  const newToast: Toast = { id, message, type };
  toasts = [...toasts, newToast];
  listeners.forEach((listener) => listener(toasts));

  // Auto remove after 4 seconds
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((listener) => listener(toasts));
  }, 4000);
};

export const subscribeToasts = (listener: Listener) => {
  listeners.add(listener);
  listener(toasts);
  return () => {
    listeners.delete(listener);
  };
};
