import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../layout/Logo';

export const AuthFrame = ({ image, imageAlt, quote, author, children }) => {
  return (
    <div className="container-x py-8 sm:py-12 lg:py-16">
      <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-cream-50 shadow-card lg:grid lg:min-h-[640px] lg:grid-cols-[1.02fr_0.98fr]">
        {/* Editorial panel */}
        <div className="relative hidden min-h-full overflow-hidden bg-forest-deep lg:block">
          <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/20" />
          <div className="relative flex h-full flex-col justify-between p-9">
            <Logo light />
            <div>
              <p className="font-display text-[2.1rem] leading-[1.15] text-cream-50">“{quote}”</p>
              <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-cream-200/55">
                {author}
              </p>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="relative flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
          <Link
            to="/"
            className="mb-8 inline-flex w-fit items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-400 transition hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to journeys
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
};
