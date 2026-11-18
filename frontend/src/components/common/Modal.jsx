import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  eyebrow,
  children,
  maxWidth = 'max-w-xl',
  hideClose = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : 'Dialog'}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        tabIndex={-1}
      />

      <div
        className={`relative z-10 flex max-h-[94vh] w-full ${maxWidth} animate-scale-in flex-col overflow-hidden rounded-t-[1.8rem] border border-ink/10 bg-cream-50 shadow-lift sm:rounded-[1.8rem]`}
      >
        {(title || subtitle || !hideClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-ink/10 bg-cream-100/60 px-6 py-5">
            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-clay-600">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="mt-1 font-display text-[1.55rem] leading-tight text-ink">{title}</h2>
              )}
              {subtitle && (
                <p className="mt-0.5 line-clamp-1 text-[11.5px] font-semibold text-ink-400">
                  {subtitle}
                </p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/10 bg-cream-50 text-ink-500 transition hover:bg-ink hover:text-cream-50"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
};
