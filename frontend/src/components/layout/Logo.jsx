import React from 'react';
import { Link } from 'react-router';

export const Logo = ({ light = false, compact = false, to = '/' }) => {
  return (
    <Link to={to} className="group flex items-center gap-2.5" aria-label="Wanderlust home">
      <span
        className={`relative grid h-9 w-9 place-items-center rounded-full transition-transform duration-500 ease-smooth group-hover:rotate-[18deg] ${
          light ? 'bg-cream-100 text-ink' : 'bg-ink text-cream-100'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-[19px] w-[19px]" aria-hidden="true">
          <path
            d="M20.2 4.6c-1.5-1.5-7.4.2-10.3 3.1-2.9 2.9-4.6 8.8-3.1 10.3 1.5 1.5 7.4-.2 10.3-3.1 2.9-2.9 4.6-8.8 3.1-10.3Z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M9.6 14.4c.8-2.2 2-4.1 3.6-5.7"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display text-[21px] tracking-[-0.035em] ${
              light ? 'text-cream-50' : 'text-ink'
            }`}
          >
            Wanderlust
          </span>
          <span
            className={`mt-1 text-[8px] font-extrabold uppercase tracking-[0.3em] ${
              light ? 'text-cream-200/60' : 'text-ink-400'
            }`}
          >
            Travel Atelier
          </span>
        </span>
      )}
    </Link>
  );
};
