import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PackageForm } from './PackageForm';

export function PackageFormDialog({ projectId, onClose }: {
  projectId: number;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';

    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-0 text-[var(--color-text-primary)] shadow-2xl backdrop:bg-black/50"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
        <h2 id={titleId} className="text-xl font-bold">Tạo gói thầu mới</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng biểu mẫu"
          className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
        >
          <XMarkIcon className="size-5" />
        </button>
      </div>
      <div className="p-4 sm:p-6">
        <PackageForm projectId={projectId} onClose={onClose} />
      </div>
    </dialog>,
    document.body,
  );
}
