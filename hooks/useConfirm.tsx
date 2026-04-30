"use client";

import { useState, useCallback } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface ConfirmOptions {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function useConfirm() {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

  const showConfirm = useCallback((options: ConfirmOptions | string): Promise<boolean> =>
    new Promise(resolve => {
      const opts = typeof options === "string" ? { message: options } : options;
      setState({ ...opts, resolve });
    }), []);

  const handleClose = useCallback((result: boolean) => {
    state?.resolve(result);
    setState(null);
  }, [state]);

  const ConfirmEl = state ? (
    <ConfirmModal
      message={state.message}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      danger={state.danger}
      onConfirm={() => handleClose(true)}
      onClose={() => handleClose(false)}
    />
  ) : null;

  return { showConfirm, ConfirmEl };
}
