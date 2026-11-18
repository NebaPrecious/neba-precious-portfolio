"use client";

import { useActionState, useEffect, useId, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";

/**
 * Runs a server action from onSubmit instead of `<form action>` so React does
 * not reset the fields when the server returns validation errors.
 */
export function useFormAction<S>(action: (prev: Awaited<S>, fd: FormData) => Promise<S>, initial: Awaited<S>) {
  const [state, dispatch, pending] = useActionState<S, FormData>(action, initial);
  const [, start] = useTransition();
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    start(() => dispatch(formData));
  };
  return { state, pending, onSubmit };
}

/** Submit button that reflects the parent form's pending state. */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "btn btn-accent",
  pending: pendingProp,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button type="submit" className={className} disabled={pending} aria-disabled={pending}>
      {pending && <LoaderCircle className="spin" size={16} aria-hidden="true" />}
      {pending ? pendingLabel : children}
    </button>
  );
}

/**
 * Button that asks for confirmation in a native <dialog> before running a
 * server action. Used for every destructive admin operation.
 */
export function ConfirmButton({
  action,
  title,
  description,
  confirmLabel = "Delete",
  children,
  className = "tool tool-danger",
  ariaLabel,
}: {
  action: () => Promise<unknown>;
  title: string;
  description: string;
  confirmLabel?: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button type="button" className={className} aria-label={ariaLabel} onClick={() => ref.current?.showModal()}>
        {children}
      </button>
      <dialog ref={ref} className="dialog" aria-labelledby={titleId}>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => ref.current?.close()} disabled={pending}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setError(null);
                try {
                  const result = (await action()) as { error?: string } | undefined;
                  if (result && typeof result === "object" && "error" in result && result.error) {
                    setError(result.error);
                    return;
                  }
                  ref.current?.close();
                } catch (e) {
                  // redirect() throws a special error that Next handles — rethrow it.
                  if (e && typeof e === "object" && "digest" in e) throw e;
                  setError("Something went wrong. Please try again.");
                }
              })
            }
          >
            {pending && <LoaderCircle className="spin" size={14} aria-hidden="true" />}
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}

/** Small button that runs an action with a pending state (toggles, reorder). */
export function ActionButton({
  action,
  children,
  className = "tool",
  disabled,
  pressed,
  label,
  onError,
}: {
  action: () => Promise<unknown>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  pressed?: boolean;
  label?: string;
  onError?: (message: string) => void;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={disabled || pending}
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={() =>
        start(async () => {
          const result = (await action()) as { error?: string } | undefined;
          if (result && typeof result === "object" && result.error) onError?.(result.error);
        })
      }
    >
      {pending ? <LoaderCircle className="spin" size={14} aria-hidden="true" /> : children}
    </button>
  );
}

/** Live character counter for text fields. */
export function CharCount({ targetId, max }: { targetId: string; max: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = document.getElementById(targetId) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return;
    const update = () => setN(el.value.length);
    update();
    el.addEventListener("input", update);
    return () => el.removeEventListener("input", update);
  }, [targetId]);
  return (
    <span className="field-counter" aria-hidden="true" style={n > max ? { color: "var(--danger)" } : undefined}>
      {n}/{max}
    </span>
  );
}
