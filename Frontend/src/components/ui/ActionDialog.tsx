/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { Button } from './Button';

type DialogVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmDialogOptions {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
}

export interface PromptDialogOptions extends ConfirmDialogOptions {
  inputLabel?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
  validate?: (value: string) => string | undefined;
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  kind: 'confirm';
}

interface PromptDialogState extends PromptDialogOptions {
  kind: 'prompt';
}

type DialogState = ConfirmDialogState | PromptDialogState;
type DialogResult = boolean | string | null;

interface ActionDialogContextValue {
  confirm: (options: ConfirmDialogOptions | string) => Promise<boolean>;
  prompt: (options: PromptDialogOptions | string) => Promise<string | null>;
}

const ActionDialogContext = createContext<ActionDialogContextValue | null>(null);

const VARIANT_CONFIG: Record<DialogVariant, {
  icon: typeof ExclamationTriangleIcon;
  iconClass: string;
  confirmVariant: 'primary' | 'danger';
}> = {
  danger: {
    icon: ShieldExclamationIcon,
    iconClass: 'bg-rose-500/10 text-rose-600',
    confirmVariant: 'danger',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    iconClass: 'bg-amber-500/10 text-amber-600',
    confirmVariant: 'danger',
  },
  info: {
    icon: InformationCircleIcon,
    iconClass: 'bg-blue-500/10 text-blue-600',
    confirmVariant: 'primary',
  },
  success: {
    icon: CheckCircleIcon,
    iconClass: 'bg-emerald-500/10 text-emerald-600',
    confirmVariant: 'primary',
  },
};

function normalizeOptions(options: ConfirmDialogOptions | string): ConfirmDialogOptions {
  return typeof options === 'string' ? { description: options } : options;
}

export function ActionDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [inputValue, setInputValue] = useState('');
  const resolverRef = useRef<((result: DialogResult) => void) | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const finish = useCallback((result: DialogResult) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setDialog(null);
    if (resolver) resolver(result);
  }, []);

  const open = useCallback((nextDialog: DialogState) => {
    return new Promise<DialogResult>((resolve) => {
      // A second request should never leave the first promise hanging.
      resolverRef.current?.(nextDialog.kind === 'confirm' ? false : null);
      resolverRef.current = resolve;
      setInputValue(nextDialog.kind === 'prompt' ? nextDialog.defaultValue || '' : '');
      setDialog(nextDialog);
    });
  }, []);

  const confirm = useCallback(async (options: ConfirmDialogOptions | string) => {
    const result = await open({
      ...normalizeOptions(options),
      kind: 'confirm',
      title: normalizeOptions(options).title || 'Xác nhận thao tác',
    });
    return result === true;
  }, [open]);

  const prompt = useCallback(async (options: PromptDialogOptions | string) => {
    const normalized = normalizeOptions(options) as PromptDialogOptions;
    const result = await open({
      ...normalized,
      kind: 'prompt',
      title: normalized.title || 'Nhập thông tin xác nhận',
    });
    return typeof result === 'string' ? result : null;
  }, [open]);

  useEffect(() => {
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish(dialog.kind === 'confirm' ? false : null);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [dialog, finish]);

  const dialogError = dialog?.kind === 'prompt'
    ? dialog.validate?.(inputValue) || (dialog.required && !inputValue.trim() ? 'Vui lòng nhập thông tin.' : undefined)
    : undefined;
  const config = dialog ? VARIANT_CONFIG[dialog.variant || (dialog.kind === 'prompt' ? 'warning' : 'info')] : null;
  const Icon = config?.icon;

  return (
    <ActionDialogContext.Provider value={{ confirm, prompt }}>
      {children}
      {dialog && config && Icon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm animate-in fade-in duration-150" role="presentation">
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="action-dialog-title"
            aria-describedby="action-dialog-description"
          >
            <div className="flex items-start gap-3 border-b border-[var(--color-border)] px-5 py-4">
              <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.iconClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="action-dialog-title" className="text-base font-bold text-[var(--color-text-primary)]">
                  {dialog.title}
                </h2>
                <p id="action-dialog-description" className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">
                  {dialog.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => finish(dialog.kind === 'confirm' ? false : null)}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]"
                aria-label="Đóng hộp thoại"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {dialog.kind === 'prompt' && (
              <div className="px-5 pt-4">
                <label htmlFor="action-dialog-input" className="mb-1.5 block text-sm font-semibold text-[var(--color-text-secondary)]">
                  {dialog.inputLabel || 'Nội dung'}
                  {dialog.required && <span className="ml-1 text-danger-500">*</span>}
                </label>
                {dialog.multiline ? (
                  <textarea
                    ref={inputRef as RefObject<HTMLTextAreaElement>}
                    id="action-dialog-input"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    placeholder={dialog.placeholder}
                    rows={4}
                    className={`block w-full resize-y rounded-xl border bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] focus:outline-none focus:ring-4 focus:ring-primary-500/10 ${dialogError ? 'border-danger-500' : 'border-[var(--color-border)] focus:border-primary-500'}`}
                  />
                ) : (
                  <input
                    ref={inputRef as RefObject<HTMLInputElement>}
                    id="action-dialog-input"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    placeholder={dialog.placeholder}
                    className={`block w-full rounded-xl border bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] focus:outline-none focus:ring-4 focus:ring-primary-500/10 ${dialogError ? 'border-danger-500' : 'border-[var(--color-border)] focus:border-primary-500'}`}
                  />
                )}
                {dialogError && <p className="mt-1.5 text-xs font-medium text-danger-500">{dialogError}</p>}
              </div>
            )}

            <div className="flex justify-end gap-3 px-5 py-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => finish(dialog.kind === 'confirm' ? false : null)}
              >
                {dialog.cancelLabel || 'Hủy'}
              </Button>
              <Button
                type="button"
                variant={config.confirmVariant}
                disabled={dialog.kind === 'prompt' && Boolean(dialogError)}
                onClick={() => finish(dialog.kind === 'prompt' ? inputValue : true)}
              >
                {dialog.confirmLabel || 'Xác nhận'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ActionDialogContext.Provider>
  );
}

export function useActionDialog() {
  const context = useContext(ActionDialogContext);
  if (!context) {
    throw new Error('useActionDialog phải được sử dụng bên trong ActionDialogProvider');
  }
  return context;
}
