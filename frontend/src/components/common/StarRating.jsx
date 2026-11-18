import React from 'react';
import { Star } from 'lucide-react';

const sizeMap = {
  xs: { star: 'h-3 w-3', text: 'text-[11px]' },
  sm: { star: 'h-3.5 w-3.5', text: 'text-xs' },
  md: { star: 'h-4 w-4', text: 'text-sm' },
  lg: { star: 'h-5 w-5', text: 'text-base' },
};

export const StarRating = ({
  rating = 0,
  count,
  size = 'sm',
  showCount = true,
  showValue = true,
  className = '',
}) => {
  const normalized = Math.max(0, Math.min(5, Number(rating) || 0));
  const sizes = sizeMap[size] || sizeMap.sm;
  const percent = (normalized / 5) * 100;

  return (
    <div className={`flex items-center gap-1.5 ${className}`} aria-label={`${normalized} out of 5 stars`}>
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex gap-0.5 text-ink-200">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={`${sizes.star} fill-current`} strokeWidth={0} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-500"
          style={{ width: `${percent}%` }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={`${sizes.star} shrink-0 fill-current`} strokeWidth={0} />
          ))}
        </span>
      </span>

      {showValue && (
        <span className={`font-extrabold text-ink ${sizes.text}`}>
          {normalized > 0 ? normalized.toFixed(1) : 'New'}
        </span>
      )}
      {showCount && typeof count === 'number' && count > 0 && (
        <span className={`font-semibold text-ink-400 ${sizes.text}`}>
          ({count})
        </span>
      )}
    </div>
  );
};
