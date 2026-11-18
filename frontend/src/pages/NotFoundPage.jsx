import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Compass, MapPin } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="container-x flex min-h-[72vh] items-center justify-center py-16">
        <div className="max-w-xl text-center">
          <span className="eyebrow justify-center">Off the map</span>
          <p className="mt-6 font-display text-[7rem] leading-none text-ink/[0.08] sm:text-[10rem]">
            404
          </p>
          <div className="-mt-6 sm:-mt-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-ink/10 bg-cream-50 text-clay-600 shadow-soft">
              <Compass className="h-6 w-6" strokeWidth={1.6} />
            </span>
            <h1 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
              This path does not go anywhere.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-ink-500">
              The page you were looking for has moved, closed, or never existed. The good news:
              there are far more interesting places to be.
            </p>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/" className="btn-ink">
              <ArrowLeft className="h-4 w-4" /> Back home
            </Link>
            <Link to="/packages" className="btn-outline">
              Browse journeys <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-cream-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
            <MapPin className="h-3.5 w-3.5 text-clay-500" />
            Need a hand? Our travel team can help.
          </div>
        </div>
      </div>
    </div>
  );
};
