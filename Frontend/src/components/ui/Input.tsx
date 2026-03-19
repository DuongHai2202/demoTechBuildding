import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
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
            className={`block w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-[var(--color-surface-alt)] disabled:text-[var(--color-text-disabled)] ${
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
        {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
