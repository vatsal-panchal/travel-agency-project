import React from 'react';

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  light = false,
  className = '',
}) => {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start';
  const descAlignment = align === 'center' ? 'mx-auto' : '';

  return (
    <div
      className={`flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className={`flex flex-col ${alignment}`}>
        {eyebrow && (
          <span className={`eyebrow ${light ? 'eyebrow-light' : ''}`}>{eyebrow}</span>
        )}
        {title && (
          <h2
            className={`section-title mt-3 ${light ? 'text-cream-50' : 'text-ink'} ${
              align === 'center' ? 'text-balance' : ''
            }`}
          >
            {title}
          </h2>
        )}
        {description && (
          <p
            className={`section-sub text-pretty ${descAlignment} ${
              light ? 'text-cream-200/75' : ''
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
