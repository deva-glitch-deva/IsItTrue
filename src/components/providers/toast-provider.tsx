"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface Toast {
  id: number;
  message: string;
  tone: "default" | "success" | "error";
}

interface ToastContextValue {
  toast: (message: string, tone?: Toast["tone"]) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => undefined,
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const counter = useRef(0);

  const toast = useCallback(
    (message: string, tone: Toast["tone"] = "default") => {
      counter.current += 1;
      const id = counter.current;
      setItems((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, 3600);
    },
    [],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="pointer-events-auto max-w-sm rounded-2xl border-2 px-4 py-3 text-sm font-bold shadow-clay"
            style={{
              background:
                item.tone === "error"
                  ? "#ffe0dc"
                  : item.tone === "success"
                    ? "#d9f7e8"
                    : "rgb(var(--cream))",
              color:
                item.tone === "error"
                  ? "#6e1212"
                  : item.tone === "success"
                    ? "#064d2d"
                    : "rgb(var(--ink))",
              borderColor:
                item.tone === "error"
                  ? "#b73333"
                  : item.tone === "success"
                    ? "#1fae6a"
                    : "rgb(var(--line) / 0.2)",
            }}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
