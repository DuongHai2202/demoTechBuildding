import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-[var(--color-text-secondary)]">
            {label}
            {props.required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-[var(--color-text-muted)]">{leftIcon}</span>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={`block w-full rounded-xl border bg-[var(--color-surface)] px-3.5 py-2.5 text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] transition-[border-color,box-shadow] duration-150 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:bg-[var(--color-surface-alt)] disabled:text-[var(--color-text-disabled)] ${
              error ? 'border-danger-500' : 'border-[var(--color-border)]'
            } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p id={errorId} className="mt-1.5 text-xs font-medium text-danger-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
