import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Clock3, Compass, Flame, ShieldCheck, Sparkles } from 'lucide-react';
import { packageApi } from '../api/packageApi';
import { PackageCard } from '../components/packages/PackageCard';
import { Reveal } from '../components/ui/Reveal';

const promises = [
  { icon: Clock3, label: 'Live seat counts', copy: 'Availability updates the moment a place is reserved.' },
  { icon: ShieldCheck, label: 'Secure hold', copy: 'Your seats are held while you complete checkout.' },
  { icon: Sparkles, label: 'No surprise fees', copy: 'The price you see is the price you pay per traveller.' },
];

export const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await packageApi.getAll({ limit: 6, sort: 'rating_desc' });
        if (alive) setDeals(res.data?.packages || []);
      } catch (err) {
        console.error('Failed to load deals', err);
        if (alive) setError('Seasonal releases could not be loaded. Please try again shortly.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchDeals();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative overflow-hidden bg-forest-deep text-cream-100">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/90 to-forest/40" />
        <div className="container-x relative py-16 sm:py-24">
          <Reveal>
            <span className="eyebrow eyebrow-light">Limited releases</span>
            <h1 className="display-hero mt-5 max-w-3xl text-[3rem] text-cream-50 sm:text-[4.5rem]">
              The departures we would{' '}
              <em className="font-light italic text-clay-300">book ourselves.</em>
            </h1>
            <p className="mt-5 max-w-xl text-[14.5px] leading-[1.85] text-cream-200/70">
              A rotating edit of our highest-rated journeys with a handful of seats still open.
              When they are gone, they are gone — we do not run these dates twice.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/packages" className="btn-light">
                See all journeys <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-cream-100/20 px-4 py-2 text-[11px] font-bold text-cream-200/70">
                <Flame className="h-3.5 w-3.5 text-clay-300" />
                {deals.length ? `${deals.length} current releases` : 'Live availability'}
              </span>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-3 border-t border-cream-100/10 pt-6 sm:grid-cols-3">
            {promises.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-clay-300" strokeWidth={1.7} />
                  <div>
                    <p className="text-[11px] font-extrabold text-cream-50">{item.label}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-cream-200/55">
                      {item.copy}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container-x py-14 sm:py-20">
        <div className="flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Open right now</span>
            <h2 className="mt-3 font-display text-4xl leading-tight text-ink">
              Seasonal allocations
            </h2>
          </div>
          <p className="max-w-xs text-[12px] leading-relaxed text-ink-400">
            Sorted by traveller rating. Seat counts are live and reserved at checkout.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-ink/10 bg-cream-50">
                <div className="skeleton aspect-[4/3] rounded-none" />
                <div className="space-y-3 p-5">
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-5 w-4/5" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-16 text-center">
            <p className="text-sm font-bold text-rose-700">{error}</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-ink/15 bg-cream-50 px-6 py-20 text-center">
            <Compass className="mx-auto h-9 w-9 text-ink-300" />
            <h3 className="mt-4 font-display text-2xl text-ink">New dates are being prepared.</h3>
            <p className="mt-2 text-[13px] text-ink-400">
              Browse the full collection in the meantime.
            </p>
            <Link to="/packages" className="btn-ink btn-sm mt-5">
              Explore journeys
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((pkg, index) => (
              <Reveal key={pkg._id || pkg.id} delay={(index % 3) * 70}>
                <PackageCard pkg={pkg} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Closing CTA */}
      <section className="container-x pb-20">
        <Reveal>
          <div className="flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-cream-200/70 px-7 py-8 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-clay-600">
                Nothing quite right?
              </p>
              <h2 className="mt-2 font-display text-3xl leading-tight text-ink">
                We will design the dates around you.
              </h2>
              <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
                Private departures are available on most journeys, with your own guide and a
                pace that suits your group.
              </p>
            </div>
            <Link to="/contact" className="btn-ink shrink-0">
              Plan a private departure <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
